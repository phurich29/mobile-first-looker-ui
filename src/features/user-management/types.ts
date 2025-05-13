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
  price: string; // Change from number to string since we want to store price as text
  category: string;
  created_at: string;
  updated_at: string;
  priceColor?: string; // Add the priceColor property
}

export type RicePriceFormValues = {
  name: string;
  price: string; // Change from number to string since we want to store price as text
  category: string;
  priceColor: string; // Add the priceColor property
};

export interface RicePriceDocument {
  id: string;
  document_date: string;
  file_url: string;
  created_at: string;
  updated_at: string;
}

export type RicePriceDocumentFormValues = {
  document_date: string;
  file_url: string;
};
