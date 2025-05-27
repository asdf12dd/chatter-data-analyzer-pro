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
      assigned_numbers: {
        Row: {
          assigned_by: string
          assigned_date: string
          created_at: string
          employee_id: string | null
          employee_name: string
          id: string
          notes: string | null
          phone_number: string
          screenshot_url: string | null
        }
        Insert: {
          assigned_by: string
          assigned_date?: string
          created_at?: string
          employee_id?: string | null
          employee_name: string
          id?: string
          notes?: string | null
          phone_number: string
          screenshot_url?: string | null
        }
        Update: {
          assigned_by?: string
          assigned_date?: string
          created_at?: string
          employee_id?: string | null
          employee_name?: string
          id?: string
          notes?: string | null
          phone_number?: string
          screenshot_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assigned_numbers_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_users: {
        Row: {
          blocked_date: string | null
          created_at: string | null
          id: string
          last_seen: string | null
          message_count: number | null
          name: string
          phone: string
          profile_id: string | null
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
          profile_id?: string | null
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
          profile_id?: string | null
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_users_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          added_date: string | null
          chat_duration: string | null
          company_name: string | null
          created_at: string | null
          designation: string | null
          house_rent: boolean | null
          id: string
          is_serious: boolean | null
          last_message: string | null
          message_count: number | null
          name: string
          phone: string
          profile_id: string | null
          salary_package: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          added_date?: string | null
          chat_duration?: string | null
          company_name?: string | null
          created_at?: string | null
          designation?: string | null
          house_rent?: boolean | null
          id?: string
          is_serious?: boolean | null
          last_message?: string | null
          message_count?: number | null
          name: string
          phone: string
          profile_id?: string | null
          salary_package?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          added_date?: string | null
          chat_duration?: string | null
          company_name?: string | null
          created_at?: string | null
          designation?: string | null
          house_rent?: boolean | null
          id?: string
          is_serious?: boolean | null
          last_message?: string | null
          message_count?: number | null
          name?: string
          phone?: string
          profile_id?: string | null
          salary_package?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          contact_id: string | null
          contact_name: string
          created_at: string | null
          id: string
          message: string
          phone: string
          profile_id: string | null
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
          profile_id?: string | null
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
          profile_id?: string | null
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
          {
            foreignKeyName: "messages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
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
          profile_id: string | null
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
          profile_id?: string | null
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
          profile_id?: string | null
          status?: string | null
          total_salary?: number | null
          updated_at?: string | null
          work_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "salary_records_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          department: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_approved: boolean | null
          name: string
          phone: string | null
          profile_image: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          name: string
          phone?: string | null
          profile_image?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          name?: string
          phone?: string | null
          profile_image?: string | null
          role?: string
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
