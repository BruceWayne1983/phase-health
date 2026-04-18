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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bloods_uploads: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          source: string
          updated_at: string
          upload_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          source: string
          updated_at?: string
          upload_date: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          source?: string
          updated_at?: string
          upload_date?: string
          user_id?: string
        }
        Relationships: []
      }
      content_library: {
        Row: {
          body: string | null
          created_at: string
          excerpt: string | null
          id: string
          modes: string[]
          published: boolean
          slug: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          modes?: string[]
          published?: boolean
          slug: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          modes?: string[]
          published?: boolean
          slug?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cycles: {
        Row: {
          created_at: string
          id: string
          length: number | null
          notes: string | null
          period_length: number | null
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          length?: number | null
          notes?: string | null
          period_length?: number | null
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          length?: number | null
          notes?: string | null
          period_length?: number | null
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_logs: {
        Row: {
          created_at: string
          energy: number | null
          id: string
          log_date: string
          mood: number | null
          notes: string | null
          sleep_hours: number | null
          sleep_quality: number | null
          symptoms: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          energy?: number | null
          id?: string
          log_date: string
          mood?: number | null
          notes?: string | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          symptoms?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          energy?: number | null
          id?: string
          log_date?: string
          mood?: number | null
          notes?: string | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          symptoms?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hormone_markers: {
        Row: {
          bloods_upload_id: string | null
          created_at: string
          id: string
          measured_at: string
          name: string
          reference_range_high: number | null
          reference_range_low: number | null
          status: string | null
          unit: string
          user_id: string
          value: number
        }
        Insert: {
          bloods_upload_id?: string | null
          created_at?: string
          id?: string
          measured_at: string
          name: string
          reference_range_high?: number | null
          reference_range_low?: number | null
          status?: string | null
          unit: string
          user_id: string
          value: number
        }
        Update: {
          bloods_upload_id?: string | null
          created_at?: string
          id?: string
          measured_at?: string
          name?: string
          reference_range_high?: number | null
          reference_range_low?: number | null
          status?: string | null
          unit?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "hormone_markers_bloods_upload_id_fkey"
            columns: ["bloods_upload_id"]
            isOneToOne: false
            referencedRelation: "bloods_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          created_at: string
          freetext_concerns: string | null
          goals: string[]
          hrt_details: Json | null
          id: string
          is_demo: boolean
          mode: string | null
          mode_set_manually: boolean
          on_hormonal_contraception: boolean
          on_hrt: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          created_at?: string
          freetext_concerns?: string | null
          goals?: string[]
          hrt_details?: Json | null
          id?: string
          is_demo?: boolean
          mode?: string | null
          mode_set_manually?: boolean
          on_hormonal_contraception?: boolean
          on_hrt?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          created_at?: string
          freetext_concerns?: string | null
          goals?: string[]
          hrt_details?: Json | null
          id?: string
          is_demo?: boolean
          mode?: string | null
          mode_set_manually?: boolean
          on_hormonal_contraception?: boolean
          on_hrt?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      protocols: {
        Row: {
          content_feed: Json
          created_at: string
          escalation_flags: Json
          generated_at: string
          id: string
          inputs: Json
          is_active: boolean
          lifestyle_recommendations: Json
          mode: string | null
          summary: string
          supplement_stack: Json
          user_feedback: number | null
          user_feedback_text: string | null
          user_id: string
        }
        Insert: {
          content_feed: Json
          created_at?: string
          escalation_flags: Json
          generated_at?: string
          id?: string
          inputs: Json
          is_active?: boolean
          lifestyle_recommendations: Json
          mode?: string | null
          summary: string
          supplement_stack: Json
          user_feedback?: number | null
          user_feedback_text?: string | null
          user_id: string
        }
        Update: {
          content_feed?: Json
          created_at?: string
          escalation_flags?: Json
          generated_at?: string
          id?: string
          inputs?: Json
          is_active?: boolean
          lifestyle_recommendations?: Json
          mode?: string | null
          summary?: string
          supplement_stack?: Json
          user_feedback?: number | null
          user_feedback_text?: string | null
          user_id?: string
        }
        Relationships: []
      }
      supplements: {
        Row: {
          active: boolean
          contraindications: string[]
          created_at: string
          id: string
          indicated_for: string[]
          ingredients: Json
          line: string
          mechanism_of_action: string | null
          name: string
          price_oneoff_pence: number
          price_subscription_pence: number
          sku_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          contraindications?: string[]
          created_at?: string
          id?: string
          indicated_for?: string[]
          ingredients?: Json
          line: string
          mechanism_of_action?: string | null
          name: string
          price_oneoff_pence: number
          price_subscription_pence: number
          sku_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          contraindications?: string[]
          created_at?: string
          id?: string
          indicated_for?: string[]
          ingredients?: Json
          line?: string
          mechanism_of_action?: string | null
          name?: string
          price_oneoff_pence?: number
          price_subscription_pence?: number
          sku_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
