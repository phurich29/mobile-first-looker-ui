
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
                    <TableRow key={row.id}>
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

      {/* Detail Dialog */}
      <Dialog open={selectedRow !== null} onOpenChange={() => setSelectedRow(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>รายละเอียดข้อมูลการวิเคราะห์</DialogTitle>
          </DialogHeader>
          {selectedRow && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              <div>
                <h4 className="font-semibold mb-2">ข้อมูลทั่วไป</h4>
                <div className="space-y-1 text-sm">
                  <div>รหัสอุปกรณ์: {selectedRow.device_code}</div>
                  <div>วันที่: {selectedRow.thai_datetime ? 
                    new Date(selectedRow.thai_datetime).toLocaleString('th-TH') : 
                    new Date(selectedRow.created_at).toLocaleString('th-TH')
                  }</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">การจำแนกเมล็ด</h4>
                <div className="space-y-1 text-sm">
                  <div>{getColumnThaiName('class1')}: {formatValue(selectedRow.class1)}%</div>
                  <div>{getColumnThaiName('class2')}: {formatValue(selectedRow.class2)}%</div>
                  <div>{getColumnThaiName('class3')}: {formatValue(selectedRow.class3)}%</div>
                  <div>{getColumnThaiName('short_grain')}: {formatValue(selectedRow.short_grain)}%</div>
                  <div>{getColumnThaiName('slender_kernel')}: {formatValue(selectedRow.slender_kernel)}%</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">คุณภาพข้าว</h4>
                <div className="space-y-1 text-sm">
                  <div>{getColumnThaiName('whole_kernels')}: {formatValue(selectedRow.whole_kernels)}%</div>
                  <div>{getColumnThaiName('head_rice')}: {formatValue(selectedRow.head_rice)}%</div>
                  <div>{getColumnThaiName('total_brokens')}: {formatValue(selectedRow.total_brokens)}%</div>
                  <div>{getColumnThaiName('small_brokens')}: {formatValue(selectedRow.small_brokens)}%</div>
                  <div>{getColumnThaiName('small_brokens_c1')}: {formatValue(selectedRow.small_brokens_c1)}%</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">สีและความบริสุทธิ์</h4>
                <div className="space-y-1 text-sm">
                  <div>{getColumnThaiName('whiteness')}: {formatValue(selectedRow.whiteness)}</div>
                  <div>{getColumnThaiName('red_line_rate')}: {formatValue(selectedRow.red_line_rate)}%</div>
                  <div>{getColumnThaiName('yellow_rice_rate')}: {formatValue(selectedRow.yellow_rice_rate)}%</div>
                  <div>{getColumnThaiName('honey_rice')}: {formatValue(selectedRow.honey_rice)}%</div>
                  <div>{getColumnThaiName('black_kernel')}: {formatValue(selectedRow.black_kernel)}%</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">สิ่งเจือปน</h4>
                <div className="space-y-1 text-sm">
                  <div>{getColumnThaiName('imperfection_rate')}: {formatValue(selectedRow.imperfection_rate)}%</div>
                  <div>{getColumnThaiName('sticky_rice_rate')}: {formatValue(selectedRow.sticky_rice_rate)}%</div>
                  <div>{getColumnThaiName('paddy_rate')}: {formatValue(selectedRow.paddy_rate)}%</div>
                  <div>{getColumnThaiName('impurity_num')}: {formatValue(selectedRow.impurity_num)}%</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">อื่นๆ</h4>
                <div className="space-y-1 text-sm">
                  <div>{getColumnThaiName('process_precision')}: {formatValue(selectedRow.process_precision)}%</div>
                  <div>{getColumnThaiName('parboiled_white_rice')}: {formatValue(selectedRow.parboiled_white_rice)}%</div>
                  <div>{getColumnThaiName('parboiled_red_line')}: {formatValue(selectedRow.parboiled_red_line)}%</div>
                  <div>{getColumnThaiName('partly_black')}: {formatValue(selectedRow.partly_black)}%</div>
                  <div>{getColumnThaiName('partly_black_peck')}: {formatValue(selectedRow.partly_black_peck)}%</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
