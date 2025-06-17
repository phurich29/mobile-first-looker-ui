
import React from "react";

interface TimeDisplayProps {
  updatedAt?: Date;
}

export const TimeDisplay: React.FC<TimeDisplayProps> = ({ updatedAt }) => {
  // Format the time from thai_datetime โดยไม่บวกเวลาเพิ่ม
  const formatBangkokTime = (date?: Date): { thaiDate: string; thaiTime: string } => {
    if (!date) return { thaiDate: "ไม่มีข้อมูล", thaiTime: "ไม่มีข้อมูล" };
    
    // ใช้เวลาตามที่มาจาก thai_datetime โดยตรง
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
    
    const thaiDate = new Intl.DateTimeFormat('th-TH', dateOptions).format(date);
    const thaiTime = new Intl.DateTimeFormat('th-TH', timeOptions).format(date);
    
    return { thaiDate, thaiTime };
  };

  return (
    <div className="flex flex-col text-xs">
      {updatedAt ? (
        <>
          <div className="font-medium text-gray-700">{formatBangkokTime(updatedAt).thaiDate}</div>
          <div className="text-gray-500">{formatBangkokTime(updatedAt).thaiTime} น.</div>
        </>
      ) : (
        <div className="text-gray-500">"ไม่มีข้อมูล"</div>
      )}
    </div>
  );
};
