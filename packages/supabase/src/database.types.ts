export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      auth_methods: {
        Row: {
          created_at: string | null;
          id: string;
          is_active: boolean | null;
          last_used: string | null;
          method: string;
          provider: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          last_used?: string | null;
          method: string;
          provider?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          last_used?: string | null;
          method?: string;
          provider?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "auth_methods_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "dashboard_view";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "auth_methods_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "auth_methods_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles_complete";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_sessions: {
        Row: {
          created_at: string | null;
          expires_at: string | null;
          id: string;
          last_activity: string | null;
          module_slug: string;
          session_data: Json | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          expires_at?: string | null;
          id?: string;
          last_activity?: string | null;
          module_slug: string;
          session_data?: Json | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          expires_at?: string | null;
          id?: string;
          last_activity?: string | null;
          module_slug?: string;
          session_data?: Json | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "chat_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "dashboard_view";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "chat_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chat_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles_complete";
            referencedColumns: ["id"];
          },
        ];
      };
      communication_preferences: {
        Row: {
          billing_reminders: boolean;
          client_id: string;
          created_at: string;
          digest_frequency: string;
          email_format: string;
          feature_announcements: boolean;
          id: string;
          maintenance_alerts: boolean;
          marketing_emails: boolean;
          newsletter: boolean;
          product_updates: boolean;
          security_alerts: boolean;
          updated_at: string;
          usage_reports: boolean;
        };
        Insert: {
          billing_reminders?: boolean;
          client_id: string;
          created_at?: string;
          digest_frequency?: string;
          email_format?: string;
          feature_announcements?: boolean;
          id?: string;
          maintenance_alerts?: boolean;
          marketing_emails?: boolean;
          newsletter?: boolean;
          product_updates?: boolean;
          security_alerts?: boolean;
          updated_at?: string;
          usage_reports?: boolean;
        };
        Update: {
          billing_reminders?: boolean;
          client_id?: string;
          created_at?: string;
          digest_frequency?: string;
          email_format?: string;
          feature_announcements?: boolean;
          id?: string;
          maintenance_alerts?: boolean;
          marketing_emails?: boolean;
          newsletter?: boolean;
          product_updates?: boolean;
          security_alerts?: boolean;
          updated_at?: string;
          usage_reports?: boolean;
        };
        Relationships: [];
      };
      contact_requests: {
        Row: {
          assigned_to: string | null;
          company: string;
          consent_timestamp: string | null;
          contacted_at: string | null;
          created_at: string;
          email: string;
          gdpr_consent: boolean;
          id: string;
          lookup_key: string | null;
          message: string;
          name: string;
          notes: string | null;
          phone: string | null;
          plan: string | null;
          priority: string | null;
          source: string | null;
          status: string | null;
          updated_at: string;
        };
        Insert: {
          assigned_to?: string | null;
          company: string;
          consent_timestamp?: string | null;
          contacted_at?: string | null;
          created_at?: string;
          email: string;
          gdpr_consent?: boolean;
          id?: string;
          lookup_key?: string | null;
          message: string;
          name: string;
          notes?: string | null;
          phone?: string | null;
          plan?: string | null;
          priority?: string | null;
          source?: string | null;
          status?: string | null;
          updated_at?: string;
        };
        Update: {
          assigned_to?: string | null;
          company?: string;
          consent_timestamp?: string | null;
          contacted_at?: string | null;
          created_at?: string;
          email?: string;
          gdpr_consent?: boolean;
          id?: string;
          lookup_key?: string | null;
          message?: string;
          name?: string;
          notes?: string | null;
          phone?: string | null;
          plan?: string | null;
          priority?: string | null;
          source?: string | null;
          status?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      content_approvals: {
        Row: {
          approver_id: string | null;
          content_id: string | null;
          created_at: string;
          feedback: string | null;
          id: string;
          reviewed_at: string | null;
          status: string;
          submitter_id: string | null;
          updated_at: string;
        };
        Insert: {
          approver_id?: string | null;
          content_id?: string | null;
          created_at?: string;
          feedback?: string | null;
          id?: string;
          reviewed_at?: string | null;
          status: string;
          submitter_id?: string | null;
          updated_at?: string;
        };
        Update: {
          approver_id?: string | null;
          content_id?: string | null;
          created_at?: string;
          feedback?: string | null;
          id?: string;
          reviewed_at?: string | null;
          status?: string;
          submitter_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "content_approvals_approver_id_fkey";
            columns: ["approver_id"];
            isOneToOne: false;
            referencedRelation: "dashboard_view";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "content_approvals_approver_id_fkey";
            columns: ["approver_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "content_approvals_approver_id_fkey";
            columns: ["approver_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles_complete";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "content_approvals_content_id_fkey";
            columns: ["content_id"];
            isOneToOne: false;
            referencedRelation: "generated_content";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "content_approvals_submitter_id_fkey";
            columns: ["submitter_id"];
            isOneToOne: false;
            referencedRelation: "dashboard_view";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "content_approvals_submitter_id_fkey";
            columns: ["submitter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "content_approvals_submitter_id_fkey";
            columns: ["submitter_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles_complete";
            referencedColumns: ["id"];
          },
        ];
      };
      credits: {
        Row: {
          amount: number;
          created_at: string | null;
          description: string | null;
          id: string;
          metadata: Json | null;
          module_slug: string | null;
          origin: string;
          plan_id: string | null;
          stripe_payment_intent_id: string | null;
          stripe_subscription_id: string | null;
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          metadata?: Json | null;
          module_slug?: string | null;
          origin: string;
          plan_id?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_subscription_id?: string | null;
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          metadata?: Json | null;
          module_slug?: string | null;
          origin?: string;
          plan_id?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_subscription_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "credits_module_slug_fkey";
            columns: ["module_slug"];
            isOneToOne: false;
            referencedRelation: "modules";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "credits_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "credits_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "dashboard_view";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "credits_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "credits_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles_complete";
            referencedColumns: ["id"];
          },
        ];
      };
      formation_access: {
        Row: {
          accessed_at: string | null;
          credits_spent: number | null;
          file_path: string;
          format_id: string;
          id: string;
          level_id: string;
          metadata: Json | null;
          module_id: string | null;
          user_id: string | null;
        };
        Insert: {
          accessed_at?: string | null;
          credits_spent?: number | null;
          file_path: string;
          format_id: string;
          id?: string;
          level_id: string;
          metadata?: Json | null;
          module_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          accessed_at?: string | null;
          credits_spent?: number | null;
          file_path?: string;
          format_id?: string;
          id?: string;
          level_id?: string;
          metadata?: Json | null;
          module_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "formation_access_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "modules";
            referencedColumns: ["id"];
          },
        ];
      };
      generated_content: {
        Row: {
          created_at: string | null;
          file_path: string | null;
          html_preview: string | null;
          id: string;
          is_favorite: boolean | null;
          metadata: Json | null;
          module_id: string | null;
          module_slug: string | null;
          status: string;
          tags: string[] | null;
          title: string | null;
          type: string | null;
          updated_at: string | null;
          url: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          file_path?: string | null;
          html_preview?: string | null;
          id?: string;
          is_favorite?: boolean | null;
          metadata?: Json | null;
          module_id?: string | null;
          module_slug?: string | null;
          status?: string;
          tags?: string[] | null;
          title?: string | null;
          type?: string | null;
          updated_at?: string | null;
          url?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          file_path?: string | null;
          html_preview?: string | null;
          id?: string;
          is_favorite?: boolean | null;
          metadata?: Json | null;
          module_id?: string | null;
          module_slug?: string | null;
          status?: string;
          tags?: string[] | null;
          title?: string | null;
          type?: string | null;
          updated_at?: string | null;
          url?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "generated_content_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "modules";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "generated_content_module_slug_fkey";
            columns: ["module_slug"];
            isOneToOne: false;
            referencedRelation: "modules";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "generated_content_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "dashboard_view";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "generated_content_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "generated_content_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles_complete";
            referencedColumns: ["id"];
          },
        ];
      };
      module_usage: {
        Row: {
          created_at: string | null;
          credits_used: number;
          error_message: string | null;
          execution_time: number | null;
          id: string;
          input: Json | null;
          metadata: Json | null;
          module_id: string | null;
          module_slug: string | null;
          output: Json | null;
          status: string | null;
          used_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          credits_used: number;
          error_message?: string | null;
          execution_time?: number | null;
          id?: string;
          input?: Json | null;
          metadata?: Json | null;
          module_id?: string | null;
          module_slug?: string | null;
          output?: Json | null;
          status?: string | null;
          used_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          credits_used?: number;
          error_message?: string | null;
          execution_time?: number | null;
          id?: string;
          input?: Json | null;
          metadata?: Json | null;
          module_id?: string | null;
          module_slug?: string | null;
          output?: Json | null;
          status?: string | null;
          used_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "module_usage_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "modules";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "module_usage_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "dashboard_view";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "module_usage_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "module_usage_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles_complete";
            referencedColumns: ["id"];
          },
        ];
      };
      modules: {
        Row: {
          category: string | null;
          component_url: string | null;
          config: Json | null;
          created_at: string | null;
          credit_cost: number;
          description: string | null;
          documentation_url: string | null;
          endpoint: string;
          icon_url: string | null;
          id: string;
          is_active: boolean | null;
          metadata: Json | null;
          n8n_trigger_type: string | null;
          n8n_webhook_url: string | null;
          name: string;
          slug: string;
          type: string;
          updated_at: string | null;
        };
        Insert: {
          category?: string | null;
          component_url?: string | null;
          config?: Json | null;
          created_at?: string | null;
          credit_cost?: number;
          description?: string | null;
          documentation_url?: string | null;
          endpoint: string;
          icon_url?: string | null;
          id?: string;
          is_active?: boolean | null;
          metadata?: Json | null;
          n8n_trigger_type?: string | null;
          n8n_webhook_url?: string | null;
          name: string;
          slug: string;
          type: string;
          updated_at?: string | null;
        };
        Update: {
          category?: string | null;
          component_url?: string | null;
          config?: Json | null;
          created_at?: string | null;
          credit_cost?: number;
          description?: string | null;
          documentation_url?: string | null;
          endpoint?: string;
          icon_url?: string | null;
          id?: string;
          is_active?: boolean | null;
          metadata?: Json | null;
          n8n_trigger_type?: string | null;
          n8n_webhook_url?: string | null;
          name?: string;
          slug?: string;
          type?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          created_at: string | null;
          data: Json | null;
          expires_at: string | null;
          id: string;
          is_read: boolean | null;
          message: string;
          title: string;
          type: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          data?: Json | null;
          expires_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          message: string;
          title: string;
          type: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          data?: Json | null;
          expires_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          message?: string;
          title?: string;
          type?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "dashboard_view";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles_complete";
            referencedColumns: ["id"];
          },
        ];
      };
      pending_notifications: {
        Row: {
          company: string;
          contact_id: string;
          created_at: string | null;
          id: string;
          name: string;
          plan: string | null;
        };
        Insert: {
          company: string;
          contact_id: string;
          created_at?: string | null;
          id?: string;
          name: string;
          plan?: string | null;
        };
        Update: {
          company?: string;
          contact_id?: string;
          created_at?: string | null;
          id?: string;
          name?: string;
          plan?: string | null;
        };
        Relationships: [];
      };
      plan_history: {
        Row: {
          created_at: string | null;
          end_date: string | null;
          id: string;
          is_active: boolean | null;
          plan_id: string | null;
          start_date: string;
          stripe_subscription_id: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          end_date?: string | null;
          id?: string;
          is_active?: boolean | null;
          plan_id?: string | null;
          start_date: string;
          stripe_subscription_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          end_date?: string | null;
          id?: string;
          is_active?: boolean | null;
          plan_id?: string | null;
          start_date?: string;
          stripe_subscription_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "plan_history_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plan_history_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "dashboard_view";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "plan_history_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plan_history_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles_complete";
            referencedColumns: ["id"];
          },
        ];
      };
      plans: {
        Row: {
          created_at: string | null;
          features: Json | null;
          id: string;
          initial_credits: number | null;
          is_active: boolean | null;
          monthly_credits: number;
          name: string;
          price_cents: number;
          stripe_price_id: string | null;
          stripe_product_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          features?: Json | null;
          id?: string;
          initial_credits?: number | null;
          is_active?: boolean | null;
          monthly_credits: number;
          name: string;
          price_cents: number;
          stripe_price_id?: string | null;
          stripe_product_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          features?: Json | null;
          id?: string;
          initial_credits?: number | null;
          is_active?: boolean | null;
          monthly_credits?: number;
          name?: string;
          price_cents?: number;
          stripe_price_id?: string | null;
          stripe_product_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          confirmed_at: string | null;
          created_at: string | null;
          credit_balance: number | null;
          current_period_end: string | null;
          email: string | null;
          email_confirmed_at: string | null;
          full_name: string | null;
          id: string;
          language: string | null;
          last_credit_refresh: string | null;
          last_sign_in_at: string | null;
          phone: string | null;
          phone_confirmed_at: string | null;
          plan_id: string | null;
          renewal_date: string | null;
          role: string | null;
          social_sessions: Json | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          stripe_subscription_status: string | null;
          timezone: string | null;
          twofa_enabled: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          confirmed_at?: string | null;
          created_at?: string | null;
          credit_balance?: number | null;
          current_period_end?: string | null;
          email?: string | null;
          email_confirmed_at?: string | null;
          full_name?: string | null;
          id: string;
          language?: string | null;
          last_credit_refresh?: string | null;
          last_sign_in_at?: string | null;
          phone?: string | null;
          phone_confirmed_at?: string | null;
          plan_id?: string | null;
          renewal_date?: string | null;
          role?: string | null;
          social_sessions?: Json | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_subscription_status?: string | null;
          timezone?: string | null;
          twofa_enabled?: boolean | null;
          updated_at?: string | null;
        };
        Update: {
          confirmed_at?: string | null;
          created_at?: string | null;
          credit_balance?: number | null;
          current_period_end?: string | null;
          email?: string | null;
          email_confirmed_at?: string | null;
          full_name?: string | null;
          id?: string;
          language?: string | null;
          last_credit_refresh?: string | null;
          last_sign_in_at?: string | null;
          phone?: string | null;
          phone_confirmed_at?: string | null;
          plan_id?: string | null;
          renewal_date?: string | null;
          role?: string | null;
          social_sessions?: Json | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_subscription_status?: string | null;
          timezone?: string | null;
          twofa_enabled?: boolean | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fk_profiles_plan_id";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
        ];
      };
      real_estate_templates: {
        Row: {
          category: string | null;
          created_at: string | null;
          file_path: string;
          file_size: number | null;
          id: string;
          is_public: boolean | null;
          lease_type: string;
          name: string;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          category?: string | null;
          created_at?: string | null;
          file_path: string;
          file_size?: number | null;
          id?: string;
          is_public?: boolean | null;
          lease_type: string;
          name: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          category?: string | null;
          created_at?: string | null;
          file_path?: string;
          file_size?: number | null;
          id?: string;
          is_public?: boolean | null;
          lease_type?: string;
          name?: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      scheduled_tasks: {
        Row: {
          completed_at: string | null;
          created_at: string | null;
          execution_time: string;
          generated_content_id: string | null;
          id: string;
          module_id: string;
          payload: Json;
          result: Json | null;
          started_at: string | null;
          status: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string | null;
          execution_time: string;
          generated_content_id?: string | null;
          id?: string;
          module_id: string;
          payload: Json;
          result?: Json | null;
          started_at?: string | null;
          status?: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string | null;
          execution_time?: string;
          generated_content_id?: string | null;
          id?: string;
          module_id?: string;
          payload?: Json;
          result?: Json | null;
          started_at?: string | null;
          status?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scheduled_tasks_generated_content_id_fkey";
            columns: ["generated_content_id"];
            isOneToOne: false;
            referencedRelation: "generated_content";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "scheduled_tasks_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "modules";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "scheduled_tasks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "dashboard_view";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "scheduled_tasks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "scheduled_tasks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles_complete";
            referencedColumns: ["id"];
          },
        ];
      };
      settings: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          is_public: boolean | null;
          updated_at: string | null;
          value: Json;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id: string;
          is_public?: boolean | null;
          updated_at?: string | null;
          value: Json;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_public?: boolean | null;
          updated_at?: string | null;
          value?: Json;
        };
        Relationships: [];
      };
      social_tokens: {
        Row: {
          access_token: string;
          created_at: string | null;
          expires_at: string | null;
          id: string;
          is_valid: boolean | null;
          last_used: string | null;
          platform: string;
          platform_user_id: string | null;
          platform_username: string | null;
          refresh_token: string | null;
          scopes: string[] | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          access_token: string;
          created_at?: string | null;
          expires_at?: string | null;
          id?: string;
          is_valid?: boolean | null;
          last_used?: string | null;
          platform: string;
          platform_user_id?: string | null;
          platform_username?: string | null;
          refresh_token?: string | null;
          scopes?: string[] | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          access_token?: string;
          created_at?: string | null;
          expires_at?: string | null;
          id?: string;
          is_valid?: boolean | null;
          last_used?: string | null;
          platform?: string;
          platform_user_id?: string | null;
          platform_username?: string | null;
          refresh_token?: string | null;
          scopes?: string[] | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "social_tokens_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "dashboard_view";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "social_tokens_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "social_tokens_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles_complete";
            referencedColumns: ["id"];
          },
        ];
      };
      transcription_segments: {
        Row: {
          confidence: number | null;
          created_at: string | null;
          end_time: number;
          id: string;
          segment_index: number | null;
          speaker_id: string | null;
          speaker_name: string | null;
          start_time: number;
          text: string;
          transcription_id: string | null;
        };
        Insert: {
          confidence?: number | null;
          created_at?: string | null;
          end_time: number;
          id?: string;
          segment_index?: number | null;
          speaker_id?: string | null;
          speaker_name?: string | null;
          start_time: number;
          text: string;
          transcription_id?: string | null;
        };
        Update: {
          confidence?: number | null;
          created_at?: string | null;
          end_time?: number;
          id?: string;
          segment_index?: number | null;
          speaker_id?: string | null;
          speaker_name?: string | null;
          start_time?: number;
          text?: string;
          transcription_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "transcription_segments_transcription_id_fkey";
            columns: ["transcription_id"];
            isOneToOne: false;
            referencedRelation: "transcriptions";
            referencedColumns: ["id"];
          },
        ];
      };
      transcriptions: {
        Row: {
          add_punctuation: boolean | null;
          add_timestamps: boolean | null;
          completed_at: string | null;
          confidence_score: number | null;
          created_at: string | null;
          custom_instructions: string | null;
          error_message: string | null;
          expires_at: string | null;
          file_name: string;
          file_path: string | null;
          file_size: number | null;
          file_type: string | null;
          file_url: string | null;
          generate_summary: boolean | null;
          id: string;
          language: string | null;
          module_usage_id: string | null;
          n8n_execution_id: string | null;
          n8n_webhook_url: string | null;
          output_format: string | null;
          publish_to_content: boolean | null;
          quality: string | null;
          remove_fillers: boolean | null;
          retry_count: number | null;
          segments: Json | null;
          speaker_diarization: boolean | null;
          speakers: Json | null;
          status: string | null;
          summary_text: string | null;
          transcript_text: string | null;
          transcription_type: string;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          add_punctuation?: boolean | null;
          add_timestamps?: boolean | null;
          completed_at?: string | null;
          confidence_score?: number | null;
          created_at?: string | null;
          custom_instructions?: string | null;
          error_message?: string | null;
          expires_at?: string | null;
          file_name: string;
          file_path?: string | null;
          file_size?: number | null;
          file_type?: string | null;
          file_url?: string | null;
          generate_summary?: boolean | null;
          id?: string;
          language?: string | null;
          module_usage_id?: string | null;
          n8n_execution_id?: string | null;
          n8n_webhook_url?: string | null;
          output_format?: string | null;
          publish_to_content?: boolean | null;
          quality?: string | null;
          remove_fillers?: boolean | null;
          retry_count?: number | null;
          segments?: Json | null;
          speaker_diarization?: boolean | null;
          speakers?: Json | null;
          status?: string | null;
          summary_text?: string | null;
          transcript_text?: string | null;
          transcription_type: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          add_punctuation?: boolean | null;
          add_timestamps?: boolean | null;
          completed_at?: string | null;
          confidence_score?: number | null;
          created_at?: string | null;
          custom_instructions?: string | null;
          error_message?: string | null;
          expires_at?: string | null;
          file_name?: string;
          file_path?: string | null;
          file_size?: number | null;
          file_type?: string | null;
          file_url?: string | null;
          generate_summary?: boolean | null;
          id?: string;
          language?: string | null;
          module_usage_id?: string | null;
          n8n_execution_id?: string | null;
          n8n_webhook_url?: string | null;
          output_format?: string | null;
          publish_to_content?: boolean | null;
          quality?: string | null;
          remove_fillers?: boolean | null;
          retry_count?: number | null;
          segments?: Json | null;
          speaker_diarization?: boolean | null;
          speakers?: Json | null;
          status?: string | null;
          summary_text?: string | null;
          transcript_text?: string | null;
          transcription_type?: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "transcriptions_module_usage_id_fkey";
            columns: ["module_usage_id"];
            isOneToOne: false;
            referencedRelation: "module_usage";
            referencedColumns: ["id"];
          },
        ];
      };
      trigger_logs: {
        Row: {
          content_id: string | null;
          created_at: string | null;
          data: Json | null;
          id: string;
          message: string | null;
        };
        Insert: {
          content_id?: string | null;
          created_at?: string | null;
          data?: Json | null;
          id?: string;
          message?: string | null;
        };
        Update: {
          content_id?: string | null;
          created_at?: string | null;
          data?: Json | null;
          id?: string;
          message?: string | null;
        };
        Relationships: [];
      };
      user_modules: {
        Row: {
          created_at: string | null;
          id: string;
          is_enabled: boolean | null;
          module_slug: string;
          settings: Json | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_enabled?: boolean | null;
          module_slug: string;
          settings?: Json | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_enabled?: boolean | null;
          module_slug?: string;
          settings?: Json | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_modules_module_slug_fkey";
            columns: ["module_slug"];
            isOneToOne: false;
            referencedRelation: "modules";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "user_modules_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "dashboard_view";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "user_modules_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_modules_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles_complete";
            referencedColumns: ["id"];
          },
        ];
      };
      youtube_analytics: {
        Row: {
          age_groups: Json | null;
          average_view_duration: number | null;
          click_through_rate: number | null;
          comments_count: number | null;
          dislikes_count: number | null;
          gender_distribution: Json | null;
          id: string;
          likes_count: number | null;
          period_end: string | null;
          period_start: string | null;
          recorded_at: string | null;
          shares_count: number | null;
          top_countries: Json | null;
          traffic_sources: Json | null;
          views_count: number | null;
          watch_time_minutes: number | null;
          youtube_upload_id: string | null;
        };
        Insert: {
          age_groups?: Json | null;
          average_view_duration?: number | null;
          click_through_rate?: number | null;
          comments_count?: number | null;
          dislikes_count?: number | null;
          gender_distribution?: Json | null;
          id?: string;
          likes_count?: number | null;
          period_end?: string | null;
          period_start?: string | null;
          recorded_at?: string | null;
          shares_count?: number | null;
          top_countries?: Json | null;
          traffic_sources?: Json | null;
          views_count?: number | null;
          watch_time_minutes?: number | null;
          youtube_upload_id?: string | null;
        };
        Update: {
          age_groups?: Json | null;
          average_view_duration?: number | null;
          click_through_rate?: number | null;
          comments_count?: number | null;
          dislikes_count?: number | null;
          gender_distribution?: Json | null;
          id?: string;
          likes_count?: number | null;
          period_end?: string | null;
          period_start?: string | null;
          recorded_at?: string | null;
          shares_count?: number | null;
          top_countries?: Json | null;
          traffic_sources?: Json | null;
          views_count?: number | null;
          watch_time_minutes?: number | null;
          youtube_upload_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "youtube_analytics_youtube_upload_id_fkey";
            columns: ["youtube_upload_id"];
            isOneToOne: false;
            referencedRelation: "youtube_uploads";
            referencedColumns: ["id"];
          },
        ];
      };
      youtube_uploads: {
        Row: {
          category: string | null;
          comment_count: number | null;
          cost_used: number | null;
          created_at: string | null;
          description: string | null;
          error_message: string | null;
          expires_at: string | null;
          generate_ai_thumbnail: boolean | null;
          id: string;
          like_count: number | null;
          module_id: string | null;
          module_usage_id: string | null;
          n8n_execution_id: string | null;
          n8n_webhook_url: string | null;
          optimal_publish_time: string | null;
          privacy: string | null;
          published_at: string | null;
          retry_count: number | null;
          seo_score: number | null;
          status: string | null;
          suggested_tags: string[] | null;
          tags: string[] | null;
          thumbnail_file_name: string | null;
          thumbnail_file_path: string | null;
          thumbnail_file_url: string | null;
          title: string;
          updated_at: string | null;
          user_id: string | null;
          video_file_name: string;
          video_file_path: string | null;
          video_file_size: number | null;
          video_file_type: string | null;
          video_file_url: string | null;
          video_type: string;
          view_count: number | null;
          youtube_embeddable: boolean | null;
          youtube_license: string | null;
          youtube_privacy_status: string | null;
          youtube_status: string | null;
          youtube_thumbnail_url: string | null;
          youtube_video_id: string | null;
          youtube_video_url: string | null;
        };
        Insert: {
          category?: string | null;
          comment_count?: number | null;
          cost_used?: number | null;
          created_at?: string | null;
          description?: string | null;
          error_message?: string | null;
          expires_at?: string | null;
          generate_ai_thumbnail?: boolean | null;
          id?: string;
          like_count?: number | null;
          module_id?: string | null;
          module_usage_id?: string | null;
          n8n_execution_id?: string | null;
          n8n_webhook_url?: string | null;
          optimal_publish_time?: string | null;
          privacy?: string | null;
          published_at?: string | null;
          retry_count?: number | null;
          seo_score?: number | null;
          status?: string | null;
          suggested_tags?: string[] | null;
          tags?: string[] | null;
          thumbnail_file_name?: string | null;
          thumbnail_file_path?: string | null;
          thumbnail_file_url?: string | null;
          title: string;
          updated_at?: string | null;
          user_id?: string | null;
          video_file_name: string;
          video_file_path?: string | null;
          video_file_size?: number | null;
          video_file_type?: string | null;
          video_file_url?: string | null;
          video_type: string;
          view_count?: number | null;
          youtube_embeddable?: boolean | null;
          youtube_license?: string | null;
          youtube_privacy_status?: string | null;
          youtube_status?: string | null;
          youtube_thumbnail_url?: string | null;
          youtube_video_id?: string | null;
          youtube_video_url?: string | null;
        };
        Update: {
          category?: string | null;
          comment_count?: number | null;
          cost_used?: number | null;
          created_at?: string | null;
          description?: string | null;
          error_message?: string | null;
          expires_at?: string | null;
          generate_ai_thumbnail?: boolean | null;
          id?: string;
          like_count?: number | null;
          module_id?: string | null;
          module_usage_id?: string | null;
          n8n_execution_id?: string | null;
          n8n_webhook_url?: string | null;
          optimal_publish_time?: string | null;
          privacy?: string | null;
          published_at?: string | null;
          retry_count?: number | null;
          seo_score?: number | null;
          status?: string | null;
          suggested_tags?: string[] | null;
          tags?: string[] | null;
          thumbnail_file_name?: string | null;
          thumbnail_file_path?: string | null;
          thumbnail_file_url?: string | null;
          title?: string;
          updated_at?: string | null;
          user_id?: string | null;
          video_file_name?: string;
          video_file_path?: string | null;
          video_file_size?: number | null;
          video_file_type?: string | null;
          video_file_url?: string | null;
          video_type?: string;
          view_count?: number | null;
          youtube_embeddable?: boolean | null;
          youtube_license?: string | null;
          youtube_privacy_status?: string | null;
          youtube_status?: string | null;
          youtube_thumbnail_url?: string | null;
          youtube_video_id?: string | null;
          youtube_video_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "youtube_uploads_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "modules";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "youtube_uploads_module_usage_id_fkey";
            columns: ["module_usage_id"];
            isOneToOne: false;
            referencedRelation: "module_usage";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      content_stats: {
        Row: {
          articles_count: number | null;
          audio_count: number | null;
          data_count: number | null;
          favorites_count: number | null;
          images_count: number | null;
          last_content_date: string | null;
          monthly_count: number | null;
          recent_count: number | null;
          total_content: number | null;
          user_id: string | null;
          video_count: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "generated_content_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "dashboard_view";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "generated_content_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "generated_content_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles_complete";
            referencedColumns: ["id"];
          },
        ];
      };
      dashboard_view: {
        Row: {
          articles: number | null;
          credit_balance: number | null;
          failed_usage: number | null;
          images: number | null;
          last_usage: string | null;
          plan_id: string | null;
          plan_name: string | null;
          successful_usage: number | null;
          total_content: number | null;
          total_credits_used: number | null;
          total_usage: number | null;
          user_id: string | null;
          videos: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "fk_profiles_plan_id";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
        ];
      };
      templates_with_type: {
        Row: {
          category: string | null;
          created_at: string | null;
          file_path: string | null;
          file_size: number | null;
          id: string | null;
          is_public: boolean | null;
          lease_type: string | null;
          name: string | null;
          template_type: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          category?: string | null;
          created_at?: string | null;
          file_path?: string | null;
          file_size?: number | null;
          id?: string | null;
          is_public?: boolean | null;
          lease_type?: string | null;
          name?: string | null;
          template_type?: never;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          category?: string | null;
          created_at?: string | null;
          file_path?: string | null;
          file_size?: number | null;
          id?: string | null;
          is_public?: boolean | null;
          lease_type?: string | null;
          name?: string | null;
          template_type?: never;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      unread_notifications_count: {
        Row: {
          count: number | null;
          user_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "dashboard_view";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles_complete";
            referencedColumns: ["id"];
          },
        ];
      };
      user_profiles_complete: {
        Row: {
          confirmed_at: string | null;
          created_at: string | null;
          credit_balance: number | null;
          current_period_end: string | null;
          email: string | null;
          email_confirmed_at: string | null;
          email_verified: boolean | null;
          full_name: string | null;
          id: string | null;
          language: string | null;
          last_credit_refresh: string | null;
          last_sign_in_at: string | null;
          phone: string | null;
          phone_confirmed_at: string | null;
          phone_verified: boolean | null;
          plan_id: string | null;
          renewal_date: string | null;
          role: string | null;
          social_sessions: Json | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          stripe_subscription_status: string | null;
          timezone: string | null;
          twofa_enabled: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          confirmed_at?: string | null;
          created_at?: string | null;
          credit_balance?: number | null;
          current_period_end?: string | null;
          email?: string | null;
          email_confirmed_at?: string | null;
          email_verified?: never;
          full_name?: string | null;
          id?: string | null;
          language?: string | null;
          last_credit_refresh?: string | null;
          last_sign_in_at?: string | null;
          phone?: string | null;
          phone_confirmed_at?: string | null;
          phone_verified?: never;
          plan_id?: string | null;
          renewal_date?: string | null;
          role?: string | null;
          social_sessions?: Json | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_subscription_status?: string | null;
          timezone?: string | null;
          twofa_enabled?: boolean | null;
          updated_at?: string | null;
        };
        Update: {
          confirmed_at?: string | null;
          created_at?: string | null;
          credit_balance?: number | null;
          current_period_end?: string | null;
          email?: string | null;
          email_confirmed_at?: string | null;
          email_verified?: never;
          full_name?: string | null;
          id?: string | null;
          language?: string | null;
          last_credit_refresh?: string | null;
          last_sign_in_at?: string | null;
          phone?: string | null;
          phone_confirmed_at?: string | null;
          phone_verified?: never;
          plan_id?: string | null;
          renewal_date?: string | null;
          role?: string | null;
          social_sessions?: Json | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_subscription_status?: string | null;
          timezone?: string | null;
          twofa_enabled?: boolean | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fk_profiles_plan_id";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      add_credits: {
        Args: {
          p_amount: number;
          p_description?: string;
          p_origin: string;
          p_stripe_payment_intent_id?: string;
          p_user_id: string;
        };
        Returns: Json;
      };
      bytea_to_text: {
        Args: { data: string };
        Returns: string;
      };
      clean_expired_approvals: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      cleanup_expired_social_tokens: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      cleanup_expired_transcriptions: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      cleanup_expired_youtube_uploads: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      create_admin_user: {
        Args: {
          p_full_name?: string;
          p_initial_credits?: number;
          p_user_id: string;
        };
        Returns: Json;
      };
      create_contact_request: {
        Args: {
          p_company: string;
          p_email: string;
          p_gdpr_consent: boolean;
          p_lookup_key: string;
          p_message: string;
          p_name: string;
          p_phone: string;
          p_plan: string;
          p_source: string;
        };
        Returns: Json;
      };
      create_notification: {
        Args: {
          p_data?: Json;
          p_expires_hours?: number;
          p_message: string;
          p_title: string;
          p_type: string;
          p_user_id: string;
        };
        Returns: string;
      };
      create_transcription_upload_url: {
        Args: { file_name: string; file_type: string };
        Returns: Json;
      };
      create_youtube_thumbnail_upload_url: {
        Args: { file_name: string; file_type: string };
        Returns: Json;
      };
      create_youtube_video_upload_url: {
        Args: { file_name: string; file_size?: number; file_type: string };
        Returns: Json;
      };
      deduct_credits: {
        Args: { amount: number; user_id: string };
        Returns: number;
      };
      delete_user_account: {
        Args: { user_id: string };
        Returns: undefined;
      };
      export_user_data: {
        Args: { user_id: string };
        Returns: Json;
      };
      get_cached_dashboard_data: {
        Args: { p_user_id: string };
        Returns: {
          credit_balance: number;
          plan_name: string;
          renewal_date: string;
        }[];
      };
      get_content_approval_stats: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      get_dashboard_data: {
        Args: { p_user_id?: string };
        Returns: {
          articles: number;
          credit_balance: number;
          failed_usage: number;
          images: number;
          last_usage: string;
          plan_id: string;
          plan_name: string;
          successful_usage: number;
          total_content: number;
          total_credits_used: number;
          total_usage: number;
          user_id: string;
          videos: number;
        }[];
      };
      get_dashboard_overview: {
        Args: { p_use_cache?: boolean; p_user_id: string };
        Returns: {
          articles: number;
          credit_balance: number;
          failed_usage: number;
          images: number;
          plan_name: string;
          renewal_date: string;
          successful_usage: number;
          total_content: number;
          total_credits_used: number;
          total_usage: number;
          videos: number;
        }[];
      };
      get_public_module_categories: {
        Args: Record<PropertyKey, never>;
        Returns: {
          active_modules: number;
          avg_credit_cost: number;
          category: string;
        }[];
      };
      get_unread_notifications_count: {
        Args: Record<PropertyKey, never>;
        Returns: {
          count: number;
          user_id: string;
        }[];
      };
      get_user_communication_preferences: {
        Args: { user_id?: string };
        Returns: {
          billing_reminders: boolean;
          created_at: string;
          digest_frequency: string;
          email_format: string;
          feature_announcements: boolean;
          id: string;
          maintenance_alerts: boolean;
          marketing_emails: boolean;
          newsletter: boolean;
          product_updates: boolean;
          security_alerts: boolean;
          updated_at: string;
          usage_reports: boolean;
        }[];
      };
      get_user_credits_balance: {
        Args: { p_user_id: string };
        Returns: number;
      };
      get_user_profile_for_service: {
        Args: { user_id_param: string };
        Returns: Json;
      };
      get_youtube_user_stats: {
        Args: { period_days?: number };
        Returns: Json;
      };
      grant_monthly_credits: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      handle_template_upload: {
        Args: {
          p_file_path: string;
          p_is_public?: boolean;
          p_lease_type: string;
          p_name: string;
          p_user_id: string;
        };
        Returns: string;
      };
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] };
        Returns: Database["public"]["CompositeTypes"]["http_response"];
      };
      http_delete: {
        Args:
          | { content: string; content_type: string; uri: string }
          | { uri: string };
        Returns: Database["public"]["CompositeTypes"]["http_response"];
      };
      http_get: {
        Args: { data: Json; uri: string } | { uri: string };
        Returns: Database["public"]["CompositeTypes"]["http_response"];
      };
      http_head: {
        Args: { uri: string };
        Returns: Database["public"]["CompositeTypes"]["http_response"];
      };
      http_header: {
        Args: { field: string; value: string };
        Returns: Database["public"]["CompositeTypes"]["http_header"];
      };
      http_list_curlopt: {
        Args: Record<PropertyKey, never>;
        Returns: {
          curlopt: string;
          value: string;
        }[];
      };
      http_patch: {
        Args: { content: string; content_type: string; uri: string };
        Returns: Database["public"]["CompositeTypes"]["http_response"];
      };
      http_post: {
        Args:
          | { content: string; content_type: string; uri: string }
          | { data: Json; uri: string };
        Returns: Database["public"]["CompositeTypes"]["http_response"];
      };
      http_put: {
        Args: { content: string; content_type: string; uri: string };
        Returns: Database["public"]["CompositeTypes"]["http_response"];
      };
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      http_set_curlopt: {
        Args: { curlopt: string; value: string };
        Returns: boolean;
      };
      is_admin_user: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      notify_admins_new_contact: {
        Args: {
          p_company: string;
          p_contact_id: string;
          p_name: string;
          p_plan: string;
        };
        Returns: undefined;
      };
      process_pending_notifications: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      record_module_usage_secure: {
        Args: {
          p_credits_cost: number;
          p_error_message?: string;
          p_input: Json;
          p_module_slug: string;
          p_output?: Json;
          p_status?: string;
        };
        Returns: Json;
      };
      refresh_user_dashboard_cache: {
        Args: { p_user_id?: string };
        Returns: Json;
      };
      refund_failed_module_usage: {
        Args: { p_refund_reason?: string; p_usage_id: string };
        Returns: Json;
      };
      renew_free_credits: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      search_generated_content: {
        Args: {
          content_type?: string;
          limit_count?: number;
          search_query: string;
          search_user_id: string;
        };
        Returns: {
          content: string;
          created_at: string;
          id: string;
          is_favorite: boolean;
          metadata: Json;
          module_slug: string;
          rank: number;
          tags: string[];
          title: string;
          type: string;
          url: string;
        }[];
      };
      secure_http_request: {
        Args: {
          p_data?: string;
          p_headers?: Json;
          p_method?: string;
          p_url: string;
        };
        Returns: Database["public"]["CompositeTypes"]["http_response"];
      };
      text_to_bytea: {
        Args: { data: string };
        Returns: string;
      };
      upsert_user_communication_preferences: {
        Args: {
          p_billing_reminders?: boolean;
          p_digest_frequency?: string;
          p_email_format?: string;
          p_feature_announcements?: boolean;
          p_maintenance_alerts?: boolean;
          p_marketing_emails?: boolean;
          p_newsletter?: boolean;
          p_product_updates?: boolean;
          p_security_alerts?: boolean;
          p_usage_reports?: boolean;
        };
        Returns: {
          billing_reminders: boolean;
          client_id: string;
          created_at: string;
          digest_frequency: string;
          email_format: string;
          feature_announcements: boolean;
          id: string;
          maintenance_alerts: boolean;
          marketing_emails: boolean;
          newsletter: boolean;
          product_updates: boolean;
          security_alerts: boolean;
          updated_at: string;
          usage_reports: boolean;
        };
      };
      urlencode: {
        Args: { data: Json } | { string: string } | { string: string };
        Returns: string;
      };
      use_module_credits: {
        Args: { p_amount?: number; p_module_slug: string; p_user_id: string };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      http_header: {
        field: string | null;
        value: string | null;
      };
      http_request: {
        method: unknown | null;
        uri: string | null;
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null;
        content_type: string | null;
        content: string | null;
      };
      http_response: {
        status: number | null;
        content_type: string | null;
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null;
        content: string | null;
      };
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

export type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
