-- Fix: Create profile for existing user
-- Run this in Supabase SQL Editor

-- First, let's see what users exist
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Now create profiles for ALL existing users (in case you created multiple accounts)
INSERT INTO profiles (id, email, full_name)
SELECT
  id,
  email,
  raw_user_meta_data->>'full_name'
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- Verify profiles were created
SELECT id, email, full_name, created_at FROM profiles ORDER BY created_at DESC;
