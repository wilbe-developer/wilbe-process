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
      module_videos: {
        Row: {
          id: string
          module_id: string
          module_name: string | null
          order_index: number | null
          video_id: string
        }
        Insert: {
          id?: string
          module_id: string
          module_name?: string | null
          order_index?: number | null
          video_id: string
        }
        Update: {
          id?: string
          module_id?: string
          module_name?: string | null
          order_index?: number | null
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_videos_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_videos_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_deck_builder_module: boolean | null
          order_index: number | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_deck_builder_module?: boolean | null
          order_index?: number | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_deck_builder_module?: boolean | null
          order_index?: number | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          about: string | null
          activity_status: string | null
          approved: boolean | null
          avatar: string | null
          bio: string | null
          cover_photo: string | null
          created_at: string | null
          email: string | null
          expertise: string | null
          first_name: string | null
          id: string
          institution: string | null
          last_login_date: string | null
          last_name: string | null
          linked_in: string | null
          location: string | null
          role: string | null
          status: string | null
          twitter_handle: string | null
          wix_creation_date: string | null
          wix_id: string | null
          wix_last_login: string | null
          wix_last_updated: string | null
        }
        Insert: {
          about?: string | null
          activity_status?: string | null
          approved?: boolean | null
          avatar?: string | null
          bio?: string | null
          cover_photo?: string | null
          created_at?: string | null
          email?: string | null
          expertise?: string | null
          first_name?: string | null
          id: string
          institution?: string | null
          last_login_date?: string | null
          last_name?: string | null
          linked_in?: string | null
          location?: string | null
          role?: string | null
          status?: string | null
          twitter_handle?: string | null
          wix_creation_date?: string | null
          wix_id?: string | null
          wix_last_login?: string | null
          wix_last_updated?: string | null
        }
        Update: {
          about?: string | null
          activity_status?: string | null
          approved?: boolean | null
          avatar?: string | null
          bio?: string | null
          cover_photo?: string | null
          created_at?: string | null
          email?: string | null
          expertise?: string | null
          first_name?: string | null
          id?: string
          institution?: string | null
          last_login_date?: string | null
          last_name?: string | null
          linked_in?: string | null
          location?: string | null
          role?: string | null
          status?: string | null
          twitter_handle?: string | null
          wix_creation_date?: string | null
          wix_id?: string | null
          wix_last_login?: string | null
          wix_last_updated?: string | null
        }
        Relationships: []
      }
      sprint_tasks: {
        Row: {
          content: string | null
          description: string | null
          id: string
          options: Json | null
          order_index: number
          question: string | null
          title: string
          upload_required: boolean
        }
        Insert: {
          content?: string | null
          description?: string | null
          id?: string
          options?: Json | null
          order_index: number
          question?: string | null
          title: string
          upload_required?: boolean
        }
        Update: {
          content?: string | null
          description?: string | null
          id?: string
          options?: Json | null
          order_index?: number
          question?: string | null
          title?: string
          upload_required?: boolean
        }
        Relationships: []
      }
      user_files: {
        Row: {
          download_url: string
          drive_file_id: string
          file_name: string
          id: string
          uploaded_at: string
          user_id: string
          view_url: string
        }
        Insert: {
          download_url: string
          drive_file_id: string
          file_name: string
          id?: string
          uploaded_at?: string
          user_id: string
          view_url: string
        }
        Update: {
          download_url?: string
          drive_file_id?: string
          file_name?: string
          id?: string
          uploaded_at?: string
          user_id?: string
          view_url?: string
        }
        Relationships: []
      }
      user_sprint_progress: {
        Row: {
          answers: Json | null
          completed: boolean
          completed_at: string | null
          created_at: string
          file_id: string | null
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          answers?: Json | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          file_id?: string | null
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          answers?: Json | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          file_id?: string | null
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sprint_progress_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "user_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_sprint_progress_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "sprint_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      video_progress: {
        Row: {
          completed: boolean | null
          created_at: string | null
          id: string
          last_watched_at: string | null
          progress_percentage: number | null
          updated_at: string | null
          user_id: string
          video_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          last_watched_at?: string | null
          progress_percentage?: number | null
          updated_at?: string | null
          user_id: string
          video_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          last_watched_at?: string | null
          progress_percentage?: number | null
          updated_at?: string | null
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_progress_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          content_id: string | null
          created_at: string | null
          description: string | null
          duration: string | null
          featured: boolean | null
          id: string
          length: string | null
          length_numeric: number | null
          presenter: string | null
          publish_date: string | null
          quiz: Json | null
          status: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          unpublish_date: string | null
          updated_at: string | null
          youtube_id: string | null
        }
        Insert: {
          content_id?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          featured?: boolean | null
          id?: string
          length?: string | null
          length_numeric?: number | null
          presenter?: string | null
          publish_date?: string | null
          quiz?: Json | null
          status?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          unpublish_date?: string | null
          updated_at?: string | null
          youtube_id?: string | null
        }
        Update: {
          content_id?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          featured?: boolean | null
          id?: string
          length?: string | null
          length_numeric?: number | null
          presenter?: string | null
          publish_date?: string | null
          quiz?: Json | null
          status?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          unpublish_date?: string | null
          updated_at?: string | null
          youtube_id?: string | null
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
    Enums: {},
  },
} as const
