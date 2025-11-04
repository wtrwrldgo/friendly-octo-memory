// file: types/database.ts
// Auto-generated types for Supabase database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      firms: {
        Row: {
          id: string
          name: string
          city: string
          status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
          clients_count: number
          orders_count: number
          drivers_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          city: string
          status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
          clients_count?: number
          orders_count?: number
          drivers_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          city?: string
          status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
          clients_count?: number
          orders_count?: number
          drivers_count?: number
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          firm_id: string
          email: string
          name: string
          role: 'OWNER' | 'MANAGER' | 'OPERATOR'
          phone: string
          city: string
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          firm_id: string
          email: string
          name: string
          role: 'OWNER' | 'MANAGER' | 'OPERATOR'
          phone: string
          city: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          firm_id?: string
          email?: string
          name?: string
          role?: 'OWNER' | 'MANAGER' | 'OPERATOR'
          phone?: string
          city?: string
          active?: boolean
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          firm_id: string
          name: string
          phone: string
          email: string | null
          address: string
          type: 'B2C' | 'B2B' | 'B2G'
          total_orders: number
          revenue: number
          last_order_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          firm_id: string
          name: string
          phone: string
          email?: string | null
          address: string
          type: 'B2C' | 'B2B' | 'B2G'
          total_orders?: number
          revenue?: number
          last_order_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          firm_id?: string
          name?: string
          phone?: string
          email?: string | null
          address?: string
          type?: 'B2C' | 'B2B' | 'B2G'
          total_orders?: number
          revenue?: number
          last_order_at?: string | null
          updated_at?: string
        }
      }
      drivers: {
        Row: {
          id: string
          firm_id: string
          user_id: string | null
          name: string
          phone: string
          status: 'ONLINE' | 'OFFLINE' | 'DELIVERING'
          car_plate: string
          city: string
          current_location: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          firm_id: string
          user_id?: string | null
          name: string
          phone: string
          status?: 'ONLINE' | 'OFFLINE' | 'DELIVERING'
          car_plate: string
          city: string
          current_location?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          firm_id?: string
          user_id?: string | null
          name?: string
          phone?: string
          status?: 'ONLINE' | 'OFFLINE' | 'DELIVERING'
          car_plate?: string
          city?: string
          current_location?: Json | null
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          firm_id: string
          name: string
          description: string
          price: number
          unit: string
          volume: string
          image: string | null
          in_stock: boolean
          stock_quantity: number
          min_order: number
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          firm_id: string
          name: string
          description: string
          price: number
          unit: string
          volume: string
          image?: string | null
          in_stock?: boolean
          stock_quantity: number
          min_order: number
          category: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          firm_id?: string
          name?: string
          description?: string
          price?: number
          unit?: string
          volume?: string
          image?: string | null
          in_stock?: boolean
          stock_quantity?: number
          min_order?: number
          category?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          firm_id: string
          client_id: string
          driver_id: string | null
          delivery_address: string
          notes: string | null
          status: 'PENDING' | 'CONFIRMED' | 'ASSIGNED' | 'PICKED_UP' | 'ON_THE_WAY' | 'DELIVERED' | 'CANCELLED'
          payment_status: 'UNPAID' | 'PAID' | 'PARTIAL'
          payment_method: 'CASH' | 'CARD' | 'CREDIT' | null
          total_amount: number
          created_at: string
          updated_at: string
          delivered_at: string | null
        }
        Insert: {
          id?: string
          firm_id: string
          client_id: string
          driver_id?: string | null
          delivery_address: string
          notes?: string | null
          status?: 'PENDING' | 'CONFIRMED' | 'ASSIGNED' | 'PICKED_UP' | 'ON_THE_WAY' | 'DELIVERED' | 'CANCELLED'
          payment_status?: 'UNPAID' | 'PAID' | 'PARTIAL'
          payment_method?: 'CASH' | 'CARD' | 'CREDIT' | null
          total_amount: number
          created_at?: string
          updated_at?: string
          delivered_at?: string | null
        }
        Update: {
          firm_id?: string
          client_id?: string
          driver_id?: string | null
          delivery_address?: string
          notes?: string | null
          status?: 'PENDING' | 'CONFIRMED' | 'ASSIGNED' | 'PICKED_UP' | 'ON_THE_WAY' | 'DELIVERED' | 'CANCELLED'
          payment_status?: 'UNPAID' | 'PAID' | 'PARTIAL'
          payment_method?: 'CASH' | 'CARD' | 'CREDIT' | null
          total_amount?: number
          updated_at?: string
          delivered_at?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at?: string
        }
        Update: {
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
        }
      }
      order_status_history: {
        Row: {
          id: string
          order_id: string
          status: string
          notes: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          status: string
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          order_id?: string
          status?: string
          notes?: string | null
          created_by?: string | null
        }
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
  }
}
