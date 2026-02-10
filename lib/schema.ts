/**
 * Supabase database schema types.
 * Matches tables from setup.sql and migrations (profiles, species, species_comments).
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Kingdom = "Animalia" | "Plantae" | "Fungi" | "Protista" | "Archaea" | "Bacteria";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string;
          biography: string | null;
        };
        Insert: {
          id: string;
          email: string;
          display_name: string;
          biography?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string;
          biography?: string | null;
        };
      };
      species: {
        Row: {
          id: number;
          scientific_name: string;
          common_name: string | null;
          total_population: number | null;
          kingdom: Kingdom;
          description: string | null;
          image: string | null;
          author: string;
        };
        Insert: {
          id?: number;
          scientific_name: string;
          common_name?: string | null;
          total_population?: number | null;
          kingdom: Kingdom;
          description?: string | null;
          image?: string | null;
          author: string;
        };
        Update: {
          id?: number;
          scientific_name?: string;
          common_name?: string | null;
          total_population?: number | null;
          kingdom?: Kingdom;
          description?: string | null;
          image?: string | null;
          author?: string;
        };
      };
      species_comments: {
        Row: {
          id: number;
          species_id: number;
          author: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          species_id: number;
          author: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          species_id?: number;
          author?: string;
          content?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      kingdom: Kingdom;
    };
  };
}
