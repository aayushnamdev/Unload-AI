import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractItemsFromDump } from '@/lib/ai/claude'
import { FOCUS_MODE_PROMPT, ORGANIZER_MODE_PROMPT } from '@/lib/ai/prompts/extraction'
import { ExtractedItem, FocusModeResponse, OrganizerModeResponse, ExtractionResponse } from '@/types/ai'
import { MAX_THOUGHT_DUMP_LENGTH } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { content, source, voice_file_url, mode = 'focus' } = body

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    if (content.length > MAX_THOUGHT_DUMP_LENGTH) {
      return NextResponse.json(
        { error: `Content exceeds maximum length of ${MAX_THOUGHT_DUMP_LENGTH} characters` },
        { status: 400 }
      )
    }

    // Step 1: Store raw dump
    const { data: thoughtDump, error: dumpError } = await supabase
      .from('thought_dumps')
      // @ts-ignore
      .insert({
        user_id: user.id,
        content,
        source,
        voice_file_url: voice_file_url || null,
        transcription_status: source === 'voice' ? 'completed' : null,
        processing_status: 'processing',
        metadata: { mode }
      })
      .select()
      .single()

    if (dumpError || !thoughtDump) {
      return NextResponse.json({ error: 'Failed to store thought dump' }, { status: 500 })
    }

    // Step 2: Select Prompt
    const systemPrompt = mode === 'organizer' ? ORGANIZER_MODE_PROMPT : FOCUS_MODE_PROMPT

    // Step 3: Call Claude
    let extraction: ExtractionResponse
    try {
      // We skip "recent context" for now to keep it simple and focused as requested
      extraction = await extractItemsFromDump({
        content,
        systemPrompt
      })
    } catch (error: any) {
      console.error('Extraction error:', error)
      await supabase
        .from('thought_dumps')
        // @ts-ignore
        .update({ processing_status: 'failed', processing_error: error.message })
        // @ts-ignore
        .eq('id', (thoughtDump as any).id)

      return NextResponse.json({ error: error.message || 'Processing failed' }, { status: 500 })
    }

    // Step 4: Normalize Items
    let itemsToInsert: any[] = []

    if (mode === 'focus') {
      const focusResponse = extraction as FocusModeResponse
      // @ts-ignore
      const top3 = (focusResponse.top_3 || []).map(item => ({ ...item, priority: 'high', tags: ['#Focus'] }))
      // @ts-ignore
      const bench = (focusResponse.bench || []).map(item => ({ ...item, priority: 'medium', tags: ['#Bench'] }))
      const allItems = [...top3, ...bench]

      // @ts-ignore
      itemsToInsert = prepareItemsForInsert(allItems, user.id, (thoughtDump as any).id)
    } else {
      const organizerResponse = extraction as OrganizerModeResponse
      // @ts-ignore
      itemsToInsert = prepareItemsForInsert(organizerResponse.items || [], user.id, (thoughtDump as any).id)
    }

    // Step 5: Insert Items
    if (itemsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('items')
        // @ts-ignore
        .insert(itemsToInsert)

      if (insertError) {
        console.error('Error inserting items:', insertError)
        throw new Error('Failed to save items')
      }
    }

    // Step 6: Mark Complete
    await supabase
      .from('thought_dumps')
      // @ts-ignore
      .update({ processing_status: 'completed' })
      // @ts-ignore
      .eq('id', thoughtDump.id)

    return NextResponse.json({
      success: true,
      thought_dump_id: (thoughtDump as any).id,
      extracted_count: itemsToInsert.length
    })

  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 })
  }
}

function whenToDeadline(when?: string, explicitDeadline?: string): string | null {
  if (explicitDeadline) return explicitDeadline
  if (!when) return null
  const now = new Date()
  switch (when) {
    case 'today': {
      now.setHours(23, 59, 0, 0)
      return now.toISOString()
    }
    case 'tomorrow': {
      now.setDate(now.getDate() + 1)
      now.setHours(9, 0, 0, 0)
      return now.toISOString()
    }
    case 'upcoming': {
      now.setDate(now.getDate() + 3)
      now.setHours(9, 0, 0, 0)
      return now.toISOString()
    }
    case 'someday':
    default:
      return null
  }
}

function prepareItemsForInsert(items: ExtractedItem[], userId: string, dumpId: string) {
  return items.map(item => {
    // Keep only the human-readable description — metadata goes into structured fields
    let description = item.description || ''
    if (item.estimated_time) description = `${item.estimated_time}${description ? ' · ' + description : ''}`

    return {
      user_id: userId,
      thought_dump_id: dumpId,
      type: item.type || 'task',
      title: item.title,
      description: description.trim() || null,
      priority: item.priority || 'medium',
      status: 'active',
      deadline_at: whenToDeadline(item.when, item.deadline_at)
    }
  })
}
