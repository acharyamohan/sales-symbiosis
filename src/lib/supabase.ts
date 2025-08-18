import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          company: string | null
          role: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          company?: string | null
          role?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          company?: string | null
          role?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          user_id: string
          name: string
          product_service: string
          target_industry: string
          ideal_job_roles: string[]
          company_size: string
          region: string
          outreach_goal: string
          brand_voice: string
          optional_triggers: string[]
          status: 'draft' | 'active' | 'paused' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          product_service: string
          target_industry: string
          ideal_job_roles: string[]
          company_size: string
          region: string
          outreach_goal: string
          brand_voice: string
          optional_triggers?: string[]
          status?: 'draft' | 'active' | 'paused' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          product_service?: string
          target_industry?: string
          ideal_job_roles?: string[]
          company_size?: string
          region?: string
          outreach_goal?: string
          brand_voice?: string
          optional_triggers?: string[]
          status?: 'draft' | 'active' | 'paused' | 'completed'
          created_at?: string
          updated_at?: string
        }
      }
      prospects: {
        Row: {
          id: string
          campaign_id: string
          name: string
          job_title: string
          company: string
          linkedin_url: string
          profile_analysis: any
          status: 'pending' | 'contacted' | 'replied' | 'converted' | 'no_response'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          name: string
          job_title: string
          company: string
          linkedin_url: string
          profile_analysis?: any
          status?: 'pending' | 'contacted' | 'replied' | 'converted' | 'no_response'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          name?: string
          job_title?: string
          company?: string
          linkedin_url?: string
          profile_analysis?: any
          status?: 'pending' | 'contacted' | 'replied' | 'converted' | 'no_response'
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          prospect_id: string
          campaign_id: string
          type: 'connection' | 'follow_up_1' | 'follow_up_2' | 'follow_up_3'
          content: string
          sent_at: string | null
          replied_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          prospect_id: string
          campaign_id: string
          type: 'connection' | 'follow_up_1' | 'follow_up_2' | 'follow_up_3'
          content: string
          sent_at?: string | null
          replied_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          prospect_id?: string
          campaign_id?: string
          type?: 'connection' | 'follow_up_1' | 'follow_up_2' | 'follow_up_3'
          content?: string
          sent_at?: string | null
          replied_at?: string | null
          created_at?: string
        }
      }
    }
  }
}