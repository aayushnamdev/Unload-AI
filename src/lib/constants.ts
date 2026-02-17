// App-wide constants

export const APP_NAME = 'Unload AI'
export const APP_DESCRIPTION = 'AI-powered cognitive relief'

// API Rate Limits
export const MAX_THOUGHT_DUMP_LENGTH = 20000 // characters (~10 min of speech)
export const MAX_VOICE_RECORDING_DURATION = 600 // seconds (10 minutes)
export const MAX_VOICE_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Clarity Settings
export const MAX_FOCUS_ITEMS = 3
export const DEFAULT_TIMEZONE = 'America/New_York'

// Item Effort Levels (in minutes - for UI display)
export const EFFORT_ESTIMATES = {
  tiny: '5-15 min',
  small: '15-30 min',
  medium: '30-60 min',
  large: '1-2 hours',
} as const

// Processing Statuses
export const PROCESSING_STATUSES = {
  pending: 'Pending',
  processing: 'Processing...',
  completed: 'Completed',
  failed: 'Failed',
} as const

// Item Types
export const ITEM_TYPES = {
  task: 'Task',
  commitment: 'Commitment',
  deadline: 'Deadline',
  reminder: 'Reminder',
} as const

// Supabase Storage Buckets
export const STORAGE_BUCKETS = {
  voiceRecordings: 'voice-recordings',
} as const
