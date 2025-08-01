import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

interface NotificationButtonProps {
  userId?: string;
}

const NotificationButton: React.FC<NotificationButtonProps> = ({ userId }) => {
  const handleRequestPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notification');
      return;
    }

    if (Notification.permission === 'granted') {
      console.log('Notification permission already granted.');
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        if (userId) {
            console.log(`User ${userId} granted permission.`);
            // Here you would typically get the subscription and send it to your backend
        }
      }
    }
  };

  return (
    <Button onClick={handleRequestPermission} className="mb-4">
      <Bell className="mr-2 h-4 w-4" /> Enable Notifications
    </Button>
  );
};

export default NotificationButton;
