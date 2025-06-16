
import React, { useRef } from "react";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { getColumnThaiName } from "@/lib/columnTranslations";
import { RiceQualityData } from './types';
import { formatCellValue, getColumnKeys } from './utils';
import { useDragScroll } from "@/utils/dragUtils";

interface HistoryTableProps {
  historyData: RiceQualityData[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  onRowClick: (row: RiceQualityData) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  historyData,
  totalCount,
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onRowClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragState, dragHandlers] = useDragScroll(containerRef);
  const columnKeys = getColumnKeys(historyData);

  if (!historyData || historyData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        ไม่พบข้อมูลประวัติสำหรับอุปกรณ์นี้
      </div>
    );
  }

  return (
    <>
      <div 
        ref={containerRef}
        className={`overflow-x-auto text-xs ${dragState.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={dragHandlers.handleMouseDown}
        onMouseMove={dragHandlers.handleMouseMove}
        onMouseUp={dragHandlers.handleDragEnd}
        onMouseLeave={dragHandlers.handleDragEnd}
        onTouchStart={dragHandlers.handleTouchStart}
        onTouchMove={dragHandlers.handleTouchMove}
        onTouchEnd={dragHandlers.handleDragEnd}
        style={{ userSelect: dragState.isDragging ? 'none' : 'auto' }}
      >
        <ResponsiveTable>
          <TableHeader>
            <TableRow>
              {columnKeys.map((key) => (
                <TableHead key={key} className="whitespace-nowrap px-1.5 py-0.5 text-[11px] font-medium">
                  {getColumnThaiName(key)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {historyData.map((row) => (
              <TableRow key={row.id} onClick={() => onRowClick(row)} className="cursor-pointer hover:bg-muted/50">
                {columnKeys.map((key) => (
                  <TableCell key={`${row.id}-${key}`} className="whitespace-nowrap px-1.5 py-0.5 text-[11px]">
                    {formatCellValue(key, row[key])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </ResponsiveTable>
      </div>

      {/* Row limit controls - moved to bottom */}
      <div className="flex justify-between items-center mt-1.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">แสดง:</span>
          <Select 
            value={itemsPerPage.toString()} 
            onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
          >
            <SelectTrigger className="w-[60px] h-6 text-[11px] bg-white border border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300 z-50">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="500">500</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-600">แถว</span>
        </div>
        <div className="text-xs text-gray-500">
          รวม {totalCount} รายการ
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-0.5 px-0.5 text-[10px]">
          <div className="text-[10px] text-gray-500">
            หน้า {currentPage} จาก {totalPages}
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
