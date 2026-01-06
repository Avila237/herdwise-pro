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
      animals: {
        Row: {
          birth_date: string | null
          category: string
          created_at: string
          current_dea: number | null
          current_del: number | null
          dry_off_date: string | null
          ear_tag: string | null
          electronic_tag: string | null
          expected_calving_date: string | null
          farm_id: string
          father_name: string | null
          first_calving_date: string | null
          grandfather_name: string | null
          great_grandfather_name: string | null
          id: string
          identification: string
          is_active: boolean
          ketosis: boolean | null
          lameness: boolean | null
          last_calving_date: string | null
          lot_id: string | null
          mastitis: boolean | null
          metritis: boolean | null
          mother_name: string | null
          name: string | null
          notes: string | null
          parity: string | null
          placental_retention: boolean | null
          productive_status: string | null
          reproductive_status: string | null
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          category?: string
          created_at?: string
          current_dea?: number | null
          current_del?: number | null
          dry_off_date?: string | null
          ear_tag?: string | null
          electronic_tag?: string | null
          expected_calving_date?: string | null
          farm_id: string
          father_name?: string | null
          first_calving_date?: string | null
          grandfather_name?: string | null
          great_grandfather_name?: string | null
          id?: string
          identification: string
          is_active?: boolean
          ketosis?: boolean | null
          lameness?: boolean | null
          last_calving_date?: string | null
          lot_id?: string | null
          mastitis?: boolean | null
          metritis?: boolean | null
          mother_name?: string | null
          name?: string | null
          notes?: string | null
          parity?: string | null
          placental_retention?: boolean | null
          productive_status?: string | null
          reproductive_status?: string | null
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          category?: string
          created_at?: string
          current_dea?: number | null
          current_del?: number | null
          dry_off_date?: string | null
          ear_tag?: string | null
          electronic_tag?: string | null
          expected_calving_date?: string | null
          farm_id?: string
          father_name?: string | null
          first_calving_date?: string | null
          grandfather_name?: string | null
          great_grandfather_name?: string | null
          id?: string
          identification?: string
          is_active?: boolean
          ketosis?: boolean | null
          lameness?: boolean | null
          last_calving_date?: string | null
          lot_id?: string | null
          mastitis?: boolean | null
          metritis?: boolean | null
          mother_name?: string | null
          name?: string | null
          notes?: string | null
          parity?: string | null
          placental_retention?: boolean | null
          productive_status?: string | null
          reproductive_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "animals_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animals_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          animal_id: string
          bull_name: string | null
          calf_count: number | null
          calf_sex: string | null
          calving_ease: string | null
          created_at: string
          days_post_ia: number | null
          diagnosis_result: string | null
          diagnosis_type: string | null
          event_date: string
          event_subtype: string | null
          event_type: string
          farm_id: string
          gnrh_at_ia: boolean | null
          ia_type: string | null
          id: string
          inseminator_name: string | null
          notes: string | null
          payload: Json
          protocol_day: string | null
          updated_at: string
          visit_number: number | null
        }
        Insert: {
          animal_id: string
          bull_name?: string | null
          calf_count?: number | null
          calf_sex?: string | null
          calving_ease?: string | null
          created_at?: string
          days_post_ia?: number | null
          diagnosis_result?: string | null
          diagnosis_type?: string | null
          event_date: string
          event_subtype?: string | null
          event_type: string
          farm_id: string
          gnrh_at_ia?: boolean | null
          ia_type?: string | null
          id?: string
          inseminator_name?: string | null
          notes?: string | null
          payload?: Json
          protocol_day?: string | null
          updated_at?: string
          visit_number?: number | null
        }
        Update: {
          animal_id?: string
          bull_name?: string | null
          calf_count?: number | null
          calf_sex?: string | null
          calving_ease?: string | null
          created_at?: string
          days_post_ia?: number | null
          diagnosis_result?: string | null
          diagnosis_type?: string | null
          event_date?: string
          event_subtype?: string | null
          event_type?: string
          farm_id?: string
          gnrh_at_ia?: boolean | null
          ia_type?: string | null
          id?: string
          inseminator_name?: string | null
          notes?: string | null
          payload?: Json
          protocol_day?: string | null
          updated_at?: string
          visit_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "events_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      farms: {
        Row: {
          created_at: string
          id: string
          location: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          created_at: string
          farm_id: string
          feature_name: string
          id: string
          is_enabled: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          farm_id: string
          feature_name: string
          id?: string
          is_enabled?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          farm_id?: string
          feature_name?: string
          id?: string
          is_enabled?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_flags_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      lots: {
        Row: {
          created_at: string
          description: string | null
          farm_id: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          farm_id: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          farm_id?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lots_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      metric_definitions: {
        Row: {
          category: string
          created_at: string
          critical_threshold: number | null
          decimals: number | null
          display_name: string
          farm_id: string | null
          format: string | null
          formula: string
          higher_is_better: boolean | null
          id: string
          is_active: boolean
          is_current: boolean
          name: string
          scope: string
          target_value: number | null
          unit: string | null
          updated_at: string
          version: number
          warning_threshold: number | null
        }
        Insert: {
          category?: string
          created_at?: string
          critical_threshold?: number | null
          decimals?: number | null
          display_name: string
          farm_id?: string | null
          format?: string | null
          formula: string
          higher_is_better?: boolean | null
          id?: string
          is_active?: boolean
          is_current?: boolean
          name: string
          scope?: string
          target_value?: number | null
          unit?: string | null
          updated_at?: string
          version?: number
          warning_threshold?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          critical_threshold?: number | null
          decimals?: number | null
          display_name?: string
          farm_id?: string | null
          format?: string | null
          formula?: string
          higher_is_better?: boolean | null
          id?: string
          is_active?: boolean
          is_current?: boolean
          name?: string
          scope?: string
          target_value?: number | null
          unit?: string | null
          updated_at?: string
          version?: number
          warning_threshold?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "metric_definitions_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      metric_results: {
        Row: {
          animal_id: string | null
          calculated_at: string
          calculation_details: Json | null
          farm_id: string
          formula_version: number
          id: string
          lot_id: string | null
          metric_definition_id: string
          period_end: string | null
          period_start: string | null
          reference_date: string
          value: number | null
          visit_number: number | null
        }
        Insert: {
          animal_id?: string | null
          calculated_at?: string
          calculation_details?: Json | null
          farm_id: string
          formula_version: number
          id?: string
          lot_id?: string | null
          metric_definition_id: string
          period_end?: string | null
          period_start?: string | null
          reference_date: string
          value?: number | null
          visit_number?: number | null
        }
        Update: {
          animal_id?: string | null
          calculated_at?: string
          calculation_details?: Json | null
          farm_id?: string
          formula_version?: number
          id?: string
          lot_id?: string | null
          metric_definition_id?: string
          period_end?: string | null
          period_start?: string | null
          reference_date?: string
          value?: number | null
          visit_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "metric_results_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metric_results_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metric_results_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metric_results_metric_definition_id_fkey"
            columns: ["metric_definition_id"]
            isOneToOne: false
            referencedRelation: "metric_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      parameters: {
        Row: {
          created_at: string
          description: string | null
          farm_id: string
          id: string
          is_current: boolean
          name: string
          value: string
          value_type: string
          version: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          farm_id: string
          id?: string
          is_current?: boolean
          name: string
          value: string
          value_type?: string
          version?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          farm_id?: string
          id?: string
          is_current?: boolean
          name?: string
          value?: string
          value_type?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "parameters_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const
