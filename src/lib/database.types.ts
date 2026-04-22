/**
 * Pure Advance ERP — Database Types (Supabase)
 * 
 * Generated from types/erp.ts to match the existing schema.
 * These map directly to Supabase tables.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      zones: {
        Row: {
          id: string;
          name: string;
          type: "upstream" | "downstream" | "formulation" | "packaging" | "qc" | "warehouse" | "utilities";
          area: number;
          iso_class: string | null;
          temperature: string | null;
          description: string;
          x: number;
          y: number;
          width: number;
          height: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["zones"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["zones"]["Insert"]>;
      };
      equipment: {
        Row: {
          id: string;
          name: string;
          category: "upstream" | "downstream" | "formulation" | "utilities" | "lab" | "packaging";
          zone_id: string;
          specs: Json;
          vendor: string;
          cost_range: string;
          status: "running" | "idle" | "maintenance" | "offline" | "cleaning";
          last_maintenance: string | null;
          next_maintenance: string | null;
          hours_running: number;
          efficiency: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["equipment"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["equipment"]["Insert"]>;
      };
      batches: {
        Row: {
          id: string;
          product: string;
          size: number;
          status: "queued" | "in_progress" | "qc_pending" | "approved" | "released" | "rejected" | "on_hold";
          start_date: string;
          estimated_completion: string;
          current_stage: string;
          parent_batches: string[] | null;
          equipment_used: string[];
          yield: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["batches"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["batches"]["Insert"]>;
      };
      qc_records: {
        Row: {
          id: string;
          batch_id: string;
          test_name: string;
          target_value: string;
          actual_value: string;
          unit: string;
          result: "pass" | "fail" | "pending" | "adjustment_needed";
          tested_by: string;
          tested_at: string;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["qc_records"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["qc_records"]["Insert"]>;
      };
      materials: {
        Row: {
          id: string;
          name: string;
          function: string;
          usage_percent_min: number;
          usage_percent_max: number;
          supplier: string;
          price_per_kg: number;
          currency: string;
          stock_level: number;
          reorder_point: number;
          unit: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["materials"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["materials"]["Insert"]>;
      };
      bom_entries: {
        Row: {
          id: string;
          product_id: string;
          material_id: string;
          material_name: string;
          percent_min: number;
          percent_max: number;
          percent_mid: number;
          function: string;
          supplier: string;
          cost_per_kg: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["bom_entries"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["bom_entries"]["Insert"]>;
      };
      process_stages: {
        Row: {
          id: string;
          name: string;
          zone: "upstream" | "downstream" | "formulation" | "packaging" | "qc" | "warehouse" | "utilities";
          description: string;
          duration: string | null;
          equipment: string[] | null;
          parameters: Json | null;
          qc_required: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["process_stages"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["process_stages"]["Insert"]>;
      };
      orders: {
        Row: {
          id: string;
          customer: string;
          product: string;
          quantity: number;
          unit: string;
          status: "pending" | "processing" | "shipped" | "delivered";
          order_date: string;
          ship_date: string | null;
          delivered_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["orders"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
