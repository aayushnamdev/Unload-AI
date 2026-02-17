export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          timezone: string
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          timezone?: string
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          timezone?: string
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      thought_dumps: {
        Row: {
          id: string
          user_id: string
          content: string
          source: 'text' | 'voice'
          voice_file_url: string | null
          transcription_status: 'pending' | 'completed' | 'failed' | null
          processing_status: 'pending' | 'processing' | 'completed' | 'failed'
          processing_error: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          source: 'text' | 'voice'
          voice_file_url?: string | null
          transcription_status?: 'pending' | 'completed' | 'failed' | null
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
          processing_error?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          source?: 'text' | 'voice'
          voice_file_url?: string | null
          transcription_status?: 'pending' | 'completed' | 'failed' | null
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
          processing_error?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      items: {
        Row: {
          id: string
          user_id: string
          thought_dump_id: string | null
          type: 'task' | 'commitment' | 'deadline' | 'reminder'
          title: string
          description: string | null
          original_fragment: string | null
          status: 'active' | 'done' | 'parked' | 'dropped'
          priority: 'low' | 'medium' | 'high' | 'urgent' | null
          effort_level: 'tiny' | 'small' | 'medium' | 'large' | null
          suggested_next_step: string | null
          deadline_at: string | null
          parked_until: string | null
          completed_at: string | null
          dropped_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          thought_dump_id?: string | null
          type: 'task' | 'commitment' | 'deadline' | 'reminder'
          title: string
          description?: string | null
          original_fragment?: string | null
          status?: 'active' | 'done' | 'parked' | 'dropped'
          priority?: 'low' | 'medium' | 'high' | 'urgent' | null
          effort_level?: 'tiny' | 'small' | 'medium' | 'large' | null
          suggested_next_step?: string | null
          deadline_at?: string | null
          parked_until?: string | null
          completed_at?: string | null
          dropped_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          thought_dump_id?: string | null
          type?: 'task' | 'commitment' | 'deadline' | 'reminder'
          title?: string
          description?: string | null
          original_fragment?: string | null
          status?: 'active' | 'done' | 'parked' | 'dropped'
          priority?: 'low' | 'medium' | 'high' | 'urgent' | null
          effort_level?: 'tiny' | 'small' | 'medium' | 'large' | null
          suggested_next_step?: string | null
          deadline_at?: string | null
          parked_until?: string | null
          completed_at?: string | null
          dropped_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      daily_clarity: {
        Row: {
          id: string
          user_id: string
          clarity_date: string
          morning_message: string
          focus_items: string[]
          parked_suggestions: string[]
          dropped_suggestions: string[]
          emotional_context: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          clarity_date: string
          morning_message: string
          focus_items?: string[]
          parked_suggestions?: string[]
          dropped_suggestions?: string[]
          emotional_context?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          clarity_date?: string
          morning_message?: string
          focus_items?: string[]
          parked_suggestions?: string[]
          dropped_suggestions?: string[]
          emotional_context?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      noise_log: {
        Row: {
          id: string
          user_id: string
          thought_dump_id: string | null
          content: string
          emotional_tags: string[]
          acknowledgment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          thought_dump_id?: string | null
          content: string
          emotional_tags?: string[]
          acknowledgment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          thought_dump_id?: string | null
          content?: string
          emotional_tags?: string[]
          acknowledgment?: string | null
          created_at?: string
        }
      }
    }
  }
}
