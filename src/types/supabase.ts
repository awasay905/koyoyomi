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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      categories: {
        Row: {
          color: string | null
          created_at: string
          id: string
          last_used: string | null
          name: string
          scope: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          last_used?: string | null
          name: string
          scope: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          last_used?: string | null
          name?: string
          scope?: string
          user_id?: string
        }
        Relationships: []
      }
      day_overrides: {
        Row: {
          created_at: string
          day_type_id: string
          id: string
          the_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_type_id: string
          id?: string
          the_date: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_type_id?: string
          id?: string
          the_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "day_overrides_day_type_id_fkey"
            columns: ["day_type_id"]
            isOneToOne: false
            referencedRelation: "day_types"
            referencedColumns: ["id"]
          },
        ]
      }
      day_types: {
        Row: {
          color: string | null
          created_at: string
          id: string
          is_archived: boolean
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          is_archived?: boolean
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          is_archived?: boolean
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      prayer_times: {
        Row: {
          id: string
          is_system: boolean
          name: string
          notify_enabled: boolean
          notify_lead_minutes: number
          sort_order: number
          time: string
          user_id: string
        }
        Insert: {
          id?: string
          is_system?: boolean
          name: string
          notify_enabled?: boolean
          notify_lead_minutes?: number
          sort_order?: number
          time: string
          user_id: string
        }
        Update: {
          id?: string
          is_system?: boolean
          name?: string
          notify_enabled?: boolean
          notify_lead_minutes?: number
          sort_order?: number
          time?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          keys: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          keys: Json
          user_id: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          keys?: Json
          user_id?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          config: Json
          fire_time: string
          id: string
          is_enabled: boolean
          reminder_type: string
          user_id: string
        }
        Insert: {
          config?: Json
          fire_time: string
          id?: string
          is_enabled?: boolean
          reminder_type: string
          user_id: string
        }
        Update: {
          config?: Json
          fire_time?: string
          id?: string
          is_enabled?: boolean
          reminder_type?: string
          user_id?: string
        }
        Relationships: []
      }
      schedule_blocks: {
        Row: {
          block_type: string
          day_type_id: string
          end_time: string
          id: string
          notes: string | null
          sort_order: number
          start_time: string
          title: string
          user_id: string
        }
        Insert: {
          block_type: string
          day_type_id: string
          end_time: string
          id?: string
          notes?: string | null
          sort_order?: number
          start_time: string
          title: string
          user_id: string
        }
        Update: {
          block_type?: string
          day_type_id?: string
          end_time?: string
          id?: string
          notes?: string | null
          sort_order?: number
          start_time?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_blocks_day_type_id_fkey"
            columns: ["day_type_id"]
            isOneToOne: false
            referencedRelation: "day_types"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_items: {
        Row: {
          bought_at: string | null
          category_id: string | null
          created_at: string
          id: string
          is_frequent: boolean
          name: string
          notes: string | null
          quantity: string | null
          status: string
          user_id: string
        }
        Insert: {
          bought_at?: string | null
          category_id?: string | null
          created_at?: string
          id?: string
          is_frequent?: boolean
          name: string
          notes?: string | null
          quantity?: string | null
          status?: string
          user_id: string
        }
        Update: {
          bought_at?: string | null
          category_id?: string | null
          created_at?: string
          id?: string
          is_frequent?: boolean
          name?: string
          notes?: string | null
          quantity?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      task_assignments: {
        Row: {
          assigned_date: string
          completed_at: string | null
          created_at: string
          id: string
          schedule_block_id: string | null
          status: string
          task_id: string
          user_id: string
        }
        Insert: {
          assigned_date: string
          completed_at?: string | null
          created_at?: string
          id?: string
          schedule_block_id?: string | null
          status?: string
          task_id: string
          user_id: string
        }
        Update: {
          assigned_date?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          schedule_block_id?: string | null
          status?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_assignments_schedule_block_id_fkey"
            columns: ["schedule_block_id"]
            isOneToOne: false
            referencedRelation: "schedule_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_completions: {
        Row: {
          completed_at: string
          cycle_number: number | null
          id: string
          note: string | null
          task_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          cycle_number?: number | null
          id?: string
          note?: string | null
          task_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          cycle_number?: number | null
          id?: string
          note?: string | null
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_completions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          category_id: string | null
          completed_at: string | null
          created_at: string
          deadline: string | null
          description: string | null
          estimated_minutes: number | null
          id: string
          notify_enabled: boolean
          notify_lead_minutes: number
          priority: string
          recurrence_end_count: number | null
          recurrence_end_date: string | null
          recurrence_end_type: string | null
          recurrence_interval: number | null
          recurrence_unit: string | null
          start_date: string | null
          status: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          estimated_minutes?: number | null
          id?: string
          notify_enabled?: boolean
          notify_lead_minutes?: number
          priority?: string
          recurrence_end_count?: number | null
          recurrence_end_date?: string | null
          recurrence_end_type?: string | null
          recurrence_interval?: number | null
          recurrence_unit?: string | null
          start_date?: string | null
          status?: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          category_id?: string | null
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          estimated_minutes?: number | null
          id?: string
          notify_enabled?: boolean
          notify_lead_minutes?: number
          priority?: string
          recurrence_end_count?: number | null
          recurrence_end_date?: string | null
          recurrence_end_type?: string | null
          recurrence_interval?: number | null
          recurrence_unit?: string | null
          start_date?: string | null
          status?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_pattern: {
        Row: {
          day_of_week: number
          day_type_id: string
          id: string
          user_id: string
        }
        Insert: {
          day_of_week: number
          day_type_id: string
          id?: string
          user_id: string
        }
        Update: {
          day_of_week?: number
          day_type_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_pattern_day_type_id_fkey"
            columns: ["day_type_id"]
            isOneToOne: false
            referencedRelation: "day_types"
            referencedColumns: ["id"]
          },
        ]
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
