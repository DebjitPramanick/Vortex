import type { ApplicationStatus, Currency, Salary, Source } from "./application.ts";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      job_applications: {
        Row: {
          id: string;
          user_id: string;
          company: string;
          role: string;
          salary: Salary | null;
          status: ApplicationStatus;
          source: Source | null;
          location: string;
          job_url: string;
          notes: string | null;
          applied_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company: string;
          role: string;
          salary?: Salary | null;
          status?: ApplicationStatus;
          source?: Source | null;
          location: string;
          job_url: string;
          notes?: string | null;
          applied_at: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          company?: string;
          role?: string;
          salary?: Salary | null;
          status?: ApplicationStatus;
          source?: Source | null;
          location?: string;
          job_url?: string;
          notes?: string | null;
          applied_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      status_history: {
        Row: {
          id: string;
          application_id: string;
          from_status: ApplicationStatus | null;
          to_status: ApplicationStatus;
          changed_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          from_status?: ApplicationStatus | null;
          to_status: ApplicationStatus;
          changed_at?: string;
        };
        Update: {
          from_status?: ApplicationStatus | null;
          to_status?: ApplicationStatus;
        };
        Relationships: [
          {
            foreignKeyName: "status_history_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "job_applications";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      application_status: ApplicationStatus;
      application_source: Source;
      currency: Currency;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
