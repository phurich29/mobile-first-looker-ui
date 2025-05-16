
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NotificationBadge } from "./NotificationBadge";
import { formatBangkokTime } from "@/components/measurement-history/api";
import { Notification } from "../types";

interface NotificationTableProps {
  notifications: Notification[];
  handleViewDetails: (deviceCode: string, riceTypeId: string) => void;
}

export function NotificationTable({ notifications, handleViewDetails }: NotificationTableProps) {
  const formatDate = (dateString: string) => {
    const { thaiDate, thaiTime } = formatBangkokTime(dateString);
    return `${thaiDate} ${thaiTime}`;
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>เวลา</TableHead>
            <TableHead>อุปกรณ์</TableHead>
            <TableHead>ค่าที่วัด</TableHead>
            <TableHead>ประเภท</TableHead>
            <TableHead>ข้อความ</TableHead>
            <TableHead className="text-right">จำนวนครั้ง</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notifications.map((notification) => (
            <TableRow key={notification.id}>
              <TableCell className="font-mono text-xs text-gray-500">
                {notification.id.substring(0, 8)}...
              </TableCell>
              <TableCell className="font-medium whitespace-nowrap">
                {formatDate(notification.timestamp)}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {notification.device_code}
              </TableCell>
              <TableCell className="font-medium">
                {notification.value?.toFixed(2) || 'N/A'}
              </TableCell>
              <TableCell>
                <NotificationBadge type={notification.threshold_type} />
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {notification.notification_message}
              </TableCell>
              <TableCell className="text-right">
                {notification.notification_count}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewDetails(notification.device_code, notification.rice_type_id)}
                >
                  ดูข้อมูล
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
