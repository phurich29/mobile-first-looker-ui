
import { toast as sonnerToast } from "@/components/ui/sonner";

// Re-export Sonner's toast
export const toast = sonnerToast;

// Create a useToast hook that returns the toast function
export const useToast = () => {
  return {
    toast: sonnerToast,
    // Add a simplified toasts array placeholder for compatibility with shadcn/ui toast
    toasts: [],
  };
};
