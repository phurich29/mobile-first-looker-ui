
import { toast as sonnerToast, Toast } from "sonner";

// Export the toast function with proper type
export const toast = sonnerToast;

// Define a proper useToast hook for compatibility with the rest of the app
export const useToast = () => {
  return { toast: sonnerToast };
};
