export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          email: string;
          phone: string;
          address: string | null;
          points_balance: number;
          total_spent: number;
          barcode: string;
          loyalty_tier: string;
          birthdate: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          email: string;
          phone: string;
          address?: string | null;
          points_balance?: number;
          total_spent?: number;
          barcode: string;
          loyalty_tier?: string;
          birthdate?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          email?: string;
          phone?: string;
          address?: string | null;
          points_balance?: number;
          total_spent?: number;
          barcode?: string;
          loyalty_tier?: string;
          birthdate?: string | null;
        };
      };
      purchases: {
        Row: {
          id: string;
          created_at: string;
          customer_id: string;
          amount: number;
          points_earned: number;
          discount_applied: number | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          customer_id: string;
          amount: number;
          points_earned: number;
          discount_applied?: number | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          customer_id?: string;
          amount?: number;
          points_earned?: number;
          discount_applied?: number | null;
        };
      };
      discounts: {
        Row: {
          id: string;
          created_at: string;
          customer_id: string;
          amount: number;
          expiry_date: string;
          is_used: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          customer_id: string;
          amount: number;
          expiry_date: string;
          is_used?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          customer_id?: string;
          amount?: number;
          expiry_date?: string;
          is_used?: boolean;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
