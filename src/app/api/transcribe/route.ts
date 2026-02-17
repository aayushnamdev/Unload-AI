import { NextRequest, NextResponse } from 'next/server'
import { createClient as createDeepgram } from '@deepgram/sdk'
import { createClient } from '@/lib/supabase/server'
import { MAX_VOICE_FILE_SIZE } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get audio file from form data
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Validate file size
    if (audioFile.size > MAX_VOICE_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_VOICE_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      )
    }

    // Upload audio to Supabase Storage
    const fileName = `${user.id}/${Date.now()}-${audioFile.name}`
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer())

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('voice-recordings')
      .upload(fileName, audioBuffer, {
        contentType: audioFile.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload audio file' }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('voice-recordings').getPublicUrl(uploadData.path)

    // Transcribe with Deepgram
    const deepgramApiKey = process.env.DEEPGRAM_API_KEY
    if (!deepgramApiKey) {
      return NextResponse.json(
        { error: 'Deepgram API key not configured' },
        { status: 500 }
      )
    }

    const deepgram = createDeepgram(deepgramApiKey)

    // Transcribe audio
    const { result, error: transcribeError } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      {
        model: 'nova-2',
        smart_format: true,
        punctuate: true,
        diarize: false,
      }
    )

    if (transcribeError) {
      console.error('Deepgram transcription error:', transcribeError)
      return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
    }

    const transcription = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript

    if (!transcription) {
      return NextResponse.json(
        { error: 'No transcription generated' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      transcription,
      audioUrl: publicUrl,
    })
  } catch (error: any) {
    console.error('Transcription API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
