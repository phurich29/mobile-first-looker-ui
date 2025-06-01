
import { toast } from '@/hooks/use-toast';

export interface AppError extends Error {
  code?: string;
  details?: any;
}

export const handleSupabaseError = (error: any, customMessage?: string) => {
  console.error('Supabase error:', error);
  
  let message = customMessage || "เกิดข้อผิดพลาดในระบบ";
  
  // Handle specific Supabase errors
  if (error?.message) {
    if (error.message.includes('refresh_token_not_found')) {
      message = "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่";
    } else if (error.message.includes('JWT expired')) {
      message = "การยืนยันตัวตนหมดอายุ กรุณาเข้าสู่ระบบใหม่";
    } else if (error.message.includes('Network error')) {
      message = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้";
    } else if (error.message.includes('Row Level Security')) {
      message = "ไม่มีสิทธิ์เข้าถึงข้อมูล";
    }
  }
  
  toast({
    title: "เกิดข้อผิดพลาด",
    description: message,
    variant: "destructive",
  });
  
  return error;
};

export const handleAsyncError = async <T>(
  promise: Promise<T>,
  errorMessage?: string
): Promise<T | null> => {
  try {
    return await promise;
  } catch (error) {
    handleSupabaseError(error, errorMessage);
    return null;
  }
};
