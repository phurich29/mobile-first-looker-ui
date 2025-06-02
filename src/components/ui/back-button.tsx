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
   * ขนาดของไอคอน (optional)
   */
  iconSize?: number;
  
  /**
   * คำอธิบายสำหรับเครื่องมืออ่านหน้าจอ (optional)
   */
  ariaLabel?: string;
  
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
  iconSize = 5,
  ariaLabel = "กลับไปหน้าก่อนหน้า",
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
    <button 
      onClick={handleClick}
      className={cn(
        "mr-3 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors flex items-center justify-center",
        className
      )}
      aria-label={ariaLabel}
    >
      <ArrowLeft className={`h-${iconSize} w-${iconSize} text-gray-700`} />
    </button>
  );
};
