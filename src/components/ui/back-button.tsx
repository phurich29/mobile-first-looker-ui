
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  /**
   * จุดหมายปลายทางที่ต้องการกลับไป (เส้นทาง URL)
   * ค่าเริ่มต้นคือหน้าแรก "/"
   */
  to?: string;
  
  /**
   * คลาสสำหรับปรับแต่งปุ่ม (optional)
   */
  className?: string;
  
  /**
   * ฟังก์ชันที่จะถูกเรียกเมื่อคลิกที่ปุ่ม (optional)
   * ฟังก์ชันนี้จะถูกเรียกก่อนการนำทาง
   */
  onClick?: () => void;
}

/**
 * ปุ่ม Back ของระบบ
 * 
 * ใช้สำหรับกลับไปยังหน้าก่อนหน้าหรือหน้าที่กำหนด
 * ออกแบบให้มีลักษณะเดียวกันทั้งเว็บไซต์
 */
export const BackButton = ({
  to = "/",
  className,
  onClick
}: BackButtonProps) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    // เรียกใช้ฟังก์ชันที่ส่งเข้ามา (ถ้ามี)
    if (onClick) {
      onClick();
    }
    
    // นำทางไปยังเส้นทางที่กำหนด
    navigate(to);
  };
  
  return (
    <div className="mb-4">
      <button 
        onClick={handleClick}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-2 text-sm font-medium",
          "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200",
          "bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700",
          "border border-gray-200 dark:border-gray-700",
          "rounded-lg shadow-sm hover:shadow-md",
          "transition-all duration-200 ease-in-out",
          "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
          className
        )}
        aria-label="กลับไปหน้าก่อนหน้า"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>ย้อนกลับ</span>
      </button>
    </div>
  );
};
