
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search, Filter, X } from "lucide-react";
import { NotificationFilters as FilterType } from "../types";

interface NotificationFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
}

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const handleClearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== "" && value !== false
  );

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4" />
          <span className="font-medium">ตัวกรองข้อมูล</span>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="ml-auto text-red-600 hover:text-red-700"
            >
              <X className="h-3 w-3 mr-1" />
              ล้างตัวกรอง
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">ค้นหาข้อความ</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="ค้นหาในข้อความแจ้งเตือน..."
                value={filters.searchTerm || ""}
                onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>

          {/* Device Code Filter */}
          <div className="space-y-2">
            <Label htmlFor="device">รหัสอุปกรณ์</Label>
            <Input
              id="device"
              placeholder="เช่น 6000306302144"
              value={filters.deviceCode || ""}
              onChange={(e) => onFiltersChange({ ...filters, deviceCode: e.target.value })}
            />
          </div>

          {/* Date From */}
          <div className="space-y-2">
            <Label htmlFor="dateFrom">วันที่เริ่มต้น</Label>
            <Input
              id="dateFrom"
              type="date"
              value={filters.dateFrom || ""}
              onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
            />
          </div>

          {/* Date To */}
          <div className="space-y-2">
            <Label htmlFor="dateTo">วันที่สิ้นสุด</Label>
            <Input
              id="dateTo"
              type="date"
              value={filters.dateTo || ""}
              onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
            />
          </div>
        </div>

        {/* Only Unread Toggle */}
        <div className="flex items-center space-x-2 mt-4">
          <Switch
            id="onlyUnread"
            checked={filters.onlyUnread || false}
            onCheckedChange={(checked) => onFiltersChange({ ...filters, onlyUnread: checked })}
          />
          <Label htmlFor="onlyUnread">แสดงเฉพาะรายการที่ยังไม่ได้อ่าน</Label>
        </div>
      </CardContent>
    </Card>
  );
};
