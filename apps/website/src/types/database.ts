// apps/website/src/types/database.ts
export interface Database {
  public: {
    Tables: {
      // Tes tables Supabase ici
      // Pour l'instant, on garde un type générique
      [key: string]: {
        Row: Record<string, any>;
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
