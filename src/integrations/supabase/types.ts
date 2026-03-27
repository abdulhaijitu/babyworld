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
      attendance: {
        Row: {
          attendance_date: string
          check_in: string | null
          check_out: string | null
          created_at: string
          employee_id: string
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          updated_at: string
        }
        Insert: {
          attendance_date?: string
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          employee_id: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string
        }
        Update: {
          attendance_date?: string
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
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
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          max_uses: number | null
          min_order_amount: number
          updated_at: string
          used_count: number
          valid_from: string
          valid_till: string | null
        }
        Insert: {
          code: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_order_amount?: number
          updated_at?: string
          used_count?: number
          valid_from?: string
          valid_till?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_order_amount?: number
          updated_at?: string
          used_count?: number
          valid_from?: string
          valid_till?: string | null
        }
        Relationships: []
      }
      employee_leaves: {
        Row: {
          approved_by: string | null
          created_at: string
          employee_id: string
          end_date: string
          id: string
          leave_type: Database["public"]["Enums"]["leave_type"]
          reason: string | null
          start_date: string
          status: Database["public"]["Enums"]["leave_status"]
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          employee_id: string
          end_date: string
          id?: string
          leave_type?: Database["public"]["Enums"]["leave_type"]
          reason?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["leave_status"]
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          employee_id?: string
          end_date?: string
          id?: string
          leave_type?: Database["public"]["Enums"]["leave_type"]
          reason?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["leave_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_leaves_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_payroll: {
        Row: {
          basic_salary: number
          bonuses: number
          created_at: string
          deductions: number
          employee_id: string
          id: string
          month: number
          net_salary: number
          notes: string | null
          paid_at: string | null
          status: Database["public"]["Enums"]["payroll_status"]
          updated_at: string
          year: number
        }
        Insert: {
          basic_salary?: number
          bonuses?: number
          created_at?: string
          deductions?: number
          employee_id: string
          id?: string
          month: number
          net_salary?: number
          notes?: string | null
          paid_at?: string | null
          status?: Database["public"]["Enums"]["payroll_status"]
          updated_at?: string
          year: number
        }
        Update: {
          basic_salary?: number
          bonuses?: number
          created_at?: string
          deductions?: number
          employee_id?: string
          id?: string
          month?: number
          net_salary?: number
          notes?: string | null
          paid_at?: string | null
          status?: Database["public"]["Enums"]["payroll_status"]
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "employee_payroll_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_performance: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          rating: number
          review_period: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          rating: number
          review_period: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          rating?: number
          review_period?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_performance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
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
      event_packages: {
        Row: {
          created_at: string
          duration_hours: number
          features: Json | null
          id: string
          image_url: string | null
          is_active: boolean
          max_guests: number
          name: string
          price: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_hours?: number
          features?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          max_guests?: number
          name: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_hours?: number
          features?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          max_guests?: number
          name?: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      expense_categories: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          label: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          name?: string
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
          coupon_code: string | null
          created_at: string
          customer_name: string | null
          discount_amount: number
          discount_type: string | null
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
          coupon_code?: string | null
          created_at?: string
          customer_name?: string | null
          discount_amount?: number
          discount_type?: string | null
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
          coupon_code?: string | null
          created_at?: string
          customer_name?: string | null
          discount_amount?: number
          discount_type?: string | null
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
      hero_cards: {
        Row: {
          badge: string
          created_at: string
          cta_link: string
          cta_text: string
          date_text: string | null
          description: string
          expires_at: string | null
          id: string
          image_url: string | null
          is_active: boolean
          sort_order: number
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          badge?: string
          created_at?: string
          cta_link?: string
          cta_text?: string
          date_text?: string | null
          description?: string
          expires_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          title?: string
          type?: string
          updated_at?: string
        }
        Update: {
          badge?: string
          created_at?: string
          cta_link?: string
          cta_text?: string
          date_text?: string | null
          description?: string
          expires_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          alt_text: string
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          alt_text?: string
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          alt_text?: string
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      income_categories: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          label: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          label: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          label?: string
          name?: string
        }
        Relationships: []
      }
      incomes: {
        Row: {
          added_by: string | null
          added_by_name: string | null
          amount: number
          category: string
          created_at: string | null
          description: string
          id: string
          income_date: string
          notes: string | null
          payment_method: string | null
          updated_at: string | null
        }
        Insert: {
          added_by?: string | null
          added_by_name?: string | null
          amount: number
          category: string
          created_at?: string | null
          description: string
          id?: string
          income_date?: string
          notes?: string | null
          payment_method?: string | null
          updated_at?: string | null
        }
        Update: {
          added_by?: string | null
          added_by_name?: string | null
          amount?: number
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          income_date?: string
          notes?: string | null
          payment_method?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          created_by: string | null
          email: string | null
          follow_up_date: string | null
          id: string
          interested_in: string | null
          name: string
          notes: string | null
          phone: string
          source: Database["public"]["Enums"]["lead_source"]
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          follow_up_date?: string | null
          id?: string
          interested_in?: string | null
          name: string
          notes?: string | null
          phone: string
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          follow_up_date?: string | null
          id?: string
          interested_in?: string | null
          name?: string
          notes?: string | null
          phone?: string
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Relationships: []
      }
      membership_packages: {
        Row: {
          created_at: string
          discount_percent: number
          duration_days: number
          features: Json | null
          id: string
          is_active: boolean
          max_children: number
          max_guardians: number
          membership_type: Database["public"]["Enums"]["membership_type"]
          name: string
          name_bn: string | null
          price: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount_percent?: number
          duration_days: number
          features?: Json | null
          id?: string
          is_active?: boolean
          max_children?: number
          max_guardians?: number
          membership_type: Database["public"]["Enums"]["membership_type"]
          name: string
          name_bn?: string | null
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount_percent?: number
          duration_days?: number
          features?: Json | null
          id?: string
          is_active?: boolean
          max_children?: number
          max_guardians?: number
          membership_type?: Database["public"]["Enums"]["membership_type"]
          name?: string
          name_bn?: string | null
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      membership_visits: {
        Row: {
          check_in_at: string
          check_out_at: string | null
          checked_in_by: string | null
          created_at: string
          id: string
          membership_id: string
          notes: string | null
        }
        Insert: {
          check_in_at?: string
          check_out_at?: string | null
          checked_in_by?: string | null
          created_at?: string
          id?: string
          membership_id: string
          notes?: string | null
        }
        Update: {
          check_in_at?: string
          check_out_at?: string | null
          checked_in_by?: string | null
          created_at?: string
          id?: string
          membership_id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "membership_visits_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
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
      notification_logs: {
        Row: {
          channel: string
          created_at: string
          error_message: string | null
          id: string
          message: string
          provider_response: Json | null
          recipient_phone: string
          reference_id: string | null
          reference_type: string
          retry_count: number | null
          sent_at: string | null
          status: string
        }
        Insert: {
          channel: string
          created_at?: string
          error_message?: string | null
          id?: string
          message: string
          provider_response?: Json | null
          recipient_phone: string
          reference_id?: string | null
          reference_type: string
          retry_count?: number | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          channel?: string
          created_at?: string
          error_message?: string | null
          id?: string
          message?: string
          provider_response?: Json | null
          recipient_phone?: string
          reference_id?: string | null
          reference_type?: string
          retry_count?: number | null
          sent_at?: string | null
          status?: string
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
      promotions: {
        Row: {
          applicable_to: Database["public"]["Enums"]["promo_applicable_to"]
          created_at: string
          created_by: string | null
          description: string | null
          discount_type: Database["public"]["Enums"]["promo_discount_type"]
          discount_value: number
          end_date: string | null
          id: string
          is_featured: boolean
          max_uses: number | null
          promo_code: string | null
          start_date: string
          status: Database["public"]["Enums"]["promo_status"]
          title: string
          updated_at: string
          usage_count: number
        }
        Insert: {
          applicable_to?: Database["public"]["Enums"]["promo_applicable_to"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type?: Database["public"]["Enums"]["promo_discount_type"]
          discount_value?: number
          end_date?: string | null
          id?: string
          is_featured?: boolean
          max_uses?: number | null
          promo_code?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["promo_status"]
          title: string
          updated_at?: string
          usage_count?: number
        }
        Update: {
          applicable_to?: Database["public"]["Enums"]["promo_applicable_to"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type?: Database["public"]["Enums"]["promo_discount_type"]
          discount_value?: number
          end_date?: string | null
          id?: string
          is_featured?: boolean
          max_uses?: number | null
          promo_code?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["promo_status"]
          title?: string
          updated_at?: string
          usage_count?: number
        }
        Relationships: []
      }
      ride_reviews: {
        Row: {
          created_at: string
          id: string
          is_approved: boolean | null
          rating: number
          review_text: string | null
          reviewer_name: string
          reviewer_phone: string | null
          ride_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_approved?: boolean | null
          rating: number
          review_text?: string | null
          reviewer_name: string
          reviewer_phone?: string | null
          ride_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_approved?: boolean | null
          rating?: number
          review_text?: string | null
          reviewer_name?: string
          reviewer_phone?: string | null
          ride_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ride_reviews_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      rides: {
        Row: {
          avg_rating: number | null
          category: Database["public"]["Enums"]["ride_category"]
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          image_url: string | null
          is_active: boolean
          max_riders: number | null
          name: string
          name_bn: string | null
          offer_price: number | null
          price: number
          review_count: number | null
          ride_type: string | null
          updated_at: string
        }
        Insert: {
          avg_rating?: number | null
          category?: Database["public"]["Enums"]["ride_category"]
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          max_riders?: number | null
          name: string
          name_bn?: string | null
          offer_price?: number | null
          price?: number
          review_count?: number | null
          ride_type?: string | null
          updated_at?: string
        }
        Update: {
          avg_rating?: number | null
          category?: Database["public"]["Enums"]["ride_category"]
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          max_riders?: number | null
          name?: string
          name_bn?: string | null
          offer_price?: number | null
          price?: number
          review_count?: number | null
          ride_type?: string | null
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
      sms_campaigns: {
        Row: {
          audience: Database["public"]["Enums"]["campaign_audience"]
          created_at: string
          created_by: string | null
          custom_phones: string[] | null
          failed_count: number
          id: string
          message: string
          name: string
          scheduled_at: string | null
          sent_at: string | null
          sent_count: number
          status: Database["public"]["Enums"]["campaign_status"]
          total_recipients: number
          updated_at: string
        }
        Insert: {
          audience?: Database["public"]["Enums"]["campaign_audience"]
          created_at?: string
          created_by?: string | null
          custom_phones?: string[] | null
          failed_count?: number
          id?: string
          message: string
          name: string
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number
          status?: Database["public"]["Enums"]["campaign_status"]
          total_recipients?: number
          updated_at?: string
        }
        Update: {
          audience?: Database["public"]["Enums"]["campaign_audience"]
          created_at?: string
          created_by?: string | null
          custom_phones?: string[] | null
          failed_count?: number
          id?: string
          message?: string
          name?: string
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number
          status?: Database["public"]["Enums"]["campaign_status"]
          total_recipients?: number
          updated_at?: string
        }
        Relationships: []
      }
      social_media_posts: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          image_url: string | null
          notes: string | null
          platform: Database["public"]["Enums"]["social_platform"]
          post_type: string
          post_url: string | null
          published_at: string | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["social_post_status"]
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          notes?: string | null
          platform: Database["public"]["Enums"]["social_platform"]
          post_type?: string
          post_url?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["social_post_status"]
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          notes?: string | null
          platform?: Database["public"]["Enums"]["social_platform"]
          post_type?: string
          post_url?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["social_post_status"]
          tags?: string[] | null
          title?: string
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
      app_role: "admin" | "user" | "manager" | "staff" | "super_admin"
      attendance_status: "present" | "absent" | "late" | "half_day"
      booking_status: "confirmed" | "pending" | "cancelled"
      booking_type: "hourly_play" | "birthday_event" | "private_event"
      campaign_audience:
        | "all_customers"
        | "members"
        | "expired_members"
        | "leads"
        | "event_bookings"
        | "custom"
      campaign_status: "draft" | "scheduled" | "sending" | "sent" | "failed"
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
      lead_source:
        | "facebook"
        | "instagram"
        | "walk_in"
        | "referral"
        | "website"
        | "phone"
        | "other"
      lead_status: "new" | "contacted" | "interested" | "converted" | "lost"
      leave_status: "pending" | "approved" | "rejected"
      leave_type: "sick" | "casual" | "annual"
      membership_status: "active" | "expired" | "cancelled"
      membership_type: "monthly" | "quarterly" | "yearly"
      payroll_status: "draft" | "paid"
      promo_applicable_to: "ticket" | "food" | "event" | "membership" | "all"
      promo_discount_type: "percentage" | "fixed"
      promo_status: "draft" | "active" | "paused" | "expired"
      ride_category: "kids" | "family" | "thrill"
      slot_status: "available" | "booked"
      social_platform: "facebook" | "instagram" | "tiktok" | "youtube"
      social_post_status: "draft" | "scheduled" | "published" | "failed"
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
      app_role: ["admin", "user", "manager", "staff", "super_admin"],
      attendance_status: ["present", "absent", "late", "half_day"],
      booking_status: ["confirmed", "pending", "cancelled"],
      booking_type: ["hourly_play", "birthday_event", "private_event"],
      campaign_audience: [
        "all_customers",
        "members",
        "expired_members",
        "leads",
        "event_bookings",
        "custom",
      ],
      campaign_status: ["draft", "scheduled", "sending", "sent", "failed"],
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
      lead_source: [
        "facebook",
        "instagram",
        "walk_in",
        "referral",
        "website",
        "phone",
        "other",
      ],
      lead_status: ["new", "contacted", "interested", "converted", "lost"],
      leave_status: ["pending", "approved", "rejected"],
      leave_type: ["sick", "casual", "annual"],
      membership_status: ["active", "expired", "cancelled"],
      membership_type: ["monthly", "quarterly", "yearly"],
      payroll_status: ["draft", "paid"],
      promo_applicable_to: ["ticket", "food", "event", "membership", "all"],
      promo_discount_type: ["percentage", "fixed"],
      promo_status: ["draft", "active", "paused", "expired"],
      ride_category: ["kids", "family", "thrill"],
      slot_status: ["available", "booked"],
      social_platform: ["facebook", "instagram", "tiktok", "youtube"],
      social_post_status: ["draft", "scheduled", "published", "failed"],
      ticket_source: ["online", "physical"],
      ticket_status: ["active", "used", "cancelled"],
      ticket_type: ["child_guardian", "child_only", "group"],
    },
  },
} as const
