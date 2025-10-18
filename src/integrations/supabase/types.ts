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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          address: string | null
          company_name: string
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          notes: string | null
          organization_id: string
          phone: string | null
          status: Database["public"]["Enums"]["client_status"]
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          company_name: string
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          organization_id: string
          phone?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          company_name?: string
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          organization_id?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          client_id: string | null
          content: string
          created_at: string
          id: string
          opportunity_id: string | null
          organization_id: string
          project_id: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          content: string
          created_at?: string
          id?: string
          opportunity_id?: string | null
          organization_id: string
          project_id?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          content?: string
          created_at?: string
          id?: string
          opportunity_id?: string | null
          organization_id?: string
          project_id?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          actual_close_date: string | null
          client_id: string
          created_at: string
          description: string | null
          expected_close_date: string | null
          id: string
          name: string
          organization_id: string
          probability: number | null
          stage: Database["public"]["Enums"]["opportunity_stage"]
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          actual_close_date?: string | null
          client_id: string
          created_at?: string
          description?: string | null
          expected_close_date?: string | null
          id?: string
          name: string
          organization_id: string
          probability?: number | null
          stage?: Database["public"]["Enums"]["opportunity_stage"]
          updated_at?: string
          user_id: string
          value?: number
        }
        Update: {
          actual_close_date?: string | null
          client_id?: string
          created_at?: string
          description?: string | null
          expected_close_date?: string | null
          id?: string
          name?: string
          organization_id?: string
          probability?: number | null
          stage?: Database["public"]["Enums"]["opportunity_stage"]
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          domain: string | null
          icon: string | null
          id: string
          logo_url: string | null
          name: string
          primary_color: string | null
          settings: Json | null
          slug: string
          tagline: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          icon?: string | null
          id?: string
          logo_url?: string | null
          name: string
          primary_color?: string | null
          settings?: Json | null
          slug: string
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string | null
          icon?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          settings?: Json | null
          slug?: string
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget: number | null
          client_id: string
          created_at: string
          deadline: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          organization_id: string
          priority: Database["public"]["Enums"]["project_priority"]
          progress: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          budget?: number | null
          client_id: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          organization_id: string
          priority?: Database["public"]["Enums"]["project_priority"]
          progress?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          budget?: number | null
          client_id?: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          organization_id?: string
          priority?: Database["public"]["Enums"]["project_priority"]
          progress?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_competitor_analysis: {
        Row: {
          competitor_data: Json | null
          competitor_domain: string
          competitor_name: string | null
          created_at: string
          has_city_keyword: boolean | null
          has_service_keyword: boolean | null
          id: string
          phone: string | null
          position: number | null
          rating: number | null
          review_count: number | null
          seo_project_id: string
          website: string | null
        }
        Insert: {
          competitor_data?: Json | null
          competitor_domain: string
          competitor_name?: string | null
          created_at?: string
          has_city_keyword?: boolean | null
          has_service_keyword?: boolean | null
          id?: string
          phone?: string | null
          position?: number | null
          rating?: number | null
          review_count?: number | null
          seo_project_id: string
          website?: string | null
        }
        Update: {
          competitor_data?: Json | null
          competitor_domain?: string
          competitor_name?: string | null
          created_at?: string
          has_city_keyword?: boolean | null
          has_service_keyword?: boolean | null
          id?: string
          phone?: string | null
          position?: number | null
          rating?: number | null
          review_count?: number | null
          seo_project_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_competitor_analysis_seo_project_id_fkey"
            columns: ["seo_project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_content: {
        Row: {
          content_brief: string | null
          created_at: string
          generated_content: string | null
          id: string
          organization_id: string
          page_type: string
          seo_project_id: string | null
          seo_site_plan_id: string | null
          site_name: string
          status: Database["public"]["Enums"]["content_status"]
          target_keywords: string[] | null
          tone: Database["public"]["Enums"]["content_tone"] | null
          updated_at: string
          user_id: string
          word_count: number | null
        }
        Insert: {
          content_brief?: string | null
          created_at?: string
          generated_content?: string | null
          id?: string
          organization_id: string
          page_type: string
          seo_project_id?: string | null
          seo_site_plan_id?: string | null
          site_name: string
          status?: Database["public"]["Enums"]["content_status"]
          target_keywords?: string[] | null
          tone?: Database["public"]["Enums"]["content_tone"] | null
          updated_at?: string
          user_id: string
          word_count?: number | null
        }
        Update: {
          content_brief?: string | null
          created_at?: string
          generated_content?: string | null
          id?: string
          organization_id?: string
          page_type?: string
          seo_project_id?: string | null
          seo_site_plan_id?: string | null
          site_name?: string
          status?: Database["public"]["Enums"]["content_status"]
          target_keywords?: string[] | null
          tone?: Database["public"]["Enums"]["content_tone"] | null
          updated_at?: string
          user_id?: string
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_content_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seo_content_seo_project_id_fkey"
            columns: ["seo_project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seo_content_seo_site_plan_id_fkey"
            columns: ["seo_site_plan_id"]
            isOneToOne: false
            referencedRelation: "seo_site_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seo_content_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_keywords: {
        Row: {
          competition: string | null
          cpc: number | null
          created_at: string
          current_position: number | null
          difficulty: number | null
          id: string
          keyword: string
          search_volume: number | null
          seo_project_id: string
          target_position: number | null
          updated_at: string
        }
        Insert: {
          competition?: string | null
          cpc?: number | null
          created_at?: string
          current_position?: number | null
          difficulty?: number | null
          id?: string
          keyword: string
          search_volume?: number | null
          seo_project_id: string
          target_position?: number | null
          updated_at?: string
        }
        Update: {
          competition?: string | null
          cpc?: number | null
          created_at?: string
          current_position?: number | null
          difficulty?: number | null
          id?: string
          keyword?: string
          search_volume?: number | null
          seo_project_id?: string
          target_position?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_keywords_seo_project_id_fkey"
            columns: ["seo_project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_projects: {
        Row: {
          business_niche: string | null
          client_id: string | null
          created_at: string
          domain: string
          id: string
          name: string
          organization_id: string
          target_language: string | null
          target_location: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_niche?: string | null
          client_id?: string | null
          created_at?: string
          domain: string
          id?: string
          name: string
          organization_id: string
          target_language?: string | null
          target_location?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_niche?: string | null
          client_id?: string | null
          created_at?: string
          domain?: string
          id?: string
          name?: string
          organization_id?: string
          target_language?: string | null
          target_location?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seo_projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seo_projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_reports: {
        Row: {
          created_at: string
          id: string
          report_data: Json
          report_type: Database["public"]["Enums"]["seo_report_type"]
          seo_project_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          report_data: Json
          report_type: Database["public"]["Enums"]["seo_report_type"]
          seo_project_id: string
        }
        Update: {
          created_at?: string
          id?: string
          report_data?: Json
          report_type?: Database["public"]["Enums"]["seo_report_type"]
          seo_project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_reports_seo_project_id_fkey"
            columns: ["seo_project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_site_plans: {
        Row: {
          business_description: string | null
          business_name: string
          business_niche: string
          city: string
          client_id: string | null
          content_goals: string | null
          created_at: string
          id: string
          organization_id: string
          page_count: number | null
          seo_project_id: string | null
          state: string
          status: Database["public"]["Enums"]["project_status"]
          target_keywords: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_description?: string | null
          business_name: string
          business_niche: string
          city: string
          client_id?: string | null
          content_goals?: string | null
          created_at?: string
          id?: string
          organization_id: string
          page_count?: number | null
          seo_project_id?: string | null
          state: string
          status?: Database["public"]["Enums"]["project_status"]
          target_keywords?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_description?: string | null
          business_name?: string
          business_niche?: string
          city?: string
          client_id?: string | null
          content_goals?: string | null
          created_at?: string
          id?: string
          organization_id?: string
          page_count?: number | null
          seo_project_id?: string | null
          state?: string
          status?: Database["public"]["Enums"]["project_status"]
          target_keywords?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_site_plans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seo_site_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seo_site_plans_seo_project_id_fkey"
            columns: ["seo_project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seo_site_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sops: {
        Row: {
          category: Database["public"]["Enums"]["sop_category"]
          content: string
          created_at: string
          description: string
          id: string
          organization_id: string
          status: Database["public"]["Enums"]["sop_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["sop_category"]
          content: string
          created_at?: string
          description: string
          id?: string
          organization_id: string
          status?: Database["public"]["Enums"]["sop_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["sop_category"]
          content?: string
          created_at?: string
          description?: string
          id?: string
          organization_id?: string
          status?: Database["public"]["Enums"]["sop_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sops_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sops_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_organizations: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_organizations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          created_at: string
          error: string | null
          event_type: string
          id: string
          organization_id: string | null
          payload: Json
          processed: boolean | null
          processed_at: string | null
          source: string | null
        }
        Insert: {
          created_at?: string
          error?: string | null
          event_type: string
          id?: string
          organization_id?: string | null
          payload: Json
          processed?: boolean | null
          processed_at?: string | null
          source?: string | null
        }
        Update: {
          created_at?: string
          error?: string | null
          event_type?: string
          id?: string
          organization_id?: string | null
          payload?: Json
          processed?: boolean | null
          processed_at?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          created_at: string
          error: string | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          response_status: number | null
          webhook_id: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          response_status?: number | null
          webhook_id: string
        }
        Update: {
          created_at?: string
          error?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string
          events: string[]
          id: string
          last_triggered_at: string | null
          name: string
          organization_id: string
          secret: string
          status: Database["public"]["Enums"]["webhook_status"]
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          events: string[]
          id?: string
          last_triggered_at?: string | null
          name: string
          organization_id: string
          secret: string
          status?: Database["public"]["Enums"]["webhook_status"]
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          events?: string[]
          id?: string
          last_triggered_at?: string | null
          name?: string
          organization_id?: string
          secret?: string
          status?: Database["public"]["Enums"]["webhook_status"]
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhooks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_org_access: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      has_org_role: {
        Args: {
          _org_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_in_org: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "member" | "viewer"
      client_status: "active" | "inactive" | "lead"
      content_status: "draft" | "generated" | "published"
      content_tone:
        | "professional"
        | "friendly"
        | "authoritative"
        | "conversational"
      opportunity_stage:
        | "lead"
        | "qualified"
        | "proposal"
        | "negotiation"
        | "closed-won"
        | "closed-lost"
      project_priority: "low" | "medium" | "high"
      project_status: "planning" | "active" | "completed" | "on-hold"
      seo_report_type:
        | "keyword_research"
        | "competitor_analysis"
        | "site_plan"
        | "content"
      sop_category:
        | "operations"
        | "sales"
        | "marketing"
        | "customer_success"
        | "hr"
        | "finance"
      sop_status: "draft" | "published"
      webhook_status: "active" | "inactive"
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
      app_role: ["admin", "member", "viewer"],
      client_status: ["active", "inactive", "lead"],
      content_status: ["draft", "generated", "published"],
      content_tone: [
        "professional",
        "friendly",
        "authoritative",
        "conversational",
      ],
      opportunity_stage: [
        "lead",
        "qualified",
        "proposal",
        "negotiation",
        "closed-won",
        "closed-lost",
      ],
      project_priority: ["low", "medium", "high"],
      project_status: ["planning", "active", "completed", "on-hold"],
      seo_report_type: [
        "keyword_research",
        "competitor_analysis",
        "site_plan",
        "content",
      ],
      sop_category: [
        "operations",
        "sales",
        "marketing",
        "customer_success",
        "hr",
        "finance",
      ],
      sop_status: ["draft", "published"],
      webhook_status: ["active", "inactive"],
    },
  },
} as const
