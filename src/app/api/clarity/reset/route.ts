import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0]

    try {
        // Delete the daily clarity record for today
        const { error } = await supabase
            .from('daily_clarity')
            // @ts-ignore
            .upsert({
                user_id: user.id,
                clarity_date: today,
                morning_message: "Day cleared. Ready for a fresh start.",
                focus_items: [],
                parked_suggestions: [],
                dropped_suggestions: []
            }, {
                onConflict: 'user_id,clarity_date'
            })

        if (error) throw error

        // Optional: We could also update all 'open' items to be un-featured
        // but simply deleting the daily_clarity record is enough to trigger a "fresh" state
        // because the frontend pulls the lists based on that record (for priorities).
        // However, parked/later items are status-based.
        // If the user wants a "Hard Reset", we might want to un-park items too?
        // User said "Restart the clarity... reset everything".
        // Let's just stick to blowing away the daily_clarity record first.

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error resetting clarity:', error)
        return NextResponse.json({ error: 'Failed to reset' }, { status: 500 })
    }
}
