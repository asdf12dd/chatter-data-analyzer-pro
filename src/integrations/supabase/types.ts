export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      blocked_users: {
        Row: {
          blocked_date: string | null
          created_at: string | null
          id: string
          last_seen: string | null
          message_count: number | null
          name: string
          phone: string
          reason: string
        }
        Insert: {
          blocked_date?: string | null
          created_at?: string | null
          id?: string
          last_seen?: string | null
          message_count?: number | null
          name: string
          phone: string
          reason: string
        }
        Update: {
          blocked_date?: string | null
          created_at?: string | null
          id?: string
          last_seen?: string | null
          message_count?: number | null
          name?: string
          phone?: string
          reason?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          added_date: string | null
          chat_duration: string | null
          created_at: string | null
          id: string
          last_message: string | null
          message_count: number | null
          name: string
          phone: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          added_date?: string | null
          chat_duration?: string | null
          created_at?: string | null
          id?: string
          last_message?: string | null
          message_count?: number | null
          name: string
          phone: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          added_date?: string | null
          chat_duration?: string | null
          created_at?: string | null
          id?: string
          last_message?: string | null
          message_count?: number | null
          name?: string
          phone?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          contact_id: string | null
          contact_name: string
          created_at: string | null
          id: string
          message: string
          phone: string
          status: string | null
          timestamp: string | null
          type: string
        }
        Insert: {
          contact_id?: string | null
          contact_name: string
          created_at?: string | null
          id?: string
          message: string
          phone: string
          status?: string | null
          timestamp?: string | null
          type: string
        }
        Update: {
          contact_id?: string | null
          contact_name?: string
          created_at?: string | null
          id?: string
          message?: string
          phone?: string
          status?: string | null
          timestamp?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_records: {
        Row: {
          base_salary: number
          bonus: number | null
          created_at: string | null
          employee_name: string
          id: string
          payment_date: string | null
          position: string
          status: string | null
          total_salary: number | null
          updated_at: string | null
          work_days: number | null
        }
        Insert: {
          base_salary: number
          bonus?: number | null
          created_at?: string | null
          employee_name: string
          id?: string
          payment_date?: string | null
          position: string
          status?: string | null
          total_salary?: number | null
          updated_at?: string | null
          work_days?: number | null
        }
        Update: {
          base_salary?: number
          bonus?: number | null
          created_at?: string | null
          employee_name?: string
          id?: string
          payment_date?: string | null
          position?: string
          status?: string | null
          total_salary?: number | null
          updated_at?: string | null
          work_days?: number | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
