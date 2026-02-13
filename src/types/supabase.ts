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
      projects: {
        Row: {
          id: string
          customer_name: string
          customer_email: string | null
          project_type: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          customer_email?: string | null
          project_type?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          customer_email?: string | null
          project_type?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          project_id: string
          message: string
          role: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          message: string
          role: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          message?: string
          role?: string
          metadata?: Json | null
          created_at?: string
        }
      }
      insights: {
        Row: {
          id: string
          project_id: string
          category: string
          content: string
          confidence: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          category: string
          content: string
          confidence?: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          category?: string
          content?: string
          confidence?: number
          created_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          project_id: string
          file_url: string | null
          file_name: string | null
          version: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          file_url?: string | null
          file_name?: string | null
          version?: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          file_url?: string | null
          file_name?: string | null
          version?: number
          created_at?: string
        }
      }
    }
  }
}
