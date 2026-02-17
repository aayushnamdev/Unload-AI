import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateDailyClarity } from '@/lib/ai/claude'

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get today's date
    const today = new Date().toISOString().split('T')[0]

    // Check if clarity already exists for today
    const { data: existingClarity, error: clarityError } = await supabase
      .from('daily_clarity')
      .select('*')
      .eq('user_id', user.id)
      .eq('clarity_date', today)
      .single()

    if (clarityError && clarityError.code !== 'PGRST116') {
      console.error('Error fetching clarity:', clarityError)
      return NextResponse.json({ error: 'Failed to fetch clarity' }, { status: 500 })
    }

    if (existingClarity) {
      // Fetch the actual items referenced in focus_items
      // @ts-ignore
      const { data: focusItems } = await supabase
        .from('items')
        .select('*')
        // @ts-ignore
        .in('id', existingClarity.focus_items)

      return NextResponse.json({
        ...(existingClarity as any),
        focus_items_details: focusItems || [],
      })
    }

    // No clarity for today, need to generate
    return NextResponse.json({ needs_generation: true })
  } catch (error: any) {
    console.error('Clarity API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    // Get today's date
    const today = new Date().toISOString().split('T')[0]

    // Delete existing clarity for today (allow regeneration for testing)
    const { error: deleteError } = await supabase
      .from('daily_clarity')
      .delete()
      .eq('user_id', user.id)
      .eq('clarity_date', today)

    if (deleteError) {
      console.error('Error deleting old clarity:', deleteError)
    }

    // Fetch all active items
    const { data: activeItems, error: itemsError } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })

    if (itemsError) {
      console.error('Error fetching items:', itemsError)
      return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
    }

    if (!activeItems || activeItems.length === 0) {
      // No items, create minimal clarity
      const { data: clarity, error: insertError } = await supabase
        .from('daily_clarity')
        // @ts-ignore
        .upsert({
          user_id: user.id,
          clarity_date: today,
          morning_message: "Take a breath. You have nothing urgent today. Enjoy this moment of calm.",
          focus_items: [],
          parked_suggestions: [],
          dropped_suggestions: [],
        }, {
          onConflict: 'user_id,clarity_date'
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating clarity:', insertError)
        return NextResponse.json({ error: 'Failed to create clarity' }, { status: 500 })
      }

      return NextResponse.json({
        ...(clarity as any),
        focus_items_details: [],
      })
    }

    // Get recent emotional context (last 7 days from noise_log)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: recentNoise } = await supabase
      .from('noise_log')
      .select('emotional_tags')
      .eq('user_id', user.id)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10)

    const emotionalTags =
      recentNoise?.flatMap((n: any) => n.emotional_tags || []).filter(Boolean) || []
    const uniqueTags = Array.from(new Set(emotionalTags))
    const emotionalContext = uniqueTags.length > 0 ? uniqueTags.join(', ') : undefined

    // Generate clarity with Claude
    const clarityResult = await generateDailyClarity({
      activeItems: activeItems.map((item: any) => ({
        id: item.id,
        title: item.title,
        type: item.type,
        priority: item.priority,
        effort_level: item.effort_level,
        suggested_next_step: item.suggested_next_step,
        original_fragment: item.original_fragment,
      })),
      emotionalContext,
      userId: user.id,
    })

    // Store clarity in database (upsert to handle regeneration)
    const { data: clarity, error: insertError } = await supabase
      .from('daily_clarity')
      // @ts-ignore
      .upsert({
        user_id: user.id,
        clarity_date: today,
        morning_message: clarityResult.morning_message,
        focus_items: clarityResult.focus_items || [],
        parked_suggestions: clarityResult.parked_suggestions || [],
        dropped_suggestions: clarityResult.dropped_suggestions || [],
        emotional_context: clarityResult.emotional_context,
      }, {
        onConflict: 'user_id,clarity_date'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error storing clarity:', insertError)
      return NextResponse.json({ error: 'Failed to store clarity' }, { status: 500 })
    }

    // Fetch the actual items for focus
    // @ts-ignore
    const { data: focusItemsDetails } = await supabase
      .from('items')
      .select('*')
      .in('id', clarityResult.focus_items || [])

    return NextResponse.json({
      ...(clarity as any),
      focus_items_details: focusItemsDetails || [],
    })
  } catch (error: any) {
    console.error('Clarity generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate clarity' },
      { status: 500 }
    )
  }
}
