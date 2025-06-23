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
      line_items: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          name: string
          description: string | null
          price: number
          unit: string
          cost_code_id: string | null
          category: string | null
          vendor_id: string | null
          category_id: string | null
          favorite: boolean | null
          status: string | null
          created_at: string | null
          updated_at: string | null
          sku: string | null
          is_taxable: boolean | null
          is_active: boolean | null
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          name: string
          description?: string | null
          price: number
          unit: string
          cost_code_id?: string | null
          category?: string | null
          vendor_id?: string | null
          category_id?: string | null
          favorite?: boolean | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
          sku?: string | null
          is_taxable?: boolean | null
          is_active?: boolean | null
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          name?: string
          description?: string | null
          price?: number
          unit?: string
          cost_code_id?: string | null
          category?: string | null
          vendor_id?: string | null
          category_id?: string | null
          favorite?: boolean | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
          sku?: string | null
          is_taxable?: boolean | null
          is_active?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "line_items_cost_code_id_fkey"
            columns: ["cost_code_id"]
            isOneToOne: false
            referencedRelation: "cost_codes"
            referencedColumns: ["id"]
          }
        ]
      }
      product_assemblies: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          name: string
          description: string | null
          base_price: number
          unit: string
          category: string | null
          vendor_id: string | null
          category_id: string | null
          favorite: boolean | null
          status: string | null
          parent_product_id: string | null
          variant_name: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          name: string
          description?: string | null
          base_price?: number
          unit?: string
          category?: string | null
          vendor_id?: string | null
          category_id?: string | null
          favorite?: boolean | null
          status?: string | null
          parent_product_id?: string | null
          variant_name?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          name?: string
          description?: string | null
          base_price?: number
          unit?: string
          category?: string | null
          vendor_id?: string | null
          category_id?: string | null
          favorite?: boolean | null
          status?: string | null
          parent_product_id?: string | null
          variant_name?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_assemblies_parent_product_id_fkey"
            columns: ["parent_product_id"]
            isOneToOne: false
            referencedRelation: "product_assemblies"
            referencedColumns: ["id"]
          }
        ]
      }
      assembly_line_items: {
        Row: {
          id: string
          assembly_id: string
          line_item_id: string
          quantity: number
          unit: string | null
          price_override: number | null
          display_order: number | null
          is_optional: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          assembly_id: string
          line_item_id: string
          quantity?: number
          unit?: string | null
          price_override?: number | null
          display_order?: number | null
          is_optional?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          assembly_id?: string
          line_item_id?: string
          quantity?: number
          unit?: string | null
          price_override?: number | null
          display_order?: number | null
          is_optional?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assembly_line_items_assembly_id_fkey"
            columns: ["assembly_id"]
            isOneToOne: false
            referencedRelation: "product_assemblies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assembly_line_items_line_item_id_fkey"
            columns: ["line_item_id"]
            isOneToOne: false
            referencedRelation: "line_items"
            referencedColumns: ["id"]
          }
        ]
      }
      cost_codes: {
        Row: {
          id: string
          name: string
          code: string
          organization_id: string | null
          description: string | null
          category: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          code: string
          organization_id?: string | null
          description?: string | null
          category?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          code?: string
          organization_id?: string | null
          description?: string | null
          category?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      work_pack_items: {
        Row: {
          id: string
          work_pack_id: string
          assembly_id: string | null
          line_item_id: string | null
          quantity: number
          unit: string | null
          price: number | null
          is_optional: boolean | null
          display_order: number | null
          created_at: string | null
          item_type: string | null
        }
        Insert: {
          id?: string
          work_pack_id: string
          assembly_id?: string | null
          line_item_id?: string | null
          quantity: number
          unit?: string | null
          price?: number | null
          is_optional?: boolean | null
          display_order?: number | null
          created_at?: string | null
          item_type?: string | null
        }
        Update: {
          id?: string
          work_pack_id?: string
          assembly_id?: string | null
          line_item_id?: string | null
          quantity?: number
          unit?: string | null
          price?: number | null
          is_optional?: boolean | null
          display_order?: number | null
          created_at?: string | null
          item_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_work_pack_items_assembly"
            columns: ["assembly_id"]
            isOneToOne: false
            referencedRelation: "product_assemblies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_work_pack_items_line_item"
            columns: ["line_item_id"]
            isOneToOne: false
            referencedRelation: "line_items"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}