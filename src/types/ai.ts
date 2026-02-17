/**
 * AI Response Types
 */

export type ItemType = 'task' | 'commitment' | 'deadline' | 'reminder'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type EffortLevel = 'tiny' | 'small' | 'medium' | 'large'

// Energy Level (Deprecated in new modes, keeping for backward compat if needed)
export type EnergyLevel = 'high' | 'medium' | 'low' | 'recovery'

export interface ExtractedItem {
  type: ItemType
  title: string
  description?: string
  original_fragment?: string
  priority?: Priority
  effort_level?: EffortLevel
  energy_level?: EnergyLevel
  tags?: string[]
  subtasks?: string[]
  suggested_next_step?: string
  deadline_hint?: string
  estimated_time?: string // New for Focus Mode
  when?: 'today' | 'tomorrow' | 'upcoming' | 'someday' // New for Organizer Mode
  deadline_at?: string // New for Organizer Mode
}

export interface FocusModeResponse {
  top_3: ExtractedItem[]
  bench: ExtractedItem[]
}

export interface OrganizerModeResponse {
  items: ExtractedItem[]
}

// Union type for the extraction result
export type ExtractionResponse = FocusModeResponse | OrganizerModeResponse

export interface ProcessingResult {
  success: boolean
  thought_dump_id: string
  extracted_items_count: number
  top_3_count?: number
  bench_count?: number
}

// Clarity types (Can likely be removed or repurposed later)
export interface ClarityItem {
  id: string
  title: string
  type: ItemType
  priority: Priority
  effort_level: EffortLevel
  suggested_next_step?: string
  original_fragment?: string
  deadline_at?: string
}

export interface DailyClarityResponse {
  morning_message: string
  focus_items: ClarityItem[]
  parked_suggestions: ClarityItem[]
  dropped_suggestions: ClarityItem[]
  emotional_context?: string
}
