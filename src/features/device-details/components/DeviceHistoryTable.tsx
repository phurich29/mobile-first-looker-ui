
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getColumnThaiName } from "@/lib/columnTranslations";

interface DeviceHistoryTableProps {
  deviceCode: string;
}

interface RiceQualityData {
  id: number;
  device_code: string;
  created_at: string;
  thai_datetime: string;
  class1: number | null;
  class2: number | null;
  class3: number | null;
  short_grain: number | null;
  slender_kernel: number | null;
  whole_kernels: number | null;
  head_rice: number | null;
  total_brokens: number | null;
  small_brokens: number | null;
  small_brokens_c1: number | null;
  red_line_rate: number | null;
  parboiled_red_line: number | null;
  parboiled_white_rice: number | null;
  honey_rice: number | null;
  yellow_rice_rate: number | null;
  black_kernel: number | null;
  partly_black_peck: number | null;
  partly_black: number | null;
  imperfection_rate: number | null;
  sticky_rice_rate: number | null;
  impurity_num: number | null;
  paddy_rate: number | null;
  whiteness: number | null;
  process_precision: number | null;
  [key: string]: any;
}

const ITEMS_PER_PAGE = 20;

// Define categorized data structure
const DATA_CATEGORIES = {
  general: {
    title: "ข้อมูลทั่วไป",
    icon: "📋",
    color: "bg-blue-50 border-blue-200",
    fields: ['device_code', 'thai_datetime']
  },
  wholeGrain: {
    title: "การจำแนกเมล็ดข้าวทั้งเมล็ด",
    icon: "🌾",
    color: "bg-green-50 border-green-200",
    fields: ['class1', 'class2', 'class3', 'short_grain', 'slender_kernel']
  },
  composition: {
    title: "องค์ประกอบ",
    icon: "🔬",
    color: "bg-purple-50 border-purple-200", 
    fields: ['whole_kernels', 'head_rice', 'total_brokens', 'small_brokens', 'small_brokens_c1']
  },
  characteristics: {
    title: "คุณลักษณะและความบกพร่อง",
    icon: "⚠️",
    color: "bg-orange-50 border-orange-200",
    fields: [
      'red_line_rate', 'parboiled_red_line', 'parboiled_white_rice', 'honey_rice',
      'yellow_rice_rate', 'black_kernel', 'partly_black_peck', 'partly_black',
      'imperfection_rate', 'sticky_rice_rate', 'impurity_num', 'paddy_rate',
      'whiteness', 'process_precision'
    ]
  }
};

