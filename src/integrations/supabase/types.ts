export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      adhd_assessments: {
        Row: {
          ai_report: string | null
          completed_by: string
          created_at: string
          id: string
          instrument: string
          raw_responses: Json
          scores: Json
          severity: string | null
          subject_age: number | null
          subtype: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_report?: string | null
          completed_by?: string
          created_at?: string
          id?: string
          instrument: string
          raw_responses?: Json
          scores?: Json
          severity?: string | null
          subject_age?: number | null
          subtype?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_report?: string | null
          completed_by?: string
          created_at?: string
          id?: string
          instrument?: string
          raw_responses?: Json
          scores?: Json
          severity?: string | null
          subject_age?: number | null
          subtype?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      adhd_daily_reports: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          overall_rating: number | null
          report_date: string
          targets: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          overall_rating?: number | null
          report_date?: string
          targets?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          overall_rating?: number | null
          report_date?: string
          targets?: Json
          user_id?: string
        }
        Relationships: []
      }
      adhd_day_reports: {
        Row: {
          ai_report: string | null
          created_at: string
          day_id: string
          id: string
          metrics: Json | null
          program_id: string
          recommendations: string | null
          user_id: string
        }
        Insert: {
          ai_report?: string | null
          created_at?: string
          day_id: string
          id?: string
          metrics?: Json | null
          program_id: string
          recommendations?: string | null
          user_id: string
        }
        Update: {
          ai_report?: string | null
          created_at?: string
          day_id?: string
          id?: string
          metrics?: Json | null
          program_id?: string
          recommendations?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "adhd_day_reports_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "adhd_program_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adhd_day_reports_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "adhd_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      adhd_diagnostic_reports: {
        Row: {
          ai_report: string | null
          battery_session_ids: string[]
          child_profile_id: string | null
          created_at: string
          dsm_category: string | null
          id: string
          metrics: Json
          recommendations: Json | null
          screening_id: string | null
          share_token: string | null
          user_id: string
        }
        Insert: {
          ai_report?: string | null
          battery_session_ids?: string[]
          child_profile_id?: string | null
          created_at?: string
          dsm_category?: string | null
          id?: string
          metrics?: Json
          recommendations?: Json | null
          screening_id?: string | null
          share_token?: string | null
          user_id: string
        }
        Update: {
          ai_report?: string | null
          battery_session_ids?: string[]
          child_profile_id?: string | null
          created_at?: string
          dsm_category?: string | null
          id?: string
          metrics?: Json
          recommendations?: Json | null
          screening_id?: string | null
          share_token?: string | null
          user_id?: string
        }
        Relationships: []
      }
      adhd_game_sessions: {
        Row: {
          child_profile_id: string | null
          created_at: string
          difficulty: number | null
          duration_ms: number | null
          ended_at: string | null
          events: Json
          game_key: string
          id: string
          metrics: Json
          mode: string
          program_game_id: string | null
          score: number | null
          started_at: string
          summary: Json
          user_id: string
        }
        Insert: {
          child_profile_id?: string | null
          created_at?: string
          difficulty?: number | null
          duration_ms?: number | null
          ended_at?: string | null
          events?: Json
          game_key: string
          id?: string
          metrics?: Json
          mode?: string
          program_game_id?: string | null
          score?: number | null
          started_at?: string
          summary?: Json
          user_id: string
        }
        Update: {
          child_profile_id?: string | null
          created_at?: string
          difficulty?: number | null
          duration_ms?: number | null
          ended_at?: string | null
          events?: Json
          game_key?: string
          id?: string
          metrics?: Json
          mode?: string
          program_game_id?: string | null
          score?: number | null
          started_at?: string
          summary?: Json
          user_id?: string
        }
        Relationships: []
      }
      adhd_interventions: {
        Row: {
          active: boolean
          category: string
          created_at: string
          details: Json
          ended_at: string | null
          id: string
          started_at: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          category: string
          created_at?: string
          details?: Json
          ended_at?: string | null
          id?: string
          started_at?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          details?: Json
          ended_at?: string | null
          id?: string
          started_at?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      adhd_neuro_tests: {
        Row: {
          created_at: string
          duration_seconds: number
          id: string
          metrics: Json
          test_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number
          id?: string
          metrics?: Json
          test_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number
          id?: string
          metrics?: Json
          test_type?: string
          user_id?: string
        }
        Relationships: []
      }
      adhd_program_days: {
        Row: {
          created_at: string
          day_index: number
          id: string
          program_id: string
          scheduled_for: string | null
          status: string
          summary: Json | null
        }
        Insert: {
          created_at?: string
          day_index: number
          id?: string
          program_id: string
          scheduled_for?: string | null
          status?: string
          summary?: Json | null
        }
        Update: {
          created_at?: string
          day_index?: number
          id?: string
          program_id?: string
          scheduled_for?: string | null
          status?: string
          summary?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "adhd_program_days_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "adhd_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      adhd_program_games: {
        Row: {
          best_score: number | null
          completed: boolean
          created_at: string
          day_id: string
          description: string | null
          game_key: string
          id: string
          order_index: number
          params: Json | null
          target_metric: string | null
          title: string | null
        }
        Insert: {
          best_score?: number | null
          completed?: boolean
          created_at?: string
          day_id: string
          description?: string | null
          game_key: string
          id?: string
          order_index?: number
          params?: Json | null
          target_metric?: string | null
          title?: string | null
        }
        Update: {
          best_score?: number | null
          completed?: boolean
          created_at?: string
          day_id?: string
          description?: string | null
          game_key?: string
          id?: string
          order_index?: number
          params?: Json | null
          target_metric?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "adhd_program_games_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "adhd_program_days"
            referencedColumns: ["id"]
          },
        ]
      }
      adhd_programs: {
        Row: {
          ai_plan: Json | null
          child_age: number | null
          child_name: string | null
          child_profile_id: string | null
          created_at: string
          daily_minutes: number | null
          focus_areas: string[] | null
          id: string
          share_token: string | null
          status: string
          updated_at: string
          user_id: string
          weeks: number
        }
        Insert: {
          ai_plan?: Json | null
          child_age?: number | null
          child_name?: string | null
          child_profile_id?: string | null
          created_at?: string
          daily_minutes?: number | null
          focus_areas?: string[] | null
          id?: string
          share_token?: string | null
          status?: string
          updated_at?: string
          user_id: string
          weeks?: number
        }
        Update: {
          ai_plan?: Json | null
          child_age?: number | null
          child_name?: string | null
          child_profile_id?: string | null
          created_at?: string
          daily_minutes?: number | null
          focus_areas?: string[] | null
          id?: string
          share_token?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          weeks?: number
        }
        Relationships: []
      }
      adhd_training_sessions: {
        Row: {
          created_at: string
          details: Json
          duration_seconds: number
          exercise: string
          id: string
          level: number
          score: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: Json
          duration_seconds?: number
          exercise: string
          id?: string
          level?: number
          score?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          details?: Json
          duration_seconds?: number
          exercise?: string
          id?: string
          level?: number
          score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      admin_teacher_access: {
        Row: {
          access_level: Database["public"]["Enums"]["admin_teacher_access_level"]
          created_at: string
          created_by: string | null
          email: string
          id: string
          user_id: string | null
        }
        Insert: {
          access_level?: Database["public"]["Enums"]["admin_teacher_access_level"]
          created_at?: string
          created_by?: string | null
          email: string
          id?: string
          user_id?: string | null
        }
        Update: {
          access_level?: Database["public"]["Enums"]["admin_teacher_access_level"]
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ai_builder_conversations: {
        Row: {
          code_changes: Json | null
          content: string
          created_at: string | null
          id: string
          project_id: string | null
          role: string
          tenant_id: string | null
        }
        Insert: {
          code_changes?: Json | null
          content: string
          created_at?: string | null
          id?: string
          project_id?: string | null
          role: string
          tenant_id?: string | null
        }
        Update: {
          code_changes?: Json | null
          content?: string
          created_at?: string | null
          id?: string
          project_id?: string | null
          role?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_builder_conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "ai_builder_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_builder_conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_builder_files: {
        Row: {
          content: string
          created_at: string | null
          file_name: string
          file_path: string
          file_type: string
          id: string
          project_id: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          file_name: string
          file_path: string
          file_type: string
          id?: string
          project_id?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_type?: string
          id?: string
          project_id?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_builder_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "ai_builder_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_builder_files_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_builder_projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_published: boolean | null
          project_type: string | null
          publish_slug: string | null
          settings: Json | null
          supabase_anon_key: string | null
          supabase_connected: boolean | null
          supabase_url: string | null
          tenant_id: string | null
          thumbnail: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          project_type?: string | null
          publish_slug?: string | null
          settings?: Json | null
          supabase_anon_key?: string | null
          supabase_connected?: boolean | null
          supabase_url?: string | null
          tenant_id?: string | null
          thumbnail?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          project_type?: string | null
          publish_slug?: string | null
          settings?: Json | null
          supabase_anon_key?: string | null
          supabase_connected?: boolean | null
          supabase_url?: string | null
          tenant_id?: string | null
          thumbnail?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_builder_projects_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      arabic_poets: {
        Row: {
          achievements: string | null
          biography: string
          birth_year: string | null
          created_at: string
          death_year: string | null
          era: string
          famous_works: string[] | null
          full_name: string | null
          id: string
          image_url: string | null
          name: string
          region: string | null
        }
        Insert: {
          achievements?: string | null
          biography: string
          birth_year?: string | null
          created_at?: string
          death_year?: string | null
          era: string
          famous_works?: string[] | null
          full_name?: string | null
          id?: string
          image_url?: string | null
          name: string
          region?: string | null
        }
        Update: {
          achievements?: string | null
          biography?: string
          birth_year?: string | null
          created_at?: string
          death_year?: string | null
          era?: string
          famous_works?: string[] | null
          full_name?: string | null
          id?: string
          image_url?: string | null
          name?: string
          region?: string | null
        }
        Relationships: []
      }
      arabic_scholars: {
        Row: {
          category: string
          created_at: string
          death_year: string
          description: string
          id: string
          image_url: string | null
          major_works: Json | null
          name: string
        }
        Insert: {
          category: string
          created_at?: string
          death_year: string
          description: string
          id?: string
          image_url?: string | null
          major_works?: Json | null
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          death_year?: string
          description?: string
          id?: string
          image_url?: string | null
          major_works?: Json | null
          name?: string
        }
        Relationships: []
      }
      arabic_words: {
        Row: {
          category: string
          created_at: string
          derivatives: Json | null
          dialect_region: string | null
          id: string
          is_verified: boolean | null
          meaning: string
          poetry_examples: Json | null
          quran_examples: Json | null
          user_id: string | null
          votes_count: number | null
          word: string
          word_pattern: string | null
        }
        Insert: {
          category: string
          created_at?: string
          derivatives?: Json | null
          dialect_region?: string | null
          id?: string
          is_verified?: boolean | null
          meaning: string
          poetry_examples?: Json | null
          quran_examples?: Json | null
          user_id?: string | null
          votes_count?: number | null
          word: string
          word_pattern?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          derivatives?: Json | null
          dialect_region?: string | null
          id?: string
          is_verified?: boolean | null
          meaning?: string
          poetry_examples?: Json | null
          quran_examples?: Json | null
          user_id?: string | null
          votes_count?: number | null
          word?: string
          word_pattern?: string | null
        }
        Relationships: []
      }
      art_project_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          project_id: string
          user_id: string
          username: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          project_id: string
          user_id: string
          username: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          project_id?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "art_project_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "art_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      art_project_likes: {
        Row: {
          created_at: string
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "art_project_likes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "art_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      art_projects: {
        Row: {
          artist_name: string
          created_at: string
          description: string
          id: string
          image_url: string
          likes_count: number | null
          project_title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          artist_name: string
          created_at?: string
          description: string
          id?: string
          image_url: string
          likes_count?: number | null
          project_title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          artist_name?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          likes_count?: number | null
          project_title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      artists: {
        Row: {
          art_style: string | null
          biography: string
          birth_year: string | null
          created_at: string
          death_year: string | null
          famous_works: string[] | null
          id: string
          image_url: string | null
          name: string
          nationality: string | null
        }
        Insert: {
          art_style?: string | null
          biography: string
          birth_year?: string | null
          created_at?: string
          death_year?: string | null
          famous_works?: string[] | null
          id?: string
          image_url?: string | null
          name: string
          nationality?: string | null
        }
        Update: {
          art_style?: string | null
          biography?: string
          birth_year?: string | null
          created_at?: string
          death_year?: string | null
          famous_works?: string[] | null
          id?: string
          image_url?: string | null
          name?: string
          nationality?: string | null
        }
        Relationships: []
      }
      autism_child_profiles: {
        Row: {
          age_track: string | null
          age_years: number | null
          child_name: string
          cognitive_profile: string | null
          created_at: string
          functional_profile: string | null
          id: string
          last_report: Json | null
          support_level: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age_track?: string | null
          age_years?: number | null
          child_name: string
          cognitive_profile?: string | null
          created_at?: string
          functional_profile?: string | null
          id?: string
          last_report?: Json | null
          support_level?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age_track?: string | null
          age_years?: number | null
          child_name?: string
          cognitive_profile?: string | null
          created_at?: string
          functional_profile?: string | null
          id?: string
          last_report?: Json | null
          support_level?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      autism_day_reports: {
        Row: {
          day_id: string
          generated_at: string
          id: string
          raw: Json | null
          recommendations_ar: Json | null
          score: number | null
          strengths_ar: Json | null
          summary_ar: string | null
          user_id: string
          weaknesses_ar: Json | null
        }
        Insert: {
          day_id: string
          generated_at?: string
          id?: string
          raw?: Json | null
          recommendations_ar?: Json | null
          score?: number | null
          strengths_ar?: Json | null
          summary_ar?: string | null
          user_id: string
          weaknesses_ar?: Json | null
        }
        Update: {
          day_id?: string
          generated_at?: string
          id?: string
          raw?: Json | null
          recommendations_ar?: Json | null
          score?: number | null
          strengths_ar?: Json | null
          summary_ar?: string | null
          user_id?: string
          weaknesses_ar?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "autism_day_reports_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: true
            referencedRelation: "autism_program_days"
            referencedColumns: ["id"]
          },
        ]
      }
      autism_game_moves: {
        Row: {
          created_at: string
          event_type: string
          id: string
          is_correct: boolean | null
          payload: Json | null
          program_game_id: string | null
          session_id: string | null
          t_ms: number
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          is_correct?: boolean | null
          payload?: Json | null
          program_game_id?: string | null
          session_id?: string | null
          t_ms?: number
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          is_correct?: boolean | null
          payload?: Json | null
          program_game_id?: string | null
          session_id?: string | null
          t_ms?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "autism_game_moves_program_game_id_fkey"
            columns: ["program_game_id"]
            isOneToOne: false
            referencedRelation: "autism_program_games"
            referencedColumns: ["id"]
          },
        ]
      }
      autism_game_sessions: {
        Row: {
          abandoned: boolean | null
          accuracy: number | null
          child_profile_id: string | null
          created_at: string
          day_id: string | null
          difficulty: string | null
          duration_sec: number | null
          id: string
          move_count: number | null
          notes: string | null
          plan_id: string | null
          program_game_id: string | null
          program_id: string | null
          raw_metrics: Json | null
          stage: number | null
          template_id: string
          time_to_first_action_ms: number | null
          user_id: string
          wrong_attempts: number | null
        }
        Insert: {
          abandoned?: boolean | null
          accuracy?: number | null
          child_profile_id?: string | null
          created_at?: string
          day_id?: string | null
          difficulty?: string | null
          duration_sec?: number | null
          id?: string
          move_count?: number | null
          notes?: string | null
          plan_id?: string | null
          program_game_id?: string | null
          program_id?: string | null
          raw_metrics?: Json | null
          stage?: number | null
          template_id: string
          time_to_first_action_ms?: number | null
          user_id: string
          wrong_attempts?: number | null
        }
        Update: {
          abandoned?: boolean | null
          accuracy?: number | null
          child_profile_id?: string | null
          created_at?: string
          day_id?: string | null
          difficulty?: string | null
          duration_sec?: number | null
          id?: string
          move_count?: number | null
          notes?: string | null
          plan_id?: string | null
          program_game_id?: string | null
          program_id?: string | null
          raw_metrics?: Json | null
          stage?: number | null
          template_id?: string
          time_to_first_action_ms?: number | null
          user_id?: string
          wrong_attempts?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "autism_game_sessions_child_profile_id_fkey"
            columns: ["child_profile_id"]
            isOneToOne: false
            referencedRelation: "autism_child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "autism_game_sessions_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "autism_program_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "autism_game_sessions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "autism_therapy_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "autism_game_sessions_program_game_id_fkey"
            columns: ["program_game_id"]
            isOneToOne: false
            referencedRelation: "autism_program_games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "autism_game_sessions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "autism_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      autism_program_days: {
        Row: {
          created_at: string
          day_index: number
          focus_skill_ar: string | null
          id: string
          program_id: string
          rationale_ar: string | null
          theme_ar: string | null
        }
        Insert: {
          created_at?: string
          day_index: number
          focus_skill_ar?: string | null
          id?: string
          program_id: string
          rationale_ar?: string | null
          theme_ar?: string | null
        }
        Update: {
          created_at?: string
          day_index?: number
          focus_skill_ar?: string | null
          id?: string
          program_id?: string
          rationale_ar?: string | null
          theme_ar?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "autism_program_days_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "autism_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      autism_program_games: {
        Row: {
          adaptations_ar: Json | null
          ai_config: Json | null
          created_at: string
          day_id: string
          difficulty: string | null
          duration_sec: number | null
          id: string
          instructions_ar: string | null
          order_index: number
          success_criteria_ar: string | null
          target_skill_ar: string | null
          template_id: string
          title_ar: string
        }
        Insert: {
          adaptations_ar?: Json | null
          ai_config?: Json | null
          created_at?: string
          day_id: string
          difficulty?: string | null
          duration_sec?: number | null
          id?: string
          instructions_ar?: string | null
          order_index: number
          success_criteria_ar?: string | null
          target_skill_ar?: string | null
          template_id: string
          title_ar: string
        }
        Update: {
          adaptations_ar?: Json | null
          ai_config?: Json | null
          created_at?: string
          day_id?: string
          difficulty?: string | null
          duration_sec?: number | null
          id?: string
          instructions_ar?: string | null
          order_index?: number
          success_criteria_ar?: string | null
          target_skill_ar?: string | null
          template_id?: string
          title_ar?: string
        }
        Relationships: [
          {
            foreignKeyName: "autism_program_games_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "autism_program_days"
            referencedColumns: ["id"]
          },
        ]
      }
      autism_programs: {
        Row: {
          child_profile_id: string
          created_at: string
          id: string
          share_token: string
          start_date: string
          status: string
          summary_ar: string | null
          title_ar: string | null
          total_days: number
          updated_at: string
          user_id: string
        }
        Insert: {
          child_profile_id: string
          created_at?: string
          id?: string
          share_token?: string
          start_date?: string
          status?: string
          summary_ar?: string | null
          title_ar?: string | null
          total_days?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          child_profile_id?: string
          created_at?: string
          id?: string
          share_token?: string
          start_date?: string
          status?: string
          summary_ar?: string | null
          title_ar?: string | null
          total_days?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "autism_programs_child_profile_id_fkey"
            columns: ["child_profile_id"]
            isOneToOne: false
            referencedRelation: "autism_child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      autism_therapy_plans: {
        Row: {
          child_profile_id: string | null
          created_at: string
          id: string
          plan: Json
          user_id: string
        }
        Insert: {
          child_profile_id?: string | null
          created_at?: string
          id?: string
          plan: Json
          user_id: string
        }
        Update: {
          child_profile_id?: string | null
          created_at?: string
          id?: string
          plan?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "autism_therapy_plans_child_profile_id_fkey"
            columns: ["child_profile_id"]
            isOneToOne: false
            referencedRelation: "autism_child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      btec_custom_platforms: {
        Row: {
          created_at: string | null
          custom_code: string
          description: string
          id: string
          is_rendered: boolean | null
          language: string
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          custom_code: string
          description: string
          id?: string
          is_rendered?: boolean | null
          language: string
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          custom_code?: string
          description?: string
          id?: string
          is_rendered?: boolean | null
          language?: string
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      btec_project_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          project_id: string
          user_id: string
          username: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          project_id: string
          user_id: string
          username: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          project_id?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "btec_project_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "btec_student_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      btec_project_likes: {
        Row: {
          created_at: string | null
          id: string
          project_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "btec_project_likes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "btec_student_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      btec_student_projects: {
        Row: {
          created_at: string | null
          id: string
          likes_count: number | null
          programming_languages: string[]
          project_description: string
          project_idea: string
          project_images: string[] | null
          project_link: string | null
          project_name: string
          student_name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          likes_count?: number | null
          programming_languages?: string[]
          project_description: string
          project_idea: string
          project_images?: string[] | null
          project_link?: string | null
          project_name: string
          student_name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          likes_count?: number | null
          programming_languages?: string[]
          project_description?: string
          project_idea?: string
          project_images?: string[] | null
          project_link?: string | null
          project_name?: string
          student_name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      builder_app_comments: {
        Row: {
          builder_project_id: string
          comment_text: string
          content_id: string | null
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          builder_project_id: string
          comment_text: string
          content_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          builder_project_id?: string
          comment_text?: string
          content_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "builder_app_comments_builder_project_id_fkey"
            columns: ["builder_project_id"]
            isOneToOne: false
            referencedRelation: "ai_builder_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "builder_app_comments_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "builder_app_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "builder_app_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "builder_app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      builder_app_content: {
        Row: {
          author_id: string | null
          builder_project_id: string
          category: string | null
          content: string | null
          content_type: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_published: boolean | null
          likes_count: number | null
          metadata: Json | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          author_id?: string | null
          builder_project_id: string
          category?: string | null
          content?: string | null
          content_type?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          likes_count?: number | null
          metadata?: Json | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          author_id?: string | null
          builder_project_id?: string
          category?: string | null
          content?: string | null
          content_type?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          likes_count?: number | null
          metadata?: Json | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "builder_app_content_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "builder_app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "builder_app_content_builder_project_id_fkey"
            columns: ["builder_project_id"]
            isOneToOne: false
            referencedRelation: "ai_builder_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      builder_app_files: {
        Row: {
          builder_project_id: string
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          folder: string | null
          id: string
          uploaded_by: string | null
        }
        Insert: {
          builder_project_id: string
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          folder?: string | null
          id?: string
          uploaded_by?: string | null
        }
        Update: {
          builder_project_id?: string
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          folder?: string | null
          id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "builder_app_files_builder_project_id_fkey"
            columns: ["builder_project_id"]
            isOneToOne: false
            referencedRelation: "ai_builder_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "builder_app_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "builder_app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      builder_app_likes: {
        Row: {
          builder_project_id: string
          content_id: string | null
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          builder_project_id: string
          content_id?: string | null
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          builder_project_id?: string
          content_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "builder_app_likes_builder_project_id_fkey"
            columns: ["builder_project_id"]
            isOneToOne: false
            referencedRelation: "ai_builder_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "builder_app_likes_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "builder_app_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "builder_app_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "builder_app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      builder_app_sessions: {
        Row: {
          builder_project_id: string
          created_at: string | null
          expires_at: string
          id: string
          token: string
          user_id: string
        }
        Insert: {
          builder_project_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          token: string
          user_id: string
        }
        Update: {
          builder_project_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "builder_app_sessions_builder_project_id_fkey"
            columns: ["builder_project_id"]
            isOneToOne: false
            referencedRelation: "ai_builder_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "builder_app_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "builder_app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      builder_app_settings: {
        Row: {
          builder_project_id: string
          created_at: string | null
          custom_css: string | null
          custom_js: string | null
          features: Json | null
          id: string
          primary_color: string | null
          secondary_color: string | null
          site_description: string | null
          site_logo: string | null
          site_name: string | null
          social_links: Json | null
          updated_at: string | null
        }
        Insert: {
          builder_project_id: string
          created_at?: string | null
          custom_css?: string | null
          custom_js?: string | null
          features?: Json | null
          id?: string
          primary_color?: string | null
          secondary_color?: string | null
          site_description?: string | null
          site_logo?: string | null
          site_name?: string | null
          social_links?: Json | null
          updated_at?: string | null
        }
        Update: {
          builder_project_id?: string
          created_at?: string | null
          custom_css?: string | null
          custom_js?: string | null
          features?: Json | null
          id?: string
          primary_color?: string | null
          secondary_color?: string | null
          site_description?: string | null
          site_logo?: string | null
          site_name?: string | null
          social_links?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "builder_app_settings_builder_project_id_fkey"
            columns: ["builder_project_id"]
            isOneToOne: true
            referencedRelation: "ai_builder_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      builder_app_users: {
        Row: {
          avatar_url: string | null
          builder_project_id: string
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          last_login: string | null
          metadata: Json | null
          password_hash: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          builder_project_id: string
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          last_login?: string | null
          metadata?: Json | null
          password_hash: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          builder_project_id?: string
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          last_login?: string | null
          metadata?: Json | null
          password_hash?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "builder_app_users_builder_project_id_fkey"
            columns: ["builder_project_id"]
            isOneToOne: false
            referencedRelation: "ai_builder_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      chemistry_puzzles: {
        Row: {
          correct_answer: string
          created_at: string
          created_by: string | null
          difficulty: string
          id: string
          image: string | null
          options: string[]
          points: number
          question: string
          title: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          created_by?: string | null
          difficulty: string
          id?: string
          image?: string | null
          options: string[]
          points: number
          question: string
          title: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          created_by?: string | null
          difficulty?: string
          id?: string
          image?: string | null
          options?: string[]
          points?: number
          question?: string
          title?: string
        }
        Relationships: []
      }
      class_assignments: {
        Row: {
          assignment_name: string
          created_at: string
          description: string
          grade: string
          id: string
          image_url: string | null
          school_name: string
          section: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          assignment_name: string
          created_at?: string
          description: string
          grade: string
          id?: string
          image_url?: string | null
          school_name?: string
          section: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          assignment_name?: string
          created_at?: string
          description?: string
          grade?: string
          id?: string
          image_url?: string | null
          school_name?: string
          section?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      class_chat_messages: {
        Row: {
          created_at: string
          grade: string
          id: string
          image_url: string | null
          message_text: string
          school_name: string
          section: string
          user_id: string
          user_type: string
          username: string
        }
        Insert: {
          created_at?: string
          grade: string
          id?: string
          image_url?: string | null
          message_text: string
          school_name: string
          section: string
          user_id: string
          user_type: string
          username: string
        }
        Update: {
          created_at?: string
          grade?: string
          id?: string
          image_url?: string | null
          message_text?: string
          school_name?: string
          section?: string
          user_id?: string
          user_type?: string
          username?: string
        }
        Relationships: []
      }
      class_notes: {
        Row: {
          class_section: string
          created_at: string
          description: string
          id: string
          parent_name: string
          school_name: string
          student_name: string
          teacher_id: string
          teacher_name: string
          updated_at: string
        }
        Insert: {
          class_section: string
          created_at?: string
          description: string
          id?: string
          parent_name: string
          school_name?: string
          student_name: string
          teacher_id: string
          teacher_name: string
          updated_at?: string
        }
        Update: {
          class_section?: string
          created_at?: string
          description?: string
          id?: string
          parent_name?: string
          school_name?: string
          student_name?: string
          teacher_id?: string
          teacher_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_notes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_cases: {
        Row: {
          age_years: number
          category: string
          code: string
          created_at: string
          current_medications: string[]
          gender: string | null
          history_ar: string | null
          id: string
          name_ar: string
          patient_persona_ar: string
          presenting_signs_ar: string[] | null
          reference_ar: string | null
          sensory_profile: Json | null
          severity: string
          summary_ar: string
          vitals_initial: Json
        }
        Insert: {
          age_years: number
          category: string
          code: string
          created_at?: string
          current_medications?: string[]
          gender?: string | null
          history_ar?: string | null
          id?: string
          name_ar: string
          patient_persona_ar: string
          presenting_signs_ar?: string[] | null
          reference_ar?: string | null
          sensory_profile?: Json | null
          severity: string
          summary_ar: string
          vitals_initial?: Json
        }
        Update: {
          age_years?: number
          category?: string
          code?: string
          created_at?: string
          current_medications?: string[]
          gender?: string | null
          history_ar?: string | null
          id?: string
          name_ar?: string
          patient_persona_ar?: string
          presenting_signs_ar?: string[] | null
          reference_ar?: string | null
          sensory_profile?: Json | null
          severity?: string
          summary_ar?: string
          vitals_initial?: Json
        }
        Relationships: []
      }
      clinical_device_uses: {
        Row: {
          ai_reading: Json
          applied_to_session: boolean
          created_at: string
          device_key: string
          id: string
          params: Json
          session_id: string
          user_id: string
        }
        Insert: {
          ai_reading?: Json
          applied_to_session?: boolean
          created_at?: string
          device_key: string
          id?: string
          params?: Json
          session_id: string
          user_id: string
        }
        Update: {
          ai_reading?: Json
          applied_to_session?: boolean
          created_at?: string
          device_key?: string
          id?: string
          params?: Json
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      clinical_devices: {
        Row: {
          applicable_specialties: string[]
          category: string
          created_at: string
          default_params: Json
          description_ar: string | null
          icon: string | null
          id: string
          key: string
          name_ar: string
          name_en: string | null
          safety_ar: string[]
          ui_kind: string
        }
        Insert: {
          applicable_specialties?: string[]
          category: string
          created_at?: string
          default_params?: Json
          description_ar?: string | null
          icon?: string | null
          id?: string
          key: string
          name_ar: string
          name_en?: string | null
          safety_ar?: string[]
          ui_kind?: string
        }
        Update: {
          applicable_specialties?: string[]
          category?: string
          created_at?: string
          default_params?: Json
          description_ar?: string | null
          icon?: string | null
          id?: string
          key?: string
          name_ar?: string
          name_en?: string | null
          safety_ar?: string[]
          ui_kind?: string
        }
        Relationships: []
      }
      clinical_intervention_trials: {
        Row: {
          ai_response: Json
          applied_to_session: boolean
          category: string
          created_at: string
          custom_label: string | null
          id: string
          intervention_id: string | null
          params: Json
          session_id: string
          user_id: string
        }
        Insert: {
          ai_response?: Json
          applied_to_session?: boolean
          category: string
          created_at?: string
          custom_label?: string | null
          id?: string
          intervention_id?: string | null
          params?: Json
          session_id: string
          user_id: string
        }
        Update: {
          ai_response?: Json
          applied_to_session?: boolean
          category?: string
          created_at?: string
          custom_label?: string | null
          id?: string
          intervention_id?: string | null
          params?: Json
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_intervention_trials_intervention_id_fkey"
            columns: ["intervention_id"]
            isOneToOne: false
            referencedRelation: "clinical_interventions_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_interventions_catalog: {
        Row: {
          category: string
          condition_keys: string[]
          contraindications_ar: string[]
          created_at: string
          default_params: Json
          evidence_level: string | null
          expected_effects: Json
          id: string
          mechanism_ar: string | null
          name_ar: string
          name_en: string | null
          references_ar: string[]
          short_ar: string | null
        }
        Insert: {
          category: string
          condition_keys?: string[]
          contraindications_ar?: string[]
          created_at?: string
          default_params?: Json
          evidence_level?: string | null
          expected_effects?: Json
          id?: string
          mechanism_ar?: string | null
          name_ar: string
          name_en?: string | null
          references_ar?: string[]
          short_ar?: string | null
        }
        Update: {
          category?: string
          condition_keys?: string[]
          contraindications_ar?: string[]
          created_at?: string
          default_params?: Json
          evidence_level?: string | null
          expected_effects?: Json
          id?: string
          mechanism_ar?: string | null
          name_ar?: string
          name_en?: string | null
          references_ar?: string[]
          short_ar?: string | null
        }
        Relationships: []
      }
      clinical_protocols: {
        Row: {
          category: string
          code: string
          created_at: string
          goal_ar: string
          id: string
          name_ar: string
          reference_ar: string | null
          scoring: Json | null
          short_ar: string
          steps: Json
        }
        Insert: {
          category: string
          code: string
          created_at?: string
          goal_ar: string
          id?: string
          name_ar: string
          reference_ar?: string | null
          scoring?: Json | null
          short_ar: string
          steps?: Json
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          goal_ar?: string
          id?: string
          name_ar?: string
          reference_ar?: string | null
          scoring?: Json | null
          short_ar?: string
          steps?: Json
        }
        Relationships: []
      }
      clinical_reports: {
        Row: {
          created_at: string
          diagnosis_ar: string | null
          id: string
          recommendations_ar: string[] | null
          references_ar: string[] | null
          rubric: Json | null
          score: number
          session_id: string
          share_token: string
          strengths_ar: string[] | null
          summary_ar: string
          user_id: string
          weaknesses_ar: string[] | null
        }
        Insert: {
          created_at?: string
          diagnosis_ar?: string | null
          id?: string
          recommendations_ar?: string[] | null
          references_ar?: string[] | null
          rubric?: Json | null
          score?: number
          session_id: string
          share_token?: string
          strengths_ar?: string[] | null
          summary_ar: string
          user_id: string
          weaknesses_ar?: string[] | null
        }
        Update: {
          created_at?: string
          diagnosis_ar?: string | null
          id?: string
          recommendations_ar?: string[] | null
          references_ar?: string[] | null
          rubric?: Json | null
          score?: number
          session_id?: string
          share_token?: string
          strengths_ar?: string[] | null
          summary_ar?: string
          user_id?: string
          weaknesses_ar?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "clinical_reports_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "clinical_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_session_events: {
        Row: {
          actor: string
          anxiety: number | null
          attention: number | null
          created_at: string
          event_type: string
          id: string
          payload: Json
          progress: number | null
          session_id: string
          t_ms: number
        }
        Insert: {
          actor: string
          anxiety?: number | null
          attention?: number | null
          created_at?: string
          event_type: string
          id?: string
          payload?: Json
          progress?: number | null
          session_id: string
          t_ms: number
        }
        Update: {
          actor?: string
          anxiety?: number | null
          attention?: number | null
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          progress?: number | null
          session_id?: string
          t_ms?: number
        }
        Relationships: [
          {
            foreignKeyName: "clinical_session_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "clinical_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_sessions: {
        Row: {
          anxiety: number
          attention: number
          case_id: string
          current_step: number
          ended_at: string | null
          free_intent: Json | null
          id: string
          mode: string
          progress: number
          protocol_id: string | null
          started_at: string
          status: string
          user_id: string
          vitals_state: Json
        }
        Insert: {
          anxiety?: number
          attention?: number
          case_id: string
          current_step?: number
          ended_at?: string | null
          free_intent?: Json | null
          id?: string
          mode?: string
          progress?: number
          protocol_id?: string | null
          started_at?: string
          status?: string
          user_id: string
          vitals_state?: Json
        }
        Update: {
          anxiety?: number
          attention?: number
          case_id?: string
          current_step?: number
          ended_at?: string | null
          free_intent?: Json | null
          id?: string
          mode?: string
          progress?: number
          protocol_id?: string | null
          started_at?: string
          status?: string
          user_id?: string
          vitals_state?: Json
        }
        Relationships: [
          {
            foreignKeyName: "clinical_sessions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "clinical_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_sessions_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "clinical_protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          contact_id: string | null
          created_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      drawing_challenge_messages: {
        Row: {
          challenge_id: string
          created_at: string
          id: string
          message_text: string
          user_id: string
          username: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          id?: string
          message_text: string
          user_id: string
          username: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          id?: string
          message_text?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "drawing_challenge_messages_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "drawing_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      drawing_challenges: {
        Row: {
          ai_evaluation: string | null
          challenge_prompt: string
          completed_at: string | null
          created_at: string
          end_time: string | null
          id: string
          player1_id: string
          player1_submission: string | null
          player2_id: string | null
          player2_submission: string | null
          room_created_by: string | null
          room_number: string | null
          start_time: string | null
          status: string
          time_limit: number
          winner_id: string | null
        }
        Insert: {
          ai_evaluation?: string | null
          challenge_prompt: string
          completed_at?: string | null
          created_at?: string
          end_time?: string | null
          id?: string
          player1_id: string
          player1_submission?: string | null
          player2_id?: string | null
          player2_submission?: string | null
          room_created_by?: string | null
          room_number?: string | null
          start_time?: string | null
          status?: string
          time_limit?: number
          winner_id?: string | null
        }
        Update: {
          ai_evaluation?: string | null
          challenge_prompt?: string
          completed_at?: string | null
          created_at?: string
          end_time?: string | null
          id?: string
          player1_id?: string
          player1_submission?: string | null
          player2_id?: string | null
          player2_submission?: string | null
          room_created_by?: string | null
          room_number?: string | null
          start_time?: string | null
          status?: string
          time_limit?: number
          winner_id?: string | null
        }
        Relationships: []
      }
      educational_images: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          image_url: string
          subject: string
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url: string
          subject: string
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string
          subject?: string
          title?: string
        }
        Relationships: []
      }
      generated_codes: {
        Row: {
          code: string
          created_at: string
          documentation: string
          id: string
          is_shared: boolean
          language: string
          prompt: string
          title: string
          user_id: string | null
        }
        Insert: {
          code: string
          created_at?: string
          documentation: string
          id?: string
          is_shared?: boolean
          language: string
          prompt: string
          title: string
          user_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          documentation?: string
          id?: string
          is_shared?: boolean
          language?: string
          prompt?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      grammar_foundation_files: {
        Row: {
          created_at: string
          description: string | null
          file_name: string
          file_url: string
          folder_image_url: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_name: string
          file_url: string
          folder_image_url?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_name?: string
          file_url?: string
          folder_image_url?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      grammar_rules: {
        Row: {
          category: string
          created_at: string
          difficulty_level: string | null
          examples: Json | null
          id: string
          rule_description: string
          rule_name: string
        }
        Insert: {
          category: string
          created_at?: string
          difficulty_level?: string | null
          examples?: Json | null
          id?: string
          rule_description: string
          rule_name: string
        }
        Update: {
          category?: string
          created_at?: string
          difficulty_level?: string | null
          examples?: Json | null
          id?: string
          rule_description?: string
          rule_name?: string
        }
        Relationships: []
      }
      group_chats: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      group_messages: {
        Row: {
          chat_id: string | null
          content: string
          created_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          chat_id?: string | null
          content: string
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          chat_id?: string | null
          content?: string
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "group_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      jordanian_assistant_chat_history: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          image_url: string | null
          role: string
          sources: Json | null
          user_id: string | null
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          role: string
          sources?: Json | null
          user_id?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          role?: string
          sources?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jordanian_assistant_chat_history_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "jordanian_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      jordanian_assistant_users: {
        Row: {
          created_at: string | null
          grade: string
          id: string
          semester: string
          student_name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          grade: string
          id?: string
          semester: string
          student_name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          grade?: string
          id?: string
          semester?: string
          student_name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      jordanian_conversations: {
        Row: {
          created_at: string
          first_message: string | null
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          first_message?: string | null
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          first_message?: string | null
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      jordanian_image_analysis: {
        Row: {
          analysis_result: string
          created_at: string | null
          grade: string
          id: string
          image_url: string
          question: string | null
          student_name: string
          user_id: string | null
        }
        Insert: {
          analysis_result: string
          created_at?: string | null
          grade: string
          id?: string
          image_url: string
          question?: string | null
          student_name: string
          user_id?: string | null
        }
        Update: {
          analysis_result?: string
          created_at?: string | null
          grade?: string
          id?: string
          image_url?: string
          question?: string | null
          student_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      jordanian_textbook_content: {
        Row: {
          created_at: string
          created_by: string | null
          grade: string
          id: string
          lesson_name: string
          lesson_number: number
          page_content: string
          page_number: number
          semester: string
          subject: string
          unit_name: string
          unit_number: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          grade: string
          id?: string
          lesson_name: string
          lesson_number: number
          page_content: string
          page_number: number
          semester: string
          subject: string
          unit_name: string
          unit_number: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          grade?: string
          id?: string
          lesson_name?: string
          lesson_number?: number
          page_content?: string
          page_number?: number
          semester?: string
          subject?: string
          unit_name?: string
          unit_number?: number
          updated_at?: string
        }
        Relationships: []
      }
      jordanian_textbooks: {
        Row: {
          book_name: string
          created_at: string | null
          created_by: string | null
          extracted_text: string | null
          file_size_mb: number | null
          file_url: string
          gemini_file_name: string | null
          gemini_file_uri: string | null
          grade: string
          id: string
          is_active: boolean | null
          page_count: number | null
          semester: string
          subject: string
        }
        Insert: {
          book_name: string
          created_at?: string | null
          created_by?: string | null
          extracted_text?: string | null
          file_size_mb?: number | null
          file_url: string
          gemini_file_name?: string | null
          gemini_file_uri?: string | null
          grade: string
          id?: string
          is_active?: boolean | null
          page_count?: number | null
          semester: string
          subject: string
        }
        Update: {
          book_name?: string
          created_at?: string | null
          created_by?: string | null
          extracted_text?: string | null
          file_size_mb?: number | null
          file_url?: string
          gemini_file_name?: string | null
          gemini_file_uri?: string | null
          grade?: string
          id?: string
          is_active?: boolean | null
          page_count?: number | null
          semester?: string
          subject?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          created_at: string
          id: string
          message_text: string
          receiver_id: string | null
          room_id: string | null
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_text: string
          receiver_id?: string | null
          room_id?: string | null
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_text?: string
          receiver_id?: string | null
          room_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "group_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      parents: {
        Row: {
          created_at: string
          grade: string
          id: string
          parent_name: string
          school_name: string
          section: string
          student_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          grade: string
          id?: string
          parent_name: string
          school_name: string
          section: string
          student_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          grade?: string
          id?: string
          parent_name?: string
          school_name?: string
          section?: string
          student_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_complaints: {
        Row: {
          category: string | null
          created_at: string
          description: string
          email: string | null
          id: string
          name: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description: string
          email?: string | null
          id?: string
          name: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          email?: string | null
          id?: string
          name?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      poems: {
        Row: {
          content: string
          created_at: string
          id: string
          meter: string | null
          occasion: string | null
          poet_id: string | null
          theme: string | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          meter?: string | null
          occasion?: string | null
          poet_id?: string | null
          theme?: string | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          meter?: string | null
          occasion?: string | null
          poet_id?: string | null
          theme?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "poems_poet_id_fkey"
            columns: ["poet_id"]
            isOneToOne: false
            referencedRelation: "arabic_poets"
            referencedColumns: ["id"]
          },
        ]
      }
      private_chat_participants: {
        Row: {
          chat_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          chat_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          chat_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "private_chat_participants_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "private_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      private_chats: {
        Row: {
          created_at: string
          id: string
        }
        Insert: {
          created_at?: string
          id?: string
        }
        Update: {
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      private_messages: {
        Row: {
          chat_id: string | null
          content: string
          created_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          chat_id?: string | null
          content: string
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          chat_id?: string | null
          content?: string
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "private_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "private_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          has_seen_welcome_guide: boolean | null
          id: string
          score: number | null
          solved_puzzles: number | null
          usage_time: number | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          has_seen_welcome_guide?: boolean | null
          id: string
          score?: number | null
          solved_puzzles?: number | null
          usage_time?: number | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          has_seen_welcome_guide?: boolean | null
          id?: string
          score?: number | null
          solved_puzzles?: number | null
          usage_time?: number | null
          username?: string
        }
        Relationships: []
      }
      puzzles: {
        Row: {
          correct_answer: string
          created_at: string
          created_by: string | null
          difficulty: string
          id: string
          image: string | null
          options: string[]
          points: number
          question: string
          title: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          created_by?: string | null
          difficulty: string
          id?: string
          image?: string | null
          options: string[]
          points: number
          question: string
          title: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          created_by?: string | null
          difficulty?: string
          id?: string
          image?: string | null
          options?: string[]
          points?: number
          question?: string
          title?: string
        }
        Relationships: []
      }
      recorded_lessons: {
        Row: {
          created_at: string
          description: string | null
          grade_level: string | null
          id: string
          subject: string
          teacher_id: string
          title: string
          updated_at: string
          video_duration: number | null
          video_url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          grade_level?: string | null
          id?: string
          subject: string
          teacher_id: string
          title: string
          updated_at?: string
          video_duration?: number | null
          video_url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          grade_level?: string | null
          id?: string
          subject?: string
          teacher_id?: string
          title?: string
          updated_at?: string
          video_duration?: number | null
          video_url?: string
        }
        Relationships: []
      }
      scheduled_puzzle_jobs: {
        Row: {
          created_at: string | null
          created_by: string | null
          difficulty: string
          id: string
          is_active: boolean | null
          last_run_at: string | null
          puzzles_per_day: number
          schedule_days: string[]
          subject: string
          topic_description: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          difficulty: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          puzzles_per_day?: number
          schedule_days: string[]
          subject: string
          topic_description: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          difficulty?: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          puzzles_per_day?: number
          schedule_days?: string[]
          subject?: string
          topic_description?: string
        }
        Relationships: []
      }
      school_news: {
        Row: {
          author_id: string
          author_name: string
          category: string | null
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_pinned: boolean | null
          likes_count: number | null
          title: string
          updated_at: string
          video_url: string | null
          views_count: number | null
        }
        Insert: {
          author_id: string
          author_name: string
          category?: string | null
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          is_pinned?: boolean | null
          likes_count?: number | null
          title: string
          updated_at?: string
          video_url?: string | null
          views_count?: number | null
        }
        Update: {
          author_id?: string
          author_name?: string
          category?: string | null
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_pinned?: boolean | null
          likes_count?: number | null
          title?: string
          updated_at?: string
          video_url?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
      school_news_comments: {
        Row: {
          comment_text: string
          created_at: string
          id: string
          news_id: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          comment_text: string
          created_at?: string
          id?: string
          news_id: string
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          comment_text?: string
          created_at?: string
          id?: string
          news_id?: string
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_news_comments_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "school_news"
            referencedColumns: ["id"]
          },
        ]
      }
      school_news_likes: {
        Row: {
          created_at: string
          id: string
          news_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          news_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          news_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_news_likes_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "school_news"
            referencedColumns: ["id"]
          },
        ]
      }
      scientific_journals: {
        Row: {
          author: string | null
          cover_image_url: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          pdf_url: string
          subject: string
          title: string
        }
        Insert: {
          author?: string | null
          cover_image_url: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          pdf_url: string
          subject: string
          title: string
        }
        Update: {
          author?: string | null
          cover_image_url?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          pdf_url?: string
          subject?: string
          title?: string
        }
        Relationships: []
      }
      sign_dictionary: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          hands_count: number | null
          handshape: string | null
          id: string
          image_url: string | null
          language: string
          movement: string | null
          updated_at: string
          video_url: string | null
          word: string
          word_normalized: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          hands_count?: number | null
          handshape?: string | null
          id?: string
          image_url?: string | null
          language: string
          movement?: string | null
          updated_at?: string
          video_url?: string | null
          word: string
          word_normalized: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          hands_count?: number | null
          handshape?: string | null
          id?: string
          image_url?: string | null
          language?: string
          movement?: string | null
          updated_at?: string
          video_url?: string | null
          word?: string
          word_normalized?: string
        }
        Relationships: []
      }
      sign_language_dictionary: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          sign_gif_url: string | null
          sign_image_url: string | null
          sign_video_url: string | null
          word_arabic: string
          word_english: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          sign_gif_url?: string | null
          sign_image_url?: string | null
          sign_video_url?: string | null
          word_arabic: string
          word_english?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          sign_gif_url?: string | null
          sign_image_url?: string | null
          sign_video_url?: string | null
          word_arabic?: string
          word_english?: string | null
        }
        Relationships: []
      }
      sign_vocab_overrides: {
        Row: {
          created_at: string
          lang_code: string
          notes: string | null
          updated_at: string
          updated_by: string | null
          vocab: Json
        }
        Insert: {
          created_at?: string
          lang_code: string
          notes?: string | null
          updated_at?: string
          updated_by?: string | null
          vocab: Json
        }
        Update: {
          created_at?: string
          lang_code?: string
          notes?: string | null
          updated_at?: string
          updated_by?: string | null
          vocab?: Json
        }
        Relationships: []
      }
      sign_vocab_version: {
        Row: {
          id: number
          updated_at: string
          version: number
        }
        Insert: {
          id?: number
          updated_at?: string
          version?: number
        }
        Update: {
          id?: number
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      spaced_lessons: {
        Row: {
          created_at: string | null
          current_review_index: number | null
          difficulty: string
          first_study_date: string
          id: string
          is_completed: boolean | null
          lesson_name: string
          study_duration: number | null
          subject_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_review_index?: number | null
          difficulty?: string
          first_study_date: string
          id?: string
          is_completed?: boolean | null
          lesson_name: string
          study_duration?: number | null
          subject_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_review_index?: number | null
          difficulty?: string
          first_study_date?: string
          id?: string
          is_completed?: boolean | null
          lesson_name?: string
          study_duration?: number | null
          subject_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      spaced_reviews: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          lesson_id: string
          memory_retention: number | null
          review_number: number
          scheduled_date: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          lesson_id: string
          memory_retention?: number | null
          review_number: number
          scheduled_date: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          lesson_id?: string
          memory_retention?: number | null
          review_number?: number
          scheduled_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spaced_reviews_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "spaced_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      spaced_stats: {
        Row: {
          completed_reviews: number | null
          created_at: string | null
          date: string
          id: string
          streak_days: number | null
          total_study_minutes: number | null
          user_id: string
        }
        Insert: {
          completed_reviews?: number | null
          created_at?: string | null
          date?: string
          id?: string
          streak_days?: number | null
          total_study_minutes?: number | null
          user_id: string
        }
        Update: {
          completed_reviews?: number | null
          created_at?: string | null
          date?: string
          id?: string
          streak_days?: number | null
          total_study_minutes?: number | null
          user_id?: string
        }
        Relationships: []
      }
      student_assistant_usage: {
        Row: {
          answer: string | null
          created_at: string | null
          grade: string
          id: string
          question: string
          sources: Json | null
          student_name: string
          subject_detected: string | null
          user_id: string | null
        }
        Insert: {
          answer?: string | null
          created_at?: string | null
          grade: string
          id?: string
          question: string
          sources?: Json | null
          student_name: string
          subject_detected?: string | null
          user_id?: string | null
        }
        Update: {
          answer?: string | null
          created_at?: string | null
          grade?: string
          id?: string
          question?: string
          sources?: Json | null
          student_name?: string
          subject_detected?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      student_projects: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          project_description: string
          project_name: string
          school_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          project_description: string
          project_name: string
          school_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          project_description?: string
          project_name?: string
          school_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      study_events: {
        Row: {
          created_at: string | null
          date: string
          end_time: string
          id: string
          notes: string | null
          start_time: string
          subject: string
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          end_time: string
          id?: string
          notes?: string | null
          start_time: string
          subject: string
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          end_time?: string
          id?: string
          notes?: string | null
          start_time?: string
          subject?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subject_puzzles: {
        Row: {
          correct_answer: string
          created_at: string
          created_by: string | null
          difficulty: string
          id: string
          image: string | null
          options: string[]
          points: number
          question: string
          subject: string
          title: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          created_by?: string | null
          difficulty: string
          id?: string
          image?: string | null
          options: string[]
          points: number
          question: string
          subject: string
          title: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          created_by?: string | null
          difficulty?: string
          id?: string
          image?: string | null
          options?: string[]
          points?: number
          question?: string
          subject?: string
          title?: string
        }
        Relationships: []
      }
      supabase_connections: {
        Row: {
          anon_key: string
          created_at: string | null
          id: string
          is_active: boolean | null
          last_verified_at: string | null
          project_id: string | null
          schema_name: string | null
          service_role_key: string | null
          supabase_url: string
          tables_cache: Json | null
          updated_at: string | null
        }
        Insert: {
          anon_key: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_verified_at?: string | null
          project_id?: string | null
          schema_name?: string | null
          service_role_key?: string | null
          supabase_url: string
          tables_cache?: Json | null
          updated_at?: string | null
        }
        Update: {
          anon_key?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_verified_at?: string | null
          project_id?: string | null
          schema_name?: string | null
          service_role_key?: string | null
          supabase_url?: string
          tables_cache?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supabase_connections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "ai_builder_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tawjihi_files: {
        Row: {
          category: string
          created_at: string
          description: string
          file_name: string
          file_url: string
          grade: string
          id: string
          subject: string
          teacher_name: string | null
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          file_name: string
          file_url: string
          grade: string
          id?: string
          subject: string
          teacher_name?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          file_name?: string
          file_url?: string
          grade?: string
          id?: string
          subject?: string
          teacher_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      teacher_project_messages: {
        Row: {
          admin_id: string
          created_at: string
          id: string
          message: string
          project_id: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          id?: string
          message: string
          project_id: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          id?: string
          message?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_project_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "teacher_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_projects: {
        Row: {
          admin_id: string | null
          created_at: string
          description: string
          id: string
          images: string[] | null
          member_id: string
          status: string | null
          teacher_name: string
          updated_at: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          description: string
          id?: string
          images?: string[] | null
          member_id: string
          status?: string | null
          teacher_name: string
          updated_at?: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          description?: string
          id?: string
          images?: string[] | null
          member_id?: string
          status?: string | null
          teacher_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      teachers: {
        Row: {
          created_at: string
          grades_sections: Json
          homeroom_class: string
          id: string
          school_name: string
          subject_taught: string
          teacher_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          grades_sections?: Json
          homeroom_class: string
          id?: string
          school_name: string
          subject_taught: string
          teacher_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          grades_sections?: Json
          homeroom_class?: string
          id?: string
          school_name?: string
          subject_taught?: string
          teacher_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tenant_members: {
        Row: {
          created_at: string | null
          id: string
          permissions: Json | null
          role: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permissions?: Json | null
          role?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permissions?: Json | null
          role?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          owner_user_id: string
          plan: string | null
          settings: Json | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          owner_user_id: string
          plan?: string | null
          settings?: Json | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          owner_user_id?: string
          plan?: string | null
          settings?: Json | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_accessibility_settings: {
        Row: {
          accessibility_mode: string | null
          created_at: string | null
          font_size: string | null
          high_contrast: boolean | null
          id: string
          preferred_voice: string | null
          reading_speed: number | null
          reduce_motion: boolean | null
          screen_reader: boolean | null
          sign_language: boolean | null
          text_to_speech: boolean | null
          updated_at: string | null
          user_id: string | null
          voice_input: boolean | null
        }
        Insert: {
          accessibility_mode?: string | null
          created_at?: string | null
          font_size?: string | null
          high_contrast?: boolean | null
          id?: string
          preferred_voice?: string | null
          reading_speed?: number | null
          reduce_motion?: boolean | null
          screen_reader?: boolean | null
          sign_language?: boolean | null
          text_to_speech?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          voice_input?: boolean | null
        }
        Update: {
          accessibility_mode?: string | null
          created_at?: string | null
          font_size?: string | null
          high_contrast?: boolean | null
          id?: string
          preferred_voice?: string | null
          reading_speed?: number | null
          reduce_motion?: boolean | null
          screen_reader?: boolean | null
          sign_language?: boolean | null
          text_to_speech?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          voice_input?: boolean | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_solved_puzzles: {
        Row: {
          id: string
          is_correct: boolean | null
          puzzle_id: string
          solved_at: string
          subject: string
          user_id: string
        }
        Insert: {
          id?: string
          is_correct?: boolean | null
          puzzle_id: string
          solved_at?: string
          subject: string
          user_id: string
        }
        Update: {
          id?: string
          is_correct?: boolean | null
          puzzle_id?: string
          solved_at?: string
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      users_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          last_login: string | null
          role: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          last_login?: string | null
          role?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          last_login?: string | null
          role?: string
          username?: string
        }
        Relationships: []
      }
      watched_videos: {
        Row: {
          duration_watched: number | null
          id: string
          subject: string
          user_id: string
          video_title: string
          video_url: string
          watched_at: string
        }
        Insert: {
          duration_watched?: number | null
          id?: string
          subject: string
          user_id: string
          video_title: string
          video_url: string
          watched_at?: string
        }
        Update: {
          duration_watched?: number | null
          id?: string
          subject?: string
          user_id?: string
          video_title?: string
          video_url?: string
          watched_at?: string
        }
        Relationships: []
      }
      word_contributions: {
        Row: {
          contribution_type: string | null
          created_at: string
          id: string
          suggestion_text: string | null
          user_id: string
          vote_type: string | null
          word_id: string
        }
        Insert: {
          contribution_type?: string | null
          created_at?: string
          id?: string
          suggestion_text?: string | null
          user_id: string
          vote_type?: string | null
          word_id: string
        }
        Update: {
          contribution_type?: string | null
          created_at?: string
          id?: string
          suggestion_text?: string | null
          user_id?: string
          vote_type?: string | null
          word_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "word_contributions_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "arabic_words"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      adjust_art_project_likes: {
        Args: { increment: number; project_id: string }
        Returns: undefined
      }
      adjust_school_news_likes: {
        Args: { increment_param: number; news_id_param: string }
        Returns: undefined
      }
      adjust_user_score: {
        Args: { points_adjustment: number; user_id: string }
        Returns: undefined
      }
      calculate_user_level: { Args: { usage_minutes: number }; Returns: number }
      get_admin_teacher_access_level: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["admin_teacher_access_level"]
      }
      get_public_adhd_diagnostic_report: {
        Args: { p_token: string }
        Returns: {
          ai_report: string
          created_at: string
          dsm_category: string
          id: string
          metrics: Json
          recommendations: Json
        }[]
      }
      get_public_adhd_program: { Args: { p_token: string }; Returns: Json }
      get_public_autism_program: { Args: { p_token: string }; Returns: Json }
      get_public_clinical_report: {
        Args: { p_token: string }
        Returns: {
          created_at: string
          diagnosis_ar: string
          id: string
          recommendations_ar: string[]
          references_ar: string[]
          rubric: Json
          score: number
          strengths_ar: string[]
          summary_ar: string
          weaknesses_ar: string[]
        }[]
      }
      get_user_tenant_id: { Args: { _user_id: string }; Returns: string }
      has_admin_teacher_access: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      user_belongs_to_tenant: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
      user_has_tenant_role: {
        Args: { _role: string; _tenant_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      admin_teacher_access_level: "member" | "admin" | "super_admin"
      app_role: "admin" | "moderator" | "user"
      communication_user_type: "teacher" | "parent"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_teacher_access_level: ["member", "admin", "super_admin"],
      app_role: ["admin", "moderator", "user"],
      communication_user_type: ["teacher", "parent"],
    },
  },
} as const
