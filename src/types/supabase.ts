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
      admins: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          password: string
          username: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          password: string
          username: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          password?: string
          username?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          barcode: string
          birthdate: string | null
          created_at: string | null
          email: string | null
          id: string
          loyalty_tier: string | null
          name: string
          phone: string | null
          points_balance: number | null
          store_owner_id: string | null
          total_spent: number | null
        }
        Insert: {
          address?: string | null
          barcode: string
          birthdate?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          loyalty_tier?: string | null
          name: string
          phone?: string | null
          points_balance?: number | null
          store_owner_id?: string | null
          total_spent?: number | null
        }
        Update: {
          address?: string | null
          barcode?: string
          birthdate?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          loyalty_tier?: string | null
          name?: string
          phone?: string | null
          points_balance?: number | null
          store_owner_id?: string | null
          total_spent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_store_owner_id_fkey"
            columns: ["store_owner_id"]
            isOneToOne: false
            referencedRelation: "store_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      discounts: {
        Row: {
          amount: number
          created_at: string | null
          customer_id: string
          expiry_date: string
          id: string
          is_used: boolean | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          customer_id: string
          expiry_date: string
          id?: string
          is_used?: boolean | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          customer_id?: string
          expiry_date?: string
          id?: string
          is_used?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "discounts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          amount: number
          created_at: string | null
          customer_id: string
          discount_applied: number | null
          id: string
          points_earned: number
        }
        Insert: {
          amount: number
          created_at?: string | null
          customer_id: string
          discount_applied?: number | null
          id?: string
          points_earned: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          customer_id?: string
          discount_applied?: number | null
          id?: string
          points_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchases_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      store_owners: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          password: string
          phone: string | null
          store_name: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          password: string
          phone?: string | null
          store_name: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          password?: string
          phone?: string | null
          store_name?: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
