
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
