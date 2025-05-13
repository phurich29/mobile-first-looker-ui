
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
