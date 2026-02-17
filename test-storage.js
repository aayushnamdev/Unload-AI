// Test if storage bucket exists
// Run with: node test-storage.js

require('dotenv').config({ path: '.env' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file')
  process.exit(1)
}

console.log('🔍 Testing Supabase Storage...')
console.log('Project URL:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseKey)

async function testStorage() {
  try {
    // List all buckets
    console.log('\n📦 Fetching buckets...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error('❌ Error fetching buckets:', bucketsError)
      return
    }

    if (!buckets || buckets.length === 0) {
      console.log('⚠️  NO BUCKETS FOUND!')
      console.log('\n👉 You need to create the bucket manually:')
      console.log('   1. Go to: https://supabase.com/dashboard/project/josavjgczsfmzjnriuoj/storage/buckets')
      console.log('   2. Click "New bucket"')
      console.log('   3. Name: voice-recordings')
      console.log('   4. Toggle "Public bucket" ON')
      console.log('   5. Click "Create bucket"')
      return
    }

    console.log(`✅ Found ${buckets.length} bucket(s):`)
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? 'Public' : 'Private'})`)
    })

    // Check for voice-recordings bucket
    const voiceBucket = buckets.find(b => b.name === 'voice-recordings')

    if (voiceBucket) {
      console.log('\n✅ voice-recordings bucket EXISTS!')
      console.log('   Public:', voiceBucket.public ? 'Yes ✅' : 'No ❌ (should be public)')

      // Try to upload a test file
      console.log('\n🧪 Testing upload...')
      const testFile = Buffer.from('test audio data')
      const { data, error } = await supabase.storage
        .from('voice-recordings')
        .upload(`test-${Date.now()}.txt`, testFile, {
          contentType: 'text/plain',
          upsert: true
        })

      if (error) {
        console.error('❌ Upload failed:', error.message)
        console.log('\n👉 You need to add storage policies:')
        console.log('   Go to SQL Editor and run:')
        console.log(`
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'voice-recordings');

CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'voice-recordings');
        `)
      } else {
        console.log('✅ Upload successful!')
        console.log('   Path:', data.path)
      }
    } else {
      console.log('\n❌ voice-recordings bucket NOT FOUND!')
      console.log('\n👉 Create it manually:')
      console.log('   1. Go to: https://supabase.com/dashboard/project/josavjgczsfmzjnriuoj/storage/buckets')
      console.log('   2. Click "New bucket"')
      console.log('   3. Name: voice-recordings')
      console.log('   4. Toggle "Public bucket" ON')
      console.log('   5. Click "Create bucket"')
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

testStorage()
