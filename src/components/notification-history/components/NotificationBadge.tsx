
import React from "react";
import { Badge } from "@/components/ui/badge";

interface NotificationBadgeProps {
  type: string;
}

export function NotificationBadge({ type }: NotificationBadgeProps) {
  switch (type) {
    case "max":
      return <Badge variant="outline" className="border-orange-500 text-orange-600 bg-orange-50">สูงกว่าค่าสูงสุด</Badge>;
    case "min":
      return <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50">ต่ำกว่าค่าต่ำสุด</Badge>;
    default:
      return <Badge variant="outline">ไม่ระบุ</Badge>;
  }
}
