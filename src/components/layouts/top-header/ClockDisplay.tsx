
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

export const ClockDisplay: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  const formattedTime = currentTime.toLocaleTimeString(navigator.language, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Button 
      variant="ghost" 
      className="text-gray-500 hover:bg-gray-100 px-1 md:px-2 flex items-center h-auto md:h-10"
    >
      <Clock className="h-3 w-3 md:h-5 md:w-5 mr-1 md:mr-1.5" /> 
      <span className="text-xs md:text-sm">{formattedTime}</span>
    </Button>
  );
};
