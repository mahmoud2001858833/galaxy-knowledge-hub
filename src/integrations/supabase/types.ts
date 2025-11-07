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
          id: string
          score: number | null
          solved_puzzles: number | null
          usage_time: number | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          score?: number | null
          solved_puzzles?: number | null
          usage_time?: number | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
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
          puzzle_id: string
          solved_at: string
          subject: string
          user_id: string
        }
        Insert: {
          id?: string
          puzzle_id: string
          solved_at?: string
          subject: string
          user_id: string
        }
        Update: {
          id?: string
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
      adjust_user_score: {
        Args: { points_adjustment: number; user_id: string }
        Returns: undefined
      }
      calculate_user_level: { Args: { usage_minutes: number }; Returns: number }
      get_admin_teacher_access_level: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["admin_teacher_access_level"]
      }
      has_admin_teacher_access: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      admin_teacher_access_level: "member" | "admin" | "super_admin"
      app_role: "admin" | "moderator" | "user"
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
    },
  },
} as const
