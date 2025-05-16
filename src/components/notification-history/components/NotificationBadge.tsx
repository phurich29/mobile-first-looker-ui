
import React from "react";

interface NotificationBadgeProps {
  type: string;
}

export function NotificationBadge({ type }: NotificationBadgeProps) {
  switch (type) {
    case "max":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          <span className="w-1.5 h-1.5 mr-1.5 bg-orange-500 rounded-full"></span>
          สูงเกินเกณฑ์
        </span>
      );
    case "min":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <span className="w-1.5 h-1.5 mr-1.5 bg-blue-500 rounded-full"></span>
          ต่ำกว่าเกณฑ์
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <span className="w-1.5 h-1.5 mr-1.5 bg-gray-500 rounded-full"></span>
          ไม่ระบุ
        </span>
      );
  }
}
