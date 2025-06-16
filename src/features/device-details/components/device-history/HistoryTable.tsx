
import React, { useRef, useState } from "react";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getColumnThaiName } from "@/lib/columnTranslations";
import { RiceQualityData } from './types';
import { formatCellValue, getColumnKeys } from './utils';
import { DATA_CATEGORIES } from './dataCategories';
import { useDragScroll } from "@/utils/dragUtils";

interface HistoryTableProps {
  historyData: RiceQualityData[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  historyData,
  totalCount,
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragState, dragHandlers] = useDragScroll(containerRef);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const columnKeys = getColumnKeys(historyData);

  const toggleRow = (rowId: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(rowId)) {
      newExpandedRows.delete(rowId);
    } else {
      newExpandedRows.add(rowId);
    }
    setExpandedRows(newExpandedRows);
  };

  // Render categorized data for expanded view
  const renderCategorizedData = (data: RiceQualityData) => {
    return Object.entries(DATA_CATEGORIES).map(([categoryKey, category]) => {
      const categoryData = category.fields.filter(field => 
        data[field] !== null && data[field] !== undefined
      );

      if (categoryData.length === 0) return null;

      return (
        <div key={categoryKey} className="border border-gray-300 rounded mb-1">
          <div className="bg-gray-100 px-3 py-1.5 border-b border-gray-300">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-black">{category.title}</h4>
              <Badge variant="outline" className="text-xs bg-white border-gray-400 text-black">
                {categoryData.length}
              </Badge>
            </div>
          </div>
          <div className="p-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              {categoryData.map((field) => (
                <div key={field} className="flex justify-between items-center py-0.5 px-2 hover:bg-gray-50 rounded text-xs">
                  <span className="text-gray-700 truncate mr-2">
                    {getColumnThaiName(field)}
                  </span>
                  <span className="font-medium text-black flex-shrink-0">
                    {formatCellValue(field, data[field])}
                    {field !== 'device_code' && field !== 'thai_datetime' && field !== 'paddy_rate' ? '%' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    });
  };

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
        className={`overflow-x-auto ${dragState.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={dragHandlers.handleMouseDown}
        onMouseMove={dragHandlers.handleMouseMove}
        onMouseUp={dragHandlers.handleDragEnd}
        onMouseLeave={dragHandlers.handleDragEnd}
        onTouchStart={dragHandlers.handleTouchStart}
        onTouchMove={dragHandlers.handleTouchMove}
        onTouchEnd={dragHandlers.handleDragEnd}
        style={{ userSelect: dragState.isDragging ? 'none' : 'auto' }}
      >
        <div className="space-y-0">
          <ResponsiveTable>
            <TableHeader>
              <TableRow>
                {columnKeys.map((key) => (
                  <TableHead key={key} className="whitespace-nowrap">
                    {getColumnThaiName(key)}
                  </TableHead>
                ))}
                <TableHead className="whitespace-nowrap">รายละเอียด</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyData.map((row) => (
                <React.Fragment key={row.id}>
                  <Collapsible open={expandedRows.has(row.id)} onOpenChange={() => toggleRow(row.id)}>
                    <CollapsibleTrigger asChild>
                      <TableRow className="cursor-pointer hover:bg-muted/50">
                        {columnKeys.map((key) => (
                          <TableCell key={`${row.id}-${key}`} className="whitespace-nowrap">
                            {formatCellValue(key, row[key])}
                          </TableCell>
                        ))}
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            {expandedRows.has(row.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    </CollapsibleTrigger>
                    <CollapsibleContent asChild>
                      <TableRow>
                        <TableCell colSpan={columnKeys.length + 1} className="p-0">
                          <div className="bg-gray-50 border-t border-gray-200 p-4 animate-accordion-down">
                            {/* Summary Header */}
                            <div className="bg-gray-100 border border-gray-300 rounded p-3 mb-2">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-black mb-1">
                                    Device Code: {row.device_code}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {row.thai_datetime 
                                      ? new Date(row.thai_datetime).toLocaleString('th-TH', { 
                                          year: 'numeric', month: '2-digit', day: '2-digit', 
                                          hour: '2-digit', minute: '2-digit'
                                        }) 
                                      : new Date(row.created_at).toLocaleString('th-TH', { 
                                          year: 'numeric', month: '2-digit', day: '2-digit', 
                                          hour: '2-digit', minute: '2-digit'
                                        })
                                    }
                                  </div>
                                </div>
                                <Badge variant="outline" className="bg-white border-gray-400 text-xs text-black">
                                  ID: {row.id}
                                </Badge>
                              </div>
                            </div>

                            {/* Categorized Data Display */}
                            <div className="space-y-0">
                              {renderCategorizedData(row)}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  </Collapsible>
                </React.Fragment>
              ))}
            </TableBody>
          </ResponsiveTable>
        </div>
      </div>

      {/* Row limit controls - moved to bottom */}
      <div className="flex justify-between items-center mt-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">แสดง:</span>
          <Select 
            value={itemsPerPage.toString()} 
            onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
          >
            <SelectTrigger className="w-[80px] h-8 text-sm bg-white border border-gray-300">
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
        <div className="text-sm text-gray-500">
          รวม {totalCount} รายการ
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="text-sm text-gray-500">
            หน้า {currentPage} จาก {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
