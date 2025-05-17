
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export const HeaderClock = () => {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const formattedTime = format(time, "HH:mm:ss", { locale: th });
  const formattedDate = format(time, "d MMMM yyyy", { locale: th });
  
  return (
    <div className="hidden md:block text-right">
      <div className="text-sm font-medium">{formattedTime}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{formattedDate}</div>
    </div>
  );
};
