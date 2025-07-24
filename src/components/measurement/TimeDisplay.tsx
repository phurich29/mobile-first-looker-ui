
import React from "react";
import { useTranslation } from "@/hooks/useTranslation";

interface TimeDisplayProps {
  updatedAt?: Date;
}

export const TimeDisplay: React.FC<TimeDisplayProps> = ({ updatedAt }) => {
  const { language } = useTranslation();
  // Format the Bangkok time (+7)
  const formatBangkokTime = (date?: Date): { thaiDate: string; thaiTime: string } => {
    if (!date) return { thaiDate: "ไม่มีข้อมูล", thaiTime: "ไม่มีข้อมูล" };
    
    // เพิ่มเวลาอีก 7 ชั่วโมง
    const adjustedDate = new Date(date);
    adjustedDate.setHours(adjustedDate.getHours() + 7);
    
    // แยกวันที่และเวลาเป็นคนละบรรทัด
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };
    
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    
    const thaiDate = new Intl.DateTimeFormat('th-TH', dateOptions).format(adjustedDate);
    const thaiTime = new Intl.DateTimeFormat('th-TH', timeOptions).format(adjustedDate);
    
    return { thaiDate, thaiTime };
  };

  return (
    <div className="flex flex-col text-xs">
      {updatedAt ? (
        <>
          <div className="font-medium text-gray-700">{formatBangkokTime(updatedAt).thaiDate}</div>
          <div className="text-gray-500">{formatBangkokTime(updatedAt).thaiTime}{language === 'th' ? ' น.' : ''}</div>
        </>
      ) : (
        <div className="text-gray-500">"ไม่มีข้อมูล"</div>
      )}
    </div>
  );
};
