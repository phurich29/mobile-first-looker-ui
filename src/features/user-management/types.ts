
export type UserRole = 'user' | 'admin' | 'superadmin';

export interface User {
  id: string;
  email: string;
  roles: UserRole[];
  last_sign_in_at?: string | null;
}

export interface NewUserFormValues {
  email: string;
  password: string;
}

export interface ResetPasswordFormValues {
  password: string;
}

// Rice price related types
export interface RicePrice {
  id: string;
  name: string;
  price: string | null;
  document_date: string | null;
  priceColor: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface RicePriceDocument {
  id: string;
  document_date: string;
  file_url: string;
  created_at: string;
  updated_at: string;
}
