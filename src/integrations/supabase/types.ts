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
      classes: {
        Row: {
          created_at: string
          department_id: string
          id: string
          name: string
          student_count: number
          unit: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id: string
          id?: string
          name: string
          student_count?: number
          unit?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: string
          id?: string
          name?: string
          student_count?: number
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      equipment: {
        Row: {
          available_quantity: number
          category: string | null
          created_at: string
          description: string | null
          id: string
          location: string | null
          name: string
          requires_clearance: boolean | null
          total_quantity: number
          updated_at: string
        }
        Insert: {
          available_quantity: number
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name: string
          requires_clearance?: boolean | null
          total_quantity: number
          updated_at?: string
        }
        Update: {
          available_quantity?: number
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          requires_clearance?: boolean | null
          total_quantity?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          clearance_level: string | null
          created_at: string
          department: string | null
          departments: string[] | null
          full_name: string | null
          id: string
          rank: string | null
          role: Database["public"]["Enums"]["user_role"]
          unit: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          clearance_level?: string | null
          created_at?: string
          department?: string | null
          departments?: string[] | null
          full_name?: string | null
          id: string
          rank?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          unit?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          clearance_level?: string | null
          created_at?: string
          department?: string | null
          departments?: string[] | null
          full_name?: string | null
          id?: string
          rank?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          class_id: string | null
          class_name: string | null
          created_at: string
          end_time: string
          equipment_id: string | null
          equipment_quantity: number | null
          id: string
          participants: number | null
          purpose: string | null
          requires_commander_approval: boolean | null
          room_id: string | null
          start_time: string
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          class_id?: string | null
          class_name?: string | null
          created_at?: string
          end_time: string
          equipment_id?: string | null
          equipment_quantity?: number | null
          id?: string
          participants?: number | null
          purpose?: string | null
          requires_commander_approval?: boolean | null
          room_id?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          class_id?: string | null
          class_name?: string | null
          created_at?: string
          end_time?: string
          equipment_id?: string | null
          equipment_quantity?: number | null
          id?: string
          participants?: number | null
          purpose?: string | null
          requires_commander_approval?: boolean | null
          room_id?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          building: string | null
          capacity: number
          created_at: string
          equipment: string[] | null
          floor: string | null
          id: string
          is_available: boolean | null
          name: string
          type: Database["public"]["Enums"]["room_type"]
          updated_at: string
        }
        Insert: {
          building?: string | null
          capacity: number
          created_at?: string
          equipment?: string[] | null
          floor?: string | null
          id?: string
          is_available?: boolean | null
          name: string
          type: Database["public"]["Enums"]["room_type"]
          updated_at?: string
        }
        Update: {
          building?: string | null
          capacity?: number
          created_at?: string
          equipment?: string[] | null
          floor?: string | null
          id?: string
          is_available?: boolean | null
          name?: string
          type?: Database["public"]["Enums"]["room_type"]
          updated_at?: string
        }
        Relationships: []
      }
      teacher_classes: {
        Row: {
          class_id: string
          created_at: string
          id: string
          teacher_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          teacher_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      return_equipment: {
        Args: { equipment_id: string; quantity: number }
        Returns: undefined
      }
    }
    Enums: {
      request_status: "pending" | "approved" | "rejected" | "cancelled"
      room_type:
        | "classroom"
        | "training_room"
        | "weapons_room"
        | "tactical_room"
      user_role: "admin" | "supervisor" | "teacher"
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
      request_status: ["pending", "approved", "rejected", "cancelled"],
      room_type: [
        "classroom",
        "training_room",
        "weapons_room",
        "tactical_room",
      ],
      user_role: ["admin", "supervisor", "teacher"],
    },
  },
} as const
