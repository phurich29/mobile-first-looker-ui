
import { useToast as useToastPrimitive } from "@/components/ui/use-toast"
import { toast as toastPrimitive } from "@/components/ui/use-toast"

// Re-export to make it available in the app
export const useToast = useToastPrimitive
export const toast = toastPrimitive
