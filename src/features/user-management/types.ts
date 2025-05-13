
import { Database } from "@/integrations/supabase/types";

// Define types for our user data
export interface User {
  id: string;
  email: string;
  roles: string[];
  last_sign_in_at?: string | null;
}

// Schema for forms
export type NewUserFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

export type ResetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};

export type UserRole = Database["public"]["Enums"]["app_role"];

// Rice price management types
export interface RicePrice {
  id: string;
  name: string;
  price: number;
  updated_at: string;
  category: string;
}

export type RicePriceFormValues = {
  name: string;
  price: number;
  category: string;
};

// Rice price document types
export interface RicePriceDocument {
  id: string;
  document_date: string;
  file_url: string;
  updated_at: string;
}

export type RicePriceDocumentFormValues = {
  document_date: string;
  file_url: string;
};
