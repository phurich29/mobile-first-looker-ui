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
      device_settings: {
        Row: {
          created_at: string | null
          device_code: string
          display_name: string | null
          graph_color: string
          id: string
          location: string | null
          report_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          device_code: string
          display_name?: string | null
          graph_color?: string
          id?: string
          location?: string | null
          report_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          device_code?: string
          display_name?: string | null
          graph_color?: string
          id?: string
          location?: string | null
          report_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          created_at: string
          device_code: string
          enabled: boolean | null
          id: string
          max_enabled: boolean | null
          max_threshold: number | null
          min_enabled: boolean | null
          min_threshold: number | null
          rice_type_id: string
          rice_type_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_code: string
          enabled?: boolean | null
          id?: string
          max_enabled?: boolean | null
          max_threshold?: number | null
          min_enabled?: boolean | null
          min_threshold?: number | null
          rice_type_id: string
          rice_type_name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_code?: string
          enabled?: boolean | null
          id?: string
          max_enabled?: boolean | null
          max_threshold?: number | null
          min_enabled?: boolean | null
          min_threshold?: number | null
          rice_type_id?: string
          rice_type_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          analysis_id: number | null
          created_at: string | null
          device_code: string
          id: string
          notification_message: string | null
          read: boolean | null
          rice_type_id: string
          threshold_type: string
          timestamp: string | null
          user_id: string | null
          value: number
        }
        Insert: {
          analysis_id?: number | null
          created_at?: string | null
          device_code: string
          id?: string
          notification_message?: string | null
          read?: boolean | null
          rice_type_id: string
          threshold_type: string
          timestamp?: string | null
          user_id?: string | null
          value: number
        }
        Update: {
          analysis_id?: number | null
          created_at?: string | null
          device_code?: string
          id?: string
          notification_message?: string | null
          read?: boolean | null
          rice_type_id?: string
          threshold_type?: string
          timestamp?: string | null
          user_id?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "notifications_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "rice_quality_analysis"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      rice_price_documents: {
        Row: {
          created_at: string | null
          document_date: string
          file_url: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          document_date: string
          file_url: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          document_date?: string
          file_url?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      rice_prices: {
        Row: {
          category: string
          created_at: string | null
          id: string
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      rice_quality_analysis: {
        Row: {
          black_kernel: number | null
          class1: number | null
          class2: number | null
          class3: number | null
          created_at: string | null
          device_code: string | null
          head_rice: number | null
          honey_rice: number | null
          id: number
          imperfection_rate: number | null
          impurity_num: number | null
          output: number | null
          paddy_rate: number | null
          parboiled_red_line: number | null
          parboiled_white_rice: number | null
          partly_black: number | null
          partly_black_peck: number | null
          process_precision: number | null
          red_line_rate: number | null
          sample_index: number | null
          short_grain: number | null
          slender_kernel: number | null
          small_brokens: number | null
          small_brokens_c1: number | null
          sticky_rice_rate: number | null
          thai_datetime: string | null
          total_brokens: number | null
          whiteness: number | null
          whole_kernels: number | null
          yellow_rice_rate: number | null
        }
        Insert: {
          black_kernel?: number | null
          class1?: number | null
          class2?: number | null
          class3?: number | null
          created_at?: string | null
          device_code?: string | null
          head_rice?: number | null
          honey_rice?: number | null
          id?: number
          imperfection_rate?: number | null
          impurity_num?: number | null
          output?: number | null
          paddy_rate?: number | null
          parboiled_red_line?: number | null
          parboiled_white_rice?: number | null
          partly_black?: number | null
          partly_black_peck?: number | null
          process_precision?: number | null
          red_line_rate?: number | null
          sample_index?: number | null
          short_grain?: number | null
          slender_kernel?: number | null
          small_brokens?: number | null
          small_brokens_c1?: number | null
          sticky_rice_rate?: number | null
          thai_datetime?: string | null
          total_brokens?: number | null
          whiteness?: number | null
          whole_kernels?: number | null
          yellow_rice_rate?: number | null
        }
        Update: {
          black_kernel?: number | null
          class1?: number | null
          class2?: number | null
          class3?: number | null
          created_at?: string | null
          device_code?: string | null
          head_rice?: number | null
          honey_rice?: number | null
          id?: number
          imperfection_rate?: number | null
          impurity_num?: number | null
          output?: number | null
          paddy_rate?: number | null
          parboiled_red_line?: number | null
          parboiled_white_rice?: number | null
          partly_black?: number | null
          partly_black_peck?: number | null
          process_precision?: number | null
          red_line_rate?: number | null
          sample_index?: number | null
          short_grain?: number | null
          slender_kernel?: number | null
          small_brokens?: number | null
          small_brokens_c1?: number | null
          sticky_rice_rate?: number | null
          thai_datetime?: string | null
          total_brokens?: number | null
          whiteness?: number | null
          whole_kernels?: number | null
          yellow_rice_rate?: number | null
        }
        Relationships: []
      }
      user_chart_preferences: {
        Row: {
          created_at: string
          device_code: string
          id: string
          selected_metrics: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_code: string
          id?: string
          selected_metrics?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_code?: string
          id?: string
          selected_metrics?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_roles: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: { user_id: string; role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "admin" | "superadmin" | "waiting_list"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "admin", "superadmin", "waiting_list"],
    },
  },
} as const
