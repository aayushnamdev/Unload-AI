-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create thought_dumps table (raw captures)
CREATE TABLE IF NOT EXISTS thought_dumps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('text', 'voice')),
  voice_file_url TEXT,
  transcription_status TEXT CHECK (transcription_status IN ('pending', 'completed', 'failed')),
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  processing_error TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create items table (extracted actionable items)
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  thought_dump_id UUID REFERENCES thought_dumps(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('task', 'commitment', 'deadline', 'reminder')),
  title TEXT NOT NULL,
  description TEXT,
  original_fragment TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'done', 'parked', 'dropped')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  effort_level TEXT CHECK (effort_level IN ('tiny', 'small', 'medium', 'large')),
  suggested_next_step TEXT,
  deadline_at TIMESTAMP WITH TIME ZONE,
  parked_until TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  dropped_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_clarity table (AI-generated daily summaries)
CREATE TABLE IF NOT EXISTS daily_clarity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  clarity_date DATE NOT NULL,
  morning_message TEXT NOT NULL,
  focus_items UUID[] DEFAULT ARRAY[]::UUID[],
  parked_suggestions UUID[] DEFAULT ARRAY[]::UUID[],
  dropped_suggestions UUID[] DEFAULT ARRAY[]::UUID[],
  emotional_context TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, clarity_date)
);

-- Create noise_log table (acknowledged venting, not actionable)
CREATE TABLE IF NOT EXISTS noise_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  thought_dump_id UUID REFERENCES thought_dumps(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  emotional_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  acknowledgment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_thought_dumps_user_id ON thought_dumps(user_id);
CREATE INDEX IF NOT EXISTS idx_thought_dumps_created_at ON thought_dumps(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_clarity_user_date ON daily_clarity(user_id, clarity_date DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE thought_dumps ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_clarity ENABLE ROW LEVEL SECURITY;
ALTER TABLE noise_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for thought_dumps
CREATE POLICY "Users can view own thought dumps"
  ON thought_dumps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own thought dumps"
  ON thought_dumps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own thought dumps"
  ON thought_dumps FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for items
CREATE POLICY "Users can view own items"
  ON items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own items"
  ON items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items"
  ON items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own items"
  ON items FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for daily_clarity
CREATE POLICY "Users can view own clarity"
  ON daily_clarity FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clarity"
  ON daily_clarity FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clarity"
  ON daily_clarity FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for noise_log
CREATE POLICY "Users can view own noise log"
  ON noise_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own noise log"
  ON noise_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
