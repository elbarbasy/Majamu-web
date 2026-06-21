/**
 * Majamu Database Types
 *
 * Tipe ini diturunkan secara manual dari `supabase/schema.sql`
 * (selaras dengan keputusan di docs/CONFLICT_RESOLUTION.md).
 *
 * Setelah project Supabase aktif, file ini dapat di-generate ulang dengan:
 *   supabase gen types typescript --project-id <id> --schema public > src/types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** ---- Enum / union helpers (mengikuti CHECK constraint di schema.sql) ---- */
export type UserRole = "owner" | "cashier";
export type MenuStatus = "active" | "inactive";
export type StockStatus = "available" | "out_of_stock";
export type OrderType = "dine_in" | "take_away";
export type OrderStatus =
  | "menunggu_bayar"
  | "diterima"
  | "diracik"
  | "siap_diambil"
  | "selesai";
export type PaymentMethod = "cash" | "qris" | "midtrans";
export type SweetnessLevel = "normal" | "less" | "low" | "no_sugar";
export type CashEntryType = "income" | "expense";
export type StoreStatus = "open" | "closed";

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          auth_user_id: string | null;
          name: string;
          email: string;
          role: UserRole;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          name: string;
          email: string;
          role: UserRole;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          auth_user_id?: string | null;
          name?: string;
          email?: string;
          role?: UserRole;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      filter_chips: {
        Row: {
          id: string;
          name: string;
          sort_order: number | null;
        };
        Insert: {
          id?: string;
          name: string;
          sort_order?: number | null;
        };
        Update: {
          id?: string;
          name?: string;
          sort_order?: number | null;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          photo_url: string | null;
          description: string | null;
          price: number;
          menu_status: MenuStatus | null;
          stock_status: StockStatus | null;
          featured_filter_chip_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          photo_url?: string | null;
          description?: string | null;
          price: number;
          menu_status?: MenuStatus | null;
          stock_status?: StockStatus | null;
          featured_filter_chip_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          photo_url?: string | null;
          description?: string | null;
          price?: number;
          menu_status?: MenuStatus | null;
          stock_status?: StockStatus | null;
          featured_filter_chip_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "products_featured_filter_chip_id_fkey";
            columns: ["featured_filter_chip_id"];
            referencedRelation: "filter_chips";
            referencedColumns: ["id"];
          },
        ];
      };
      product_filter_chips: {
        Row: {
          product_id: string;
          filter_chip_id: string;
        };
        Insert: {
          product_id: string;
          filter_chip_id: string;
        };
        Update: {
          product_id?: string;
          filter_chip_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_filter_chips_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_filter_chips_filter_chip_id_fkey";
            columns: ["filter_chip_id"];
            referencedRelation: "filter_chips";
            referencedColumns: ["id"];
          },
        ];
      };
      ingredients: {
        Row: {
          id: string;
          name: string;
          category: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          category?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string | null;
        };
        Relationships: [];
      };
      product_ingredients: {
        Row: {
          product_id: string;
          ingredient_id: string;
        };
        Insert: {
          product_id: string;
          ingredient_id: string;
        };
        Update: {
          product_id?: string;
          ingredient_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_ingredients_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_ingredients_ingredient_id_fkey";
            columns: ["ingredient_id"];
            referencedRelation: "ingredients";
            referencedColumns: ["id"];
          },
        ];
      };
      tables: {
        Row: {
          id: string;
          table_number: number;
          qr_url: string | null;
          is_active: boolean | null;
        };
        Insert: {
          id?: string;
          table_number: number;
          qr_url?: string | null;
          is_active?: boolean | null;
        };
        Update: {
          id?: string;
          table_number?: number;
          qr_url?: string | null;
          is_active?: boolean | null;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          status_url: string | null;
          receipt_number: string | null;
          receipt_url: string | null;
          order_type: OrderType | null;
          table_id: string | null;
          display_number: string | null;
          customer_name: string | null;
          whatsapp: string | null;
          notes: string | null;
          payment_method: PaymentMethod | null;
          status: OrderStatus;
          total_price: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          status_url?: string | null;
          receipt_number?: string | null;
          receipt_url?: string | null;
          order_type?: OrderType | null;
          table_id?: string | null;
          display_number?: string | null;
          customer_name?: string | null;
          whatsapp?: string | null;
          notes?: string | null;
          payment_method?: PaymentMethod | null;
          status?: OrderStatus;
          total_price?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          status_url?: string | null;
          receipt_number?: string | null;
          receipt_url?: string | null;
          order_type?: OrderType | null;
          table_id?: string | null;
          display_number?: string | null;
          customer_name?: string | null;
          whatsapp?: string | null;
          notes?: string | null;
          payment_method?: PaymentMethod | null;
          status?: OrderStatus;
          total_price?: number | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "orders_table_id_fkey";
            columns: ["table_id"];
            referencedRelation: "tables";
            referencedColumns: ["id"];
          },
        ];
      };
      order_status_history: {
        Row: {
          id: string;
          order_id: string | null;
          status: string;
          changed_at: string | null;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          status: string;
          changed_at?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string | null;
          status?: string;
          changed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey";
            columns: ["order_id"];
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string | null;
          product_id: string | null;
          product_name_snapshot: string | null;
          price_snapshot: number | null;
          sweetness_level: SweetnessLevel | null;
          quantity: number;
          subtotal: number | null;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          product_id?: string | null;
          product_name_snapshot?: string | null;
          price_snapshot?: number | null;
          sweetness_level?: SweetnessLevel | null;
          quantity: number;
          subtotal?: number | null;
        };
        Update: {
          id?: string;
          order_id?: string | null;
          product_id?: string | null;
          product_name_snapshot?: string | null;
          price_snapshot?: number | null;
          sweetness_level?: SweetnessLevel | null;
          quantity?: number;
          subtotal?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          id: string;
          order_id: string | null;
          method: PaymentMethod | null;
          status: string | null;
          amount: number | null;
          paid_at: string | null;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          method?: PaymentMethod | null;
          status?: string | null;
          amount?: number | null;
          paid_at?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string | null;
          method?: PaymentMethod | null;
          status?: string | null;
          amount?: number | null;
          paid_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey";
            columns: ["order_id"];
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      shift_notes: {
        Row: {
          id: string;
          category: string | null;
          nominal: number | null;
          description: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          category?: string | null;
          nominal?: number | null;
          description?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          category?: string | null;
          nominal?: number | null;
          description?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      cash_entries: {
        Row: {
          id: string;
          type: CashEntryType;
          category: string | null;
          amount: number;
          description: string | null;
          created_by: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          type: CashEntryType;
          category?: string | null;
          amount: number;
          description?: string | null;
          created_by?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          type?: CashEntryType;
          category?: string | null;
          amount?: number;
          description?: string | null;
          created_by?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "cash_entries_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      banners: {
        Row: {
          id: string;
          title: string | null;
          image_url: string | null;
          is_active: boolean | null;
        };
        Insert: {
          id?: string;
          title?: string | null;
          image_url?: string | null;
          is_active?: boolean | null;
        };
        Update: {
          id?: string;
          title?: string | null;
          image_url?: string | null;
          is_active?: boolean | null;
        };
        Relationships: [];
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string | null;
          description: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action?: string | null;
          description?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string | null;
          description?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      store_settings: {
        Row: {
          id: string;
          store_name: string | null;
          store_whatsapp: string | null;
          logo_url: string | null;
          operational_hours: Json | null;
          payment_methods: Json | null;
          urgency_threshold_minutes: number | null;
          store_status: StoreStatus | null;
          queue_counter: number | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          store_name?: string | null;
          store_whatsapp?: string | null;
          logo_url?: string | null;
          operational_hours?: Json | null;
          payment_methods?: Json | null;
          urgency_threshold_minutes?: number | null;
          store_status?: StoreStatus | null;
          queue_counter?: number | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          store_name?: string | null;
          store_whatsapp?: string | null;
          logo_url?: string | null;
          operational_hours?: Json | null;
          payment_methods?: Json | null;
          urgency_threshold_minutes?: number | null;
          store_status?: StoreStatus | null;
          queue_counter?: number | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      daily_sequences: {
        Row: {
          seq_date: string;
          last_value: number;
        };
        Insert: {
          seq_date?: string;
          last_value?: number;
        };
        Update: {
          seq_date?: string;
          last_value?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      next_daily_sequence: {
        Args: Record<string, never>;
        Returns: number;
      };
      current_user_role: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

/** ---- Convenience helpers ---- */
type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];

export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
