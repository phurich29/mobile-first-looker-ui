
import React from "react";
import { NotificationCard } from "./NotificationCard";
import { Notification } from "../types";

interface NotificationCardListProps {
  notifications: Notification[];
  handleViewDetails: (deviceCode: string, riceTypeId: string) => void;
}

export function NotificationCardList({ notifications, handleViewDetails }: NotificationCardListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onViewDetails={handleViewDetails}
        />
      ))}
    </div>
  );
}
