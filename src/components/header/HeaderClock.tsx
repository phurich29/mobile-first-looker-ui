
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export const HeaderClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const isMobile = useIsMobile();

  // อัพเดทเวลาทุกๆ 1 วินาที
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ฟังก์ชันแสดงเวลาในรูปแบบ HH:MM:SS
  const formatTime = () => {
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const seconds = currentTime.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // Format date for desktop header
  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return currentTime.toLocaleDateString('th-TH', options);
  };

  return (
    <div className="flex items-center gap-2 mx-auto md:mx-0">
      <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center shadow-inner">
        <p className={`font-medium text-white tracking-wider ${!isMobile ? 'text-sm' : 'text-xs'}`}>{formatTime()}</p>
      </div>
      
      {/* Display date on desktop view */}
      {!isMobile && (
        <div className="ml-4 bg-white/10 px-4 py-2 rounded-full hidden md:block">
          <p className="text-sm text-white/90">{formatDate()}</p>
        </div>
      )}
    </div>
  );
};
