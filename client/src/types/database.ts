import type { ApplicationStatus, Currency, JobType, Location, Salary, Source } from "./application.ts";

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
          location: Location;
          job_url: string;
          job_description: string | null;
          job_type: JobType | null;
          notes: string | null;
          profile_id: string | null;
          resume_score_id: string | null;
          resume_score: number | null;
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
          location: Location;
          job_url: string;
          job_description?: string | null;
          job_type?: JobType | null;
          notes?: string | null;
          profile_id?: string | null;
          resume_score_id?: string | null;
          resume_score?: number | null;
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
          location?: Location;
          job_url?: string;
          job_description?: string | null;
          job_type?: JobType | null;
          notes?: string | null;
          profile_id?: string | null;
          resume_score_id?: string | null;
          resume_score?: number | null;
          applied_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "job_applications_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "job_applications_resume_score_id_fkey";
            columns: ["resume_score_id"];
            isOneToOne: false;
            referencedRelation: "resume_scores";
            referencedColumns: ["id"];
          },
        ];
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
      profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          notes: string | null;
          resume_path: string;
          resume_file_name: string;
          resume_text: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          notes?: string | null;
          resume_path: string;
          resume_file_name: string;
          resume_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          notes?: string | null;
          resume_path?: string;
          resume_file_name?: string;
          resume_text?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      resume_scores: {
        Row: {
          id: string;
          application_id: string | null;
          score: number;
          matched_skills: string[];
          missing_skills: string[];
          summary: string;
          model: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          application_id?: string | null;
          score: number;
          matched_skills: string[];
          missing_skills: string[];
          summary: string;
          model: string;
          created_at?: string | null;
        };
        Update: {
          application_id?: string | null;
          score?: number;
          matched_skills?: string[];
          missing_skills?: string[];
          summary?: string;
          model?: string;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "resume_scores_application_id_fkey";
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
      job_type: JobType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