export const DeviceHistoryTable: React.FC<DeviceHistoryTableProps> = ({ deviceCode }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState<RiceQualityData | null>(null);

  const { data: historyData, isLoading, error } = useQuery({
    queryKey: ['deviceHistory', deviceCode, currentPage],
    queryFn: async () => {
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      
      const { data, error, count } = await supabase
        .from('rice_quality_analysis')
        .select('*', { count: 'exact' })
        .eq('device_code', deviceCode)
        .order('created_at', { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1);

      if (error) throw error;
      
      return { data: data as RiceQualityData[], count: count || 0 };
    },
  });

  const totalPages = historyData ? Math.ceil(historyData.count / ITEMS_PER_PAGE) : 0;

  const formatValue = (value: number | null): string => {
    if (value === null || value === undefined) return '-';
    return value.toFixed(2);
  };

  // Get all column keys from the first data item, excluding internal columns
  const getColumnKeys = () => {
    if (!historyData?.data || historyData.data.length === 0) return [];
    
    const firstItem = historyData.data[0];
    
    // Get filtered columns - exclude specific columns
    const filteredColumns = Object.keys(firstItem).filter(key => 
      !key.startsWith('_') && 
      key !== 'sample_index' && 
      key !== 'output' &&
      key !== 'id' &&
      key !== 'created_at'
    );
    
    // Create a prioritized array with thai_datetime first, then device_code
    let orderedColumns = [];
    
    // Add thai_datetime first if it exists
    if (filteredColumns.includes('thai_datetime')) {
      orderedColumns.push('thai_datetime');
      filteredColumns.splice(filteredColumns.indexOf('thai_datetime'), 1);
    }
    
    // Add device_code next if it exists
    if (filteredColumns.includes('device_code')) {
      orderedColumns.push('device_code');
      filteredColumns.splice(filteredColumns.indexOf('device_code'), 1);
    }
    
    // Add the rest
    return [...orderedColumns, ...filteredColumns];
  };

  // Format cell value based on column type
  const formatCellValue = (key: string, value: any): string => {
    if (key === 'thai_datetime') {
      return value ? 
        new Date(value).toLocaleString('th-TH', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }) : '-';
    }
    
    if (key === 'device_code') {
      return value?.toString() || '-';
    }
    
    return formatValue(value);
  };

  // Render categorized data in the dialog
  const renderCategorizedData = (data: RiceQualityData) => {
    return Object.entries(DATA_CATEGORIES).map(([categoryKey, category]) => {
      const categoryData = category.fields.filter(field => 
        data[field] !== null && data[field] !== undefined
      );

      if (categoryData.length === 0) return null;

      return (
        <Card key={categoryKey} className={`${category.color} shadow-sm`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span>{category.icon}</span>
              {category.title}
              <Badge variant="secondary" className="ml-auto">
                {categoryData.length} รายการ
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categoryData.map((field) => (
                <div key={field} className="flex justify-between items-center p-2 bg-white/60 rounded-md">
                  <span className="text-sm text-gray-600 font-medium">
                    {getColumnThaiName(field)}:
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {formatCellValue(field, data[field])}
                    {field !== 'device_code' && field !== 'thai_datetime' && field !== 'paddy_rate' ? '%' : ''}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <h3 className="text-lg font-semibold mb-4">ประวัติข้อมูลทั้งหมด</h3>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <h3 className="text-lg font-semibold mb-4">ประวัติข้อมูลทั้งหมด</h3>
        <div className="text-center py-8 text-red-600">
          เกิดข้อผิดพลาดในการโหลดข้อมูล
        </div>
      </div>
    );
  }

  const columnKeys = getColumnKeys();

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">ประวัติข้อมูลทั้งหมด</h3>
          <span className="text-sm text-gray-500">
            รวม {historyData?.count || 0} รายการ | แสดง {columnKeys.length + 1} คอลัมน์
          </span>
        </div>

        {historyData?.data && historyData.data.length > 0 ? (
          <>
            <div className="overflow-x-auto">
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
                  {historyData.data.map((row) => (
                    <TableRow key={row.id} onClick={() => setSelectedRow(row)} className="cursor-pointer hover:bg-muted/50">
                      {columnKeys.map((key) => (
                        <TableCell key={`${row.id}-${key}`} className="whitespace-nowrap">
                          {formatCellValue(key, row[key])}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRow(row)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </ResponsiveTable>
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
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            ไม่พบข้อมูลประวัติสำหรับอุปกรณ์นี้
          </div>
        )}
      </div>

      {/* Detail Dialog with New Categorized Format */}
      <Dialog open={selectedRow !== null} onOpenChange={() => setSelectedRow(null)}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center text-emerald-700">
              📊 รายละเอียดข้อมูลการวิเคราะห์คุณภาพข้าว
            </DialogTitle>
            <Separator className="my-2" />
          </DialogHeader>
          {selectedRow && (
            <div className="space-y-4 mt-4">
              {/* Summary Header */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-emerald-800">รหัสอุปกรณ์: {selectedRow.device_code}</h4>
                    <p className="text-sm text-emerald-600">
                      วันที่-เวลา: {selectedRow.thai_datetime 
                        ? new Date(selectedRow.thai_datetime).toLocaleString('th-TH', { 
                            year: 'numeric', month: '2-digit', day: '2-digit', 
                            hour: '2-digit', minute: '2-digit', second: '2-digit' 
                          }) 
                        : new Date(selectedRow.created_at).toLocaleString('th-TH', { 
                            year: 'numeric', month: '2-digit', day: '2-digit', 
                            hour: '2-digit', minute: '2-digit', second: '2-digit' 
                          })
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-emerald-700 border-emerald-300">
                      ID: {selectedRow.id}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Categorized Data Display */}
              <div className="grid gap-4">
                {renderCategorizedData(selectedRow)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
