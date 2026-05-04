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
      attendance: {
        Row: {
          check_in_date: string
          checked_in_at: string
          employee_id: string
          id: string
        }
        Insert: {
          check_in_date?: string
          checked_in_at?: string
          employee_id: string
          id?: string
        }
        Update: {
          check_in_date?: string
          checked_in_at?: string
          employee_id?: string
          id?: string
        }
        Relationships: []
      }
      meetings: {
        Row: {
          admin_notes: string | null
          client_id: string
          created_at: string
          description: string | null
          id: string
          meet_link: string | null
          requested_at: string
          scheduled_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          client_id: string
          created_at?: string
          description?: string | null
          id?: string
          meet_link?: string | null
          requested_at?: string
          scheduled_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          client_id?: string
          created_at?: string
          description?: string | null
          id?: string
          meet_link?: string | null
          requested_at?: string
          scheduled_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          request_id: string
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          request_id: string
          sender_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          request_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      negotiations: {
        Row: {
          actor: Database["public"]["Enums"]["negotiation_actor"]
          created_at: string
          id: string
          message: string | null
          proposed_price: number
          request_id: string
        }
        Insert: {
          actor: Database["public"]["Enums"]["negotiation_actor"]
          created_at?: string
          id?: string
          message?: string | null
          proposed_price: number
          request_id: string
        }
        Update: {
          actor?: Database["public"]["Enums"]["negotiation_actor"]
          created_at?: string
          id?: string
          message?: string | null
          proposed_price?: number
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "negotiations_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
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
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          employee_code: string | null
          full_name: string | null
          github_username: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          employee_code?: string | null
          full_name?: string | null
          github_username?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          employee_code?: string | null
          full_name?: string | null
          github_username?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          assigned_employee_id: string | null
          budget: number | null
          client_id: string
          created_at: string
          deadline: string | null
          delivered_at: string | null
          delivery_file_url: string | null
          delivery_note: string | null
          description: string
          final_paid: boolean
          final_price: number | null
          id: string
          proposal_deadline: string | null
          proposal_note: string | null
          status: Database["public"]["Enums"]["request_status"]
          stripe_payment_link: string | null
          title: string
          updated_at: string
          upfront_paid: boolean
        }
        Insert: {
          assigned_employee_id?: string | null
          budget?: number | null
          client_id: string
          created_at?: string
          deadline?: string | null
          delivered_at?: string | null
          delivery_file_url?: string | null
          delivery_note?: string | null
          description: string
          final_paid?: boolean
          final_price?: number | null
          id?: string
          proposal_deadline?: string | null
          proposal_note?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          stripe_payment_link?: string | null
          title: string
          updated_at?: string
          upfront_paid?: boolean
        }
        Update: {
          assigned_employee_id?: string | null
          budget?: number | null
          client_id?: string
          created_at?: string
          deadline?: string | null
          delivered_at?: string | null
          delivery_file_url?: string | null
          delivery_note?: string | null
          description?: string
          final_paid?: boolean
          final_price?: number | null
          id?: string
          proposal_deadline?: string | null
          proposal_note?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          stripe_payment_link?: string | null
          title?: string
          updated_at?: string
          upfront_paid?: boolean
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          client_id: string
          created_at: string
          description: string | null
          id: string
          issue_type: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          description?: string | null
          id?: string
          issue_type?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          description?: string | null
          id?: string
          issue_type?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string
          description: string | null
          employee_id: string
          id: string
          request_id: string
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          employee_id: string
          id?: string
          request_id: string
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          employee_id?: string
          id?: string
          request_id?: string
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          sender_id: string
          ticket_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          sender_id: string
          ticket_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          sender_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount: number
          created_at: string
          employee_id: string
          id: string
          processed_at: string | null
          status: string
          upi_or_method: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          employee_id: string
          id?: string
          processed_at?: string | null
          status?: string
          upi_or_method?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          employee_id?: string
          id?: string
          processed_at?: string | null
          status?: string
          upi_or_method?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_email_by_employee_code: { Args: { _code: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "employee" | "client"
      negotiation_actor: "client" | "admin"
      request_status:
        | "pending"
        | "negotiating"
        | "accepted"
        | "rejected"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "under_review"
        | "price_sent"
        | "delivered"
      task_status: "todo" | "in_progress" | "done"
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
      app_role: ["admin", "employee", "client"],
      negotiation_actor: ["client", "admin"],
      request_status: [
        "pending",
        "negotiating",
        "accepted",
        "rejected",
        "in_progress",
        "completed",
        "cancelled",
        "under_review",
        "price_sent",
        "delivered",
      ],
      task_status: ["todo", "in_progress", "done"],
    },
  },
} as const
