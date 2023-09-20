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
      collection: {
        Row: {
          created_at: string
          description: string | null
          id: string
          parent: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          parent?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          parent?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_parent_fkey"
            columns: ["parent"]
            referencedRelation: "collection"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profile: {
        Row: {
          color: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          color?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          color?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      song: {
        Row: {
          collection: string | null
          copied_from: string | null
          created_at: string
          data: Json
          description: string | null
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          collection?: string | null
          copied_from?: string | null
          created_at?: string
          data: Json
          description?: string | null
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          collection?: string | null
          copied_from?: string | null
          created_at?: string
          data?: Json
          description?: string | null
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "song_collection_fkey"
            columns: ["collection"]
            referencedRelation: "collection"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_copied_from_fkey"
            columns: ["copied_from"]
            referencedRelation: "song"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
