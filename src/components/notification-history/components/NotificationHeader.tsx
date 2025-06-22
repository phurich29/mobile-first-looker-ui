import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Bell, Search } from "lucide-react";
interface NotificationHeaderProps {
  totalCount: number;
  handleManualCheck: () => Promise<void>;
  handleRefresh: () => void;
  isCheckingNotifications: boolean;
  isFetching: boolean;
}
export function NotificationHeader({
  totalCount,
  handleManualCheck,
  handleRefresh,
  isCheckingNotifications,
  isFetching
}: NotificationHeaderProps) {
  return;
}