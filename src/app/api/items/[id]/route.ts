import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const itemId = params.id
    const body = await request.json()
    const { action, parked_until, priority, deadline_at } = body

    // Validation: Require at least one field to update
    if (!action && !priority && deadline_at === undefined) {
      return NextResponse.json({ error: 'Action, priority, or deadline_at required' }, { status: 400 })
    }

    // If an action is provided, validate it
    if (action && !['done', 'park', 'drop', 'focus'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Verify item belongs to user
    const { data: item, error: fetchError } = await supabase
      .from('items')
      .select('*')
      .eq('id', itemId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    let updateData: any = {}

    // Handle Action-based updates
    if (action) {
      switch (action) {
        case 'done':
          updateData = {
            status: 'done',
            completed_at: new Date().toISOString(),
          }
          break

        case 'park':
          if (!parked_until) {
            return NextResponse.json(
              { error: 'parked_until date required for park action' },
              { status: 400 }
            )
          }
          updateData = {
            status: 'parked',
            parked_until,
          }
          break

        case 'drop':
          updateData = {
            status: 'dropped',
            dropped_at: new Date().toISOString(),
          }
          break

        case 'focus':
          updateData = {
            status: 'active',
            parked_until: null,
            dropped_at: null,
            completed_at: null
          }
          break
      }
    }

    // Handle direct Priority update
    if (priority) {
      if (!['high', 'medium', 'low', 'urgent'].includes(priority)) {
        return NextResponse.json({ error: 'Invalid priority' }, { status: 400 })
      }
      updateData.priority = priority
    }

    // Handle deadline_at update (null clears it → moves to Someday)
    if (deadline_at !== undefined) {
      updateData.deadline_at = deadline_at
    }

    const { data: updatedItem, error: updateError } = await supabase
      .from('items')
      // @ts-ignore
      .update(updateData)
      .eq('id', itemId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating item:', updateError)
      return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
    }

    return NextResponse.json(updatedItem)
  } catch (error: any) {
    console.error('Items API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const itemId = params.id

    const { error: deleteError } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting item:', deleteError)
      return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Items API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
