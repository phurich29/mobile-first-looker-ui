export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_device_visibility: {
        Row: {
          created_at: string
          created_by: string
          device_code: string
          hidden_for_admin: boolean
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          device_code: string
          hidden_for_admin?: boolean
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          device_code?: string
          hidden_for_admin?: boolean
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
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
      guest_device_access: {
        Row: {
          created_at: string
          device_code: string
          enabled: boolean
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          device_code: string
          enabled?: boolean
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          device_code?: string
          enabled?: boolean
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          publish_date: string
          published: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          publish_date: string
          published?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          publish_date?: string
          published?: boolean | null
          title?: string
          updated_at?: string
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
          notification_count: number
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
          notification_count?: number
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
          notification_count?: number
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
      rice_quality_analysis: {
        Row: {
          black_kernel: number | null
          class1: number | null
          class2: number | null
          class3: number | null
          created_at: string | null
          device_code: string | null
          head_rice: number | null
          heavy_chalkiness_rate: number
          honey_rice: number | null
          id: number
          imperfection_rate: number | null
          impurity_num: number | null
          light_honey_rice: number
          other_backline: number
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
          topline_rate: number
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
          heavy_chalkiness_rate?: number
          honey_rice?: number | null
          id?: number
          imperfection_rate?: number | null
          impurity_num?: number | null
          light_honey_rice?: number
          other_backline?: number
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
          topline_rate?: number
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
          heavy_chalkiness_rate?: number
          honey_rice?: number | null
          id?: number
          imperfection_rate?: number | null
          impurity_num?: number | null
          light_honey_rice?: number
          other_backline?: number
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
          topline_rate?: number
          total_brokens?: number | null
          whiteness?: number | null
          whole_kernels?: number | null
          yellow_rice_rate?: number | null
        }
        Relationships: []
      }
      rice_quality_analysis_addon01: {
        Row: {
          created_at: string
          id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      shared_analysis_links: {
        Row: {
          analysis_id: number
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          share_token: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_id: number
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          share_token: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_id?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          share_token?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_shared_analysis_links_analysis_id"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "rice_quality_analysis"
            referencedColumns: ["id"]
          },
        ]
      }
      user_chart_preferences: {
        Row: {
          created_at: string
          device_code: string
          id: string
          preset_name: string
          selected_metrics: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_code: string
          id?: string
          preset_name?: string
          selected_metrics?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_code?: string
          id?: string
          preset_name?: string
          selected_metrics?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_device_access: {
        Row: {
          created_at: string
          created_by: string
          device_code: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          device_code: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          device_code?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_device_preferences: {
        Row: {
          created_at: string
          device_code: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_code: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_code?: string
          id?: string
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
      guest_enabled_devices: {
        Row: {
          device_code: string | null
          enabled: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_notification_thresholds: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_user_role_for_data_access: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      get_device_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          device_code: string
          updated_at: string
        }[]
      }
      get_devices_with_details: {
        Args: {
          user_id_param?: string
          is_admin_param?: boolean
          is_superadmin_param?: boolean
        }
        Returns: {
          device_code: string
          display_name: string
          updated_at: string
        }[]
      }
      get_guest_enabled_devices: {
        Args: Record<PropertyKey, never>
        Returns: {
          device_code: string
          enabled: boolean
        }[]
      }
      get_user_roles: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_device_access: {
        Args: { device_code_param: string }
        Returns: boolean
      }
      has_role: {
        Args: { user_id: string; role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      is_admin_or_superadmin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_or_superadmin_safe: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      log_security_check: {
        Args: { function_name: string; user_id: string; success: boolean }
        Returns: undefined
      }
      validate_password_strength: {
        Args: { password: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "admin" | "superadmin"
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
      app_role: ["user", "admin", "superadmin"],
    },
  },
} as const
