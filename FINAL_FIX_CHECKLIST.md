# MindClear - Final Fix Checklist

## Problem Summary

Your setup has 2 issues:
1. ❌ **Profile missing** - User signed up but no profile was created
2. ❌ **Storage bucket missing** - Bucket doesn't exist or has wrong name

---

## Fix 1: Create Your Profile

**Go to SQL Editor:**
https://supabase.com/dashboard/project/josavjgczsfmzjnriuoj/sql

**Run this SQL:**

```sql
-- Create profiles for all existing users
INSERT INTO profiles (id, email, full_name)
SELECT
  id,
  email,
  raw_user_meta_data->>'full_name'
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- Verify it worked
SELECT id, email, full_name, created_at FROM profiles ORDER BY created_at DESC;
```

**Expected result:** You should see your user with an email in the profiles table

---

## Fix 2: Create Storage Bucket (Correct Way)

### Option A: Via UI

1. Go to **Storage**: https://supabase.com/dashboard/project/josavjgczsfmzjnriuoj/storage/buckets
2. Click **New bucket**
3. Settings:
   - **Name**: `voice-recordings` (EXACTLY this, no typos)
   - **Public bucket**: Toggle **ON** ✅
   - **File size limit**: Leave default (50MB is fine)
   - **Allowed MIME types**: Leave empty (allows all)
4. Click **Create bucket**
5. **Verify**: You should see `voice-recordings` in the bucket list

### Option B: Via SQL

If the UI doesn't work, run this in SQL Editor:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-recordings', 'voice-recordings', true)
ON CONFLICT (id) DO NOTHING;

-- Verify it exists
SELECT id, name, public FROM storage.buckets WHERE name = 'voice-recordings';
```

---

## Fix 3: Add Storage Policies

**Run this in SQL Editor:**

```sql
-- Drop any existing policies
DROP POLICY IF EXISTS "Users can upload own recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own recordings" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;

-- Upload policy (authenticated users)
CREATE POLICY "Users can upload own recordings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'voice-recordings');

-- Read policy (authenticated users)
CREATE POLICY "Users can read own recordings"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'voice-recordings');

-- Verify policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%recording%';
```

---

## Verification Steps

After running the above:

### 1. Check Tables Exist

Go to **Table Editor**: https://supabase.com/dashboard/project/josavjgczsfmzjnriuoj/editor

You should see:
- ✅ profiles
- ✅ thought_dumps
- ✅ items
- ✅ daily_clarity
- ✅ noise_log

### 2. Check Profile Exists

In **Table Editor** → Click **profiles** table

You should see at least one row with your email

### 3. Check Bucket Exists

Go to **Storage**: https://supabase.com/dashboard/project/josavjgczsfmzjnriuoj/storage/buckets

You should see:
- ✅ voice-recordings (with "Public" badge)

### 4. Check Policies Exist

Go to **Storage** → Click **voice-recordings** → **Policies** tab

You should see:
- ✅ "Users can upload own recordings"
- ✅ "Users can read own recordings"

---

## After Fixes: Restart and Test

Once ALL the above is done:

1. Tell me "done" and I'll restart the server
2. Go to http://localhost:3000/capture
3. Try **Text mode** first (simpler test)
4. Then try **Voice mode**

---

## Common Issues

### "Bucket not found"
- Check bucket name is EXACTLY: `voice-recordings` (no spaces, no typos)
- Check bucket is public (toggle should be ON)

### "Key not present in profiles"
- Run the profile creation SQL
- Logout and login again
- Check Table Editor to see if profile exists

### "Could not find table"
- Tables weren't created
- Re-run QUICK_SETUP.sql
- Check you're in the correct Supabase project (josavjgczsfmzjnriuoj)

---

## Complete SQL (All Fixes in One)

If you want to run everything at once:

```sql
-- Fix 1: Create profiles for existing users
INSERT INTO profiles (id, email, full_name)
SELECT
  id,
  email,
  raw_user_meta_data->>'full_name'
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- Fix 2: Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-recordings', 'voice-recordings', true)
ON CONFLICT (id) DO NOTHING;

-- Fix 3: Add storage policies
DROP POLICY IF EXISTS "Users can upload own recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own recordings" ON storage.objects;

CREATE POLICY "Users can upload own recordings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'voice-recordings');

CREATE POLICY "Users can read own recordings"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'voice-recordings');

-- Verification queries
SELECT 'Profiles created:' as step, COUNT(*) as count FROM profiles;
SELECT 'Buckets created:' as step, COUNT(*) as count FROM storage.buckets WHERE name = 'voice-recordings';
SELECT 'Policies created:' as step, COUNT(*) as count FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%recording%';
```

---

**Run all the SQL above, verify everything shows up, then tell me "done" and I'll restart the server!**
