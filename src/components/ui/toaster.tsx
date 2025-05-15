import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        // แสดงผลแตกต่างกันตาม variant
        if (variant === 'update') {
          return (
            <Toast key={id} variant="update" {...props}>
              <div className="flex items-center">
                {/* ไอคอนเช็คถูกสีเขียว */}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 mr-2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {/* แสดงเฉพาะชื่อเรื่อง ไม่มีรายละเอียด */}
                {title && <ToastTitle className="text-xs font-medium">{title}</ToastTitle>}
              </div>
              {/* ไม่แสดงปุ่มปิด */}
            </Toast>
          )
        }
        
        // แสดงผลแบบปกติสำหรับ variant อื่นๆ
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
