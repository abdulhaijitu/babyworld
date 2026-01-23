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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_type: Database["public"]["Enums"]["booking_type"]
          created_at: string
          id: string
          notes: string | null
          parent_name: string
          parent_phone: string
          payment_status: string
          slot_date: string
          slot_id: string | null
          status: Database["public"]["Enums"]["booking_status"]
          ticket_type: Database["public"]["Enums"]["ticket_type"]
          time_slot: string
          updated_at: string
        }
        Insert: {
          booking_type?: Database["public"]["Enums"]["booking_type"]
          created_at?: string
          id?: string
          notes?: string | null
          parent_name: string
          parent_phone: string
          payment_status?: string
          slot_date: string
          slot_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          ticket_type?: Database["public"]["Enums"]["ticket_type"]
          time_slot: string
          updated_at?: string
        }
        Update: {
          booking_type?: Database["public"]["Enums"]["booking_type"]
          created_at?: string
          id?: string
          notes?: string | null
          parent_name?: string
          parent_phone?: string
          payment_status?: string
          slot_date?: string
          slot_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          ticket_type?: Database["public"]["Enums"]["ticket_type"]
          time_slot?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "slots"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          created_at: string
          email: string | null
          hire_date: string | null
          id: string
          name: string
          notes: string | null
          phone: string
          role: Database["public"]["Enums"]["employee_role"]
          status: Database["public"]["Enums"]["employee_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          hire_date?: string | null
          id?: string
          name: string
          notes?: string | null
          phone: string
          role?: Database["public"]["Enums"]["employee_role"]
          status?: Database["public"]["Enums"]["employee_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          hire_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          role?: Database["public"]["Enums"]["employee_role"]
          status?: Database["public"]["Enums"]["employee_status"]
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          added_by: string | null
          added_by_name: string | null
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string
          description: string
          expense_date: string
          id: string
          notes: string | null
          payment_method: Database["public"]["Enums"]["expense_payment_method"]
          updated_at: string
        }
        Insert: {
          added_by?: string | null
          added_by_name?: string | null
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          description: string
          expense_date?: string
          id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["expense_payment_method"]
          updated_at?: string
        }
        Update: {
          added_by?: string | null
          added_by_name?: string | null
          amount?: number
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["expense_payment_method"]
          updated_at?: string
        }
        Relationships: []
      }
      food_items: {
        Row: {
          category: Database["public"]["Enums"]["food_category"]
          created_at: string
          id: string
          image_url: string | null
          is_available: boolean
          name: string
          name_bn: string | null
          price: number
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["food_category"]
          created_at?: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          name: string
          name_bn?: string | null
          price?: number
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["food_category"]
          created_at?: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          name?: string
          name_bn?: string | null
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      food_order_items: {
        Row: {
          created_at: string
          food_item_id: string
          id: string
          order_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          food_item_id: string
          id?: string
          order_id: string
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          food_item_id?: string
          id?: string
          order_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "food_order_items_food_item_id_fkey"
            columns: ["food_item_id"]
            isOneToOne: false
            referencedRelation: "food_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "food_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      food_orders: {
        Row: {
          created_at: string
          customer_name: string | null
          id: string
          notes: string | null
          order_number: string
          payment_type: Database["public"]["Enums"]["food_payment_type"]
          status: Database["public"]["Enums"]["food_order_status"]
          subtotal: number
          ticket_id: string | null
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_name?: string | null
          id?: string
          notes?: string | null
          order_number: string
          payment_type?: Database["public"]["Enums"]["food_payment_type"]
          status?: Database["public"]["Enums"]["food_order_status"]
          subtotal?: number
          ticket_id?: string | null
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_name?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_type?: Database["public"]["Enums"]["food_payment_type"]
          status?: Database["public"]["Enums"]["food_order_status"]
          subtotal?: number
          ticket_id?: string | null
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_orders_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      gate_cameras: {
        Row: {
          camera_ref: string | null
          created_at: string
          gate_id: string
          gate_name: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          camera_ref?: string | null
          created_at?: string
          gate_id: string
          gate_name: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          camera_ref?: string | null
          created_at?: string
          gate_id?: string
          gate_name?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      gate_logs: {
        Row: {
          camera_ref: string | null
          created_at: string
          entry_type: Database["public"]["Enums"]["gate_entry_type"]
          gate_id: string
          id: string
          notes: string | null
          scanned_by: string | null
          scanned_by_name: string | null
          ticket_id: string
        }
        Insert: {
          camera_ref?: string | null
          created_at?: string
          entry_type: Database["public"]["Enums"]["gate_entry_type"]
          gate_id?: string
          id?: string
          notes?: string | null
          scanned_by?: string | null
          scanned_by_name?: string | null
          ticket_id: string
        }
        Update: {
          camera_ref?: string | null
          created_at?: string
          entry_type?: Database["public"]["Enums"]["gate_entry_type"]
          gate_id?: string
          id?: string
          notes?: string | null
          scanned_by?: string | null
          scanned_by_name?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gate_logs_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          child_count: number
          created_at: string
          created_by: string | null
          discount_percent: number
          id: string
          member_name: string
          membership_type: Database["public"]["Enums"]["membership_type"]
          notes: string | null
          phone: string
          status: Database["public"]["Enums"]["membership_status"]
          updated_at: string
          valid_from: string
          valid_till: string
        }
        Insert: {
          child_count?: number
          created_at?: string
          created_by?: string | null
          discount_percent?: number
          id?: string
          member_name: string
          membership_type: Database["public"]["Enums"]["membership_type"]
          notes?: string | null
          phone: string
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          valid_from?: string
          valid_till: string
        }
        Update: {
          child_count?: number
          created_at?: string
          created_by?: string | null
          discount_percent?: number
          id?: string
          member_name?: string
          membership_type?: Database["public"]["Enums"]["membership_type"]
          notes?: string | null
          phone?: string
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          valid_from?: string
          valid_till?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string
          currency: string
          fee: number | null
          id: string
          invoice_id: string
          metadata: Json | null
          payment_method: string | null
          sender_number: string | null
          status: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string
          currency?: string
          fee?: number | null
          id?: string
          invoice_id: string
          metadata?: Json | null
          payment_method?: string | null
          sender_number?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string
          currency?: string
          fee?: number | null
          id?: string
          invoice_id?: string
          metadata?: Json | null
          payment_method?: string | null
          sender_number?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      rides: {
        Row: {
          category: Database["public"]["Enums"]["ride_category"]
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          name_bn: string | null
          price: number
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["ride_category"]
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          name_bn?: string | null
          price?: number
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["ride_category"]
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          name_bn?: string | null
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      roster_shifts: {
        Row: {
          created_at: string
          employee_id: string
          end_time: string
          id: string
          notes: string | null
          shift_date: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          end_time: string
          id?: string
          notes?: string | null
          shift_date: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          end_time?: string
          id?: string
          notes?: string | null
          shift_date?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roster_shifts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          category: string
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      slots: {
        Row: {
          created_at: string
          end_time: string
          id: string
          slot_date: string
          start_time: string
          status: Database["public"]["Enums"]["slot_status"]
          time_slot: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          slot_date: string
          start_time: string
          status?: Database["public"]["Enums"]["slot_status"]
          time_slot: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          slot_date?: string
          start_time?: string
          status?: Database["public"]["Enums"]["slot_status"]
          time_slot?: string
          updated_at?: string
        }
        Relationships: []
      }
      ticket_rides: {
        Row: {
          created_at: string
          id: string
          quantity: number
          ride_id: string
          ticket_id: string
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          quantity?: number
          ride_id: string
          ticket_id: string
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          quantity?: number
          ride_id?: string
          ticket_id?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "ticket_rides_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_rides_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          addons_price: number | null
          booking_id: string | null
          child_count: number | null
          child_name: string | null
          created_at: string
          created_by: string | null
          discount_applied: number | null
          entry_price: number | null
          guardian_count: number | null
          guardian_name: string
          guardian_phone: string
          id: string
          in_time: string | null
          inside_venue: boolean
          membership_id: string | null
          notes: string | null
          out_time: string | null
          payment_status: string | null
          payment_type: string | null
          slot_date: string
          socks_count: number | null
          socks_price: number | null
          source: Database["public"]["Enums"]["ticket_source"]
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_number: string
          ticket_type: string
          time_slot: string | null
          total_price: number | null
          updated_at: string
          used_at: string | null
        }
        Insert: {
          addons_price?: number | null
          booking_id?: string | null
          child_count?: number | null
          child_name?: string | null
          created_at?: string
          created_by?: string | null
          discount_applied?: number | null
          entry_price?: number | null
          guardian_count?: number | null
          guardian_name: string
          guardian_phone: string
          id?: string
          in_time?: string | null
          inside_venue?: boolean
          membership_id?: string | null
          notes?: string | null
          out_time?: string | null
          payment_status?: string | null
          payment_type?: string | null
          slot_date: string
          socks_count?: number | null
          socks_price?: number | null
          source?: Database["public"]["Enums"]["ticket_source"]
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_number: string
          ticket_type?: string
          time_slot?: string | null
          total_price?: number | null
          updated_at?: string
          used_at?: string | null
        }
        Update: {
          addons_price?: number | null
          booking_id?: string | null
          child_count?: number | null
          child_name?: string | null
          created_at?: string
          created_by?: string | null
          discount_applied?: number | null
          entry_price?: number | null
          guardian_count?: number | null
          guardian_name?: string
          guardian_phone?: string
          id?: string
          in_time?: string | null
          inside_venue?: boolean
          membership_id?: string | null
          notes?: string | null
          out_time?: string | null
          payment_status?: string | null
          payment_type?: string | null
          slot_date?: string
          socks_count?: number | null
          socks_price?: number | null
          source?: Database["public"]["Enums"]["ticket_source"]
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_number?: string
          ticket_type?: string
          time_slot?: string | null
          total_price?: number | null
          updated_at?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "manager" | "staff"
      booking_status: "confirmed" | "pending" | "cancelled"
      booking_type: "hourly_play" | "birthday_event" | "private_event"
      employee_role: "staff" | "supervisor" | "manager"
      employee_status: "active" | "inactive"
      expense_category:
        | "rent"
        | "staff_salary"
        | "utilities"
        | "food_purchase"
        | "toys_equipment"
        | "maintenance"
        | "marketing"
        | "other"
      expense_payment_method: "cash" | "bank" | "online"
      food_category: "snacks" | "drinks" | "meals"
      food_order_status: "pending" | "served" | "cancelled"
      food_payment_type: "cash" | "online" | "pending"
      gate_entry_type: "entry" | "exit"
      membership_status: "active" | "expired" | "cancelled"
      membership_type: "monthly" | "quarterly" | "yearly"
      ride_category: "kids" | "family" | "thrill"
      slot_status: "available" | "booked"
      ticket_source: "online" | "physical"
      ticket_status: "active" | "used" | "cancelled"
      ticket_type: "child_guardian" | "child_only" | "group"
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
      app_role: ["admin", "user", "manager", "staff"],
      booking_status: ["confirmed", "pending", "cancelled"],
      booking_type: ["hourly_play", "birthday_event", "private_event"],
      employee_role: ["staff", "supervisor", "manager"],
      employee_status: ["active", "inactive"],
      expense_category: [
        "rent",
        "staff_salary",
        "utilities",
        "food_purchase",
        "toys_equipment",
        "maintenance",
        "marketing",
        "other",
      ],
      expense_payment_method: ["cash", "bank", "online"],
      food_category: ["snacks", "drinks", "meals"],
      food_order_status: ["pending", "served", "cancelled"],
      food_payment_type: ["cash", "online", "pending"],
      gate_entry_type: ["entry", "exit"],
      membership_status: ["active", "expired", "cancelled"],
      membership_type: ["monthly", "quarterly", "yearly"],
      ride_category: ["kids", "family", "thrill"],
      slot_status: ["available", "booked"],
      ticket_source: ["online", "physical"],
      ticket_status: ["active", "used", "cancelled"],
      ticket_type: ["child_guardian", "child_only", "group"],
    },
  },
} as const
