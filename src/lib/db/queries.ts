import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

type Tables = Database['public']['Tables']
type Profile = Tables['profiles']['Row']
type ThoughtDump = Tables['thought_dumps']['Row']
type Item = Tables['items']['Row']
type DailyClarity = Tables['daily_clarity']['Row']

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
}

export async function getActiveItems(userId: string): Promise<Item[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching active items:', error)
    return []
  }

  return data || []
}

export async function getItemsByStatus(
  userId: string,
  status: 'active' | 'done' | 'parked' | 'dropped'
): Promise<Item[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', userId)
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(`Error fetching ${status} items:`, error)
    return []
  }

  return data || []
}

export async function getTodayClarity(userId: string): Promise<DailyClarity | null> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('daily_clarity')
    .select('*')
    .eq('user_id', userId)
    .eq('clarity_date', today)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    console.error('Error fetching today clarity:', error)
    return null
  }

  return data
}

export async function getRecentThoughtDumps(
  userId: string,
  days: number = 7
): Promise<ThoughtDump[]> {
  const supabase = await createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('thought_dumps')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching recent thought dumps:', error)
    return []
  }

  return data || []
}

// Note: This function has type inference issues with Supabase's update types
// Will be implemented in API routes where we can use proper type casting
export async function updateItemStatus(
  itemId: string,
  status: 'active' | 'done' | 'parked' | 'dropped',
  updates: {
    parked_until?: string
    completed_at?: string
    dropped_at?: string
  } = {}
): Promise<Item | null> {
  // Placeholder - will implement in API routes
  console.log('updateItemStatus called with:', { itemId, status, updates })
  return null
}
