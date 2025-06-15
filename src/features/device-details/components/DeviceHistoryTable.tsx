
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

      {/* Detail Dialog */}
      <Dialog open={selectedRow !== null} onOpenChange={() => setSelectedRow(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>รายละเอียดข้อมูลการวิเคราะห์</DialogTitle>
          </DialogHeader>
          {selectedRow && (
            <div className="space-y-6 mt-4">
              {/* ข้อมูลทั่วไป */}
              <div>
                <h4 className="text-md font-semibold mb-2 border-b pb-1">ข้อมูลทั่วไป</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div>รหัสอุปกรณ์:</div><div>{selectedRow.device_code}</div>
                  <div>วันที่-เวลา:</div><div>{selectedRow.thai_datetime 
                    ? new Date(selectedRow.thai_datetime).toLocaleString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
                    : new Date(selectedRow.created_at).toLocaleString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
                  }</div>
                </div>
              </div>

              {/* ตารางที่ 1: การจำแนกเมล็ดข้าวทั้งเมล็ด */}
              <div>
                <h4 className="text-md font-semibold mb-2 border-b pb-1">ตารางที่ 1: การจำแนกเมล็ดข้าวทั้งเมล็ด</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div>{getColumnThaiName('Class 1(>7.0...)')}:</div><div>{formatValue(selectedRow.class1)}%</div>
                  <div>{getColumnThaiName('Class 2(>6.6-...)')}:</div><div>{formatValue(selectedRow.class2)}%</div>
                  <div>{getColumnThaiName('Class 3(>6.2-...)')}:</div><div>{formatValue(selectedRow.class3)}%</div>
                  <div>{getColumnThaiName('Short(≤6.2mm)')}:</div><div>{formatValue(selectedRow.short_grain)}%</div>
                  <div>{getColumnThaiName('Slender rice')}:</div><div>{formatValue(selectedRow.slender_kernel)}%</div>
                </div>
              </div>

              {/* ตารางที่ 2: องค์ประกอบ */}
              <div>
                <h4 className="text-md font-semibold mb-2 border-b pb-1">ตารางที่ 2: องค์ประกอบ</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div>{getColumnThaiName('Whole kernels')}:</div><div>{formatValue(selectedRow.whole_kernels)}%</div>
                  <div>{getColumnThaiName('Head rice')}:</div><div>{formatValue(selectedRow.head_rice)}%</div>
                  <div>{getColumnThaiName('Total brokens')}:</div><div>{formatValue(selectedRow.total_brokens)}%</div>
                  <div>{getColumnThaiName('Small brokens')}:</div><div>{formatValue(selectedRow.small_brokens)}%</div>
                  <div>{getColumnThaiName('C1 brokens')}:</div><div>{formatValue(selectedRow.small_brokens_c1)}%</div>
                </div>
              </div>

              {/* ตารางที่ 3: คุณลักษณะและความบกพร่อง */}
              <div>
                <h4 className="text-md font-semibold mb-2 border-b pb-1">ตารางที่ 3: คุณลักษณะและความบกพร่อง</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div>{getColumnThaiName('Red line')}:</div><div>{formatValue(selectedRow.red_line_rate)}%</div>
                  <div>{getColumnThaiName('Undercooked')}:</div><div>{formatValue(selectedRow.undercooked)}%</div>
                  <div>{getColumnThaiName('Deviated color')}:</div><div>{formatValue(selectedRow.deviated_color)}%</div>
                  <div>{getColumnThaiName('Slight deviated')}:</div><div>{formatValue(selectedRow.slight_deviated)}%</div>
                  <div>{getColumnThaiName('Yellow')}:</div><div>{formatValue(selectedRow.yellow_rice_rate)}%</div>
                  <div>{getColumnThaiName('Black kernels')}:</div><div>{formatValue(selectedRow.black_kernel)}%</div>
                  <div>{getColumnThaiName('Partly black & peck')}:</div><div>{formatValue(selectedRow.partly_black_peck)}%</div>
                  <div>{getColumnThaiName('Partly black')}:</div><div>{formatValue(selectedRow.partly_black)}%</div>
                  <div>{getColumnThaiName('Damaged')}:</div><div>{formatValue(selectedRow.imperfection_rate)}%</div>
                  <div>{getColumnThaiName('Glutinous rice')}:</div><div>{formatValue(selectedRow.sticky_rice_rate)}%</div>
                  <div>{getColumnThaiName('Impurity')}:</div><div>{formatValue(selectedRow.impurity_num)}%</div>
                  <div>{getColumnThaiName('Paddy(grain/kg)')}:</div><div>{formatValue(selectedRow.paddy_rate)}</div>
                  <div>{getColumnThaiName('Whiteness')}:</div><div>{formatValue(selectedRow.whiteness)}</div>
                  <div>{getColumnThaiName('Mill Degree')}:</div><div>{formatValue(selectedRow.process_precision)}%</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
