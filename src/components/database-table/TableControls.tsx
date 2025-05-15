
import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableControlsProps } from "./types";
import { RefreshCw } from "lucide-react";

export function TableControls({
  rowLimit,
  setRowLimit,
  handleRefresh,
  isRefreshing = false
}: TableControlsProps) {
  return (
    <div className="flex justify-between items-center mb-2">
      <h2 className="text-base font-medium">ตาราง Database</h2>
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-600">แถว:</span>
          <Select 
            value={rowLimit.toString()} 
            onValueChange={(value) => setRowLimit(parseInt(value))}
          >
            <SelectTrigger className="w-[60px] h-7 text-xs px-2">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="40">40</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          className="h-7 px-2 py-0 text-xs border-emerald-200 bg-white hover:bg-emerald-50"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          รีเฟรช
        </Button>
      </div>
    </div>
  );
}
