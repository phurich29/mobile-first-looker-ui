
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

  const getDisplayColumns = () => [
    { key: 'thai_datetime', label: 'วันที่-เวลา' },
    { key: 'class1', label: 'ชั้น 1' },
    { key: 'class2', label: 'ชั้น 2' },
    { key: 'class3', label: 'ชั้น 3' },
    { key: 'whole_kernels', label: 'เมล็ดเต็ม' },
    { key: 'head_rice', label: 'ข้าวหัว' },
    { key: 'total_brokens', label: 'ข้าวหักรวม' },
    { key: 'small_brokens', label: 'ข้าวหักเล็ก' },
    { key: 'whiteness', label: 'ความขาว' },
    { key: 'imperfection_rate', label: 'ข้าวด้วย' },
    { key: 'paddy_rate', label: 'ข้าวเปลือก' },
    { key: 'yellow_rice_rate', label: 'ข้าวเหลือง' },
  ];

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

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">ประวัติข้อมูลทั้งหมด</h3>
          <span className="text-sm text-gray-500">
            รวม {historyData?.count || 0} รายการ
          </span>
        </div>

        {historyData?.data && historyData.data.length > 0 ? (
          <>
            <ResponsiveTable>
              <TableHeader>
                <TableRow>
                  {getDisplayColumns().map((col) => (
                    <TableHead key={col.key}>
                      {col.label}
                    </TableHead>
                  ))}
                  <TableHead>รายละเอียด</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyData.data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      {row.thai_datetime ? 
                        new Date(row.thai_datetime).toLocaleString('th-TH', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 
                        new Date(row.created_at).toLocaleString('th-TH', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      }
                    </TableCell>
                    <TableCell>{formatValue(row.class1)}</TableCell>
                    <TableCell>{formatValue(row.class2)}</TableCell>
                    <TableCell>{formatValue(row.class3)}</TableCell>
                    <TableCell>{formatValue(row.whole_kernels)}</TableCell>
                    <TableCell>{formatValue(row.head_rice)}</TableCell>
                    <TableCell>{formatValue(row.total_brokens)}</TableCell>
                    <TableCell>{formatValue(row.small_brokens)}</TableCell>
                    <TableCell>{formatValue(row.whiteness)}</TableCell>
                    <TableCell>{formatValue(row.imperfection_rate)}</TableCell>
                    <TableCell>{formatValue(row.paddy_rate)}</TableCell>
                    <TableCell>{formatValue(row.yellow_rice_rate)}</TableCell>
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
                  <div>ชั้น 1: {formatValue(selectedRow.class1)}%</div>
                  <div>ชั้น 2: {formatValue(selectedRow.class2)}%</div>
                  <div>ชั้น 3: {formatValue(selectedRow.class3)}%</div>
                  <div>เมล็ดสั้น: {formatValue(selectedRow.short_grain)}%</div>
                  <div>เมล็ดยาว: {formatValue(selectedRow.slender_kernel)}%</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">คุณภาพข้าว</h4>
                <div className="space-y-1 text-sm">
                  <div>เมล็ดเต็ม: {formatValue(selectedRow.whole_kernels)}%</div>
                  <div>ข้าวหัว: {formatValue(selectedRow.head_rice)}%</div>
                  <div>ข้าวหักรวม: {formatValue(selectedRow.total_brokens)}%</div>
                  <div>ข้าวหักเล็ก: {formatValue(selectedRow.small_brokens)}%</div>
                  <div>ข้าวหักเล็ก C1: {formatValue(selectedRow.small_brokens_c1)}%</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">สีและความบริสุทธิ์</h4>
                <div className="space-y-1 text-sm">
                  <div>ความขาว: {formatValue(selectedRow.whiteness)}</div>
                  <div>เส้นแดง: {formatValue(selectedRow.red_line_rate)}%</div>
                  <div>ข้าวเหลือง: {formatValue(selectedRow.yellow_rice_rate)}%</div>
                  <div>ข้าวน้ำผึ้ง: {formatValue(selectedRow.honey_rice)}%</div>
                  <div>เมล็ดดำ: {formatValue(selectedRow.black_kernel)}%</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">สิ่งเจือปน</h4>
                <div className="space-y-1 text-sm">
                  <div>ข้าวด้วย: {formatValue(selectedRow.imperfection_rate)}%</div>
                  <div>ข้าวเหนียว: {formatValue(selectedRow.sticky_rice_rate)}%</div>
                  <div>ข้าวเปลือก: {formatValue(selectedRow.paddy_rate)}%</div>
                  <div>สิ่งปนเปื้อน: {formatValue(selectedRow.impurity_num)}%</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">อื่นๆ</h4>
                <div className="space-y-1 text-sm">
                  <div>ความแม่นยำ: {formatValue(selectedRow.process_precision)}%</div>
                  <div>ข้าวสุกขาว: {formatValue(selectedRow.parboiled_white_rice)}%</div>
                  <div>ข้าวสุกเส้นแดง: {formatValue(selectedRow.parboiled_red_line)}%</div>
                  <div>ดำบางส่วน: {formatValue(selectedRow.partly_black)}%</div>
                  <div>จุดดำบางส่วน: {formatValue(selectedRow.partly_black_peck)}%</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
