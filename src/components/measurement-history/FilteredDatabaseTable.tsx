import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RiceQualityAnalysisRow {
  id: number;
  device_code: string;
  created_at: string;
  thai_datetime: string;
  [key: string]: any;
}

interface FilteredDatabaseTableProps {
  deviceCode: string;
  symbol: string;
  name: string;
}

export function FilteredDatabaseTable({ deviceCode, symbol, name }: FilteredDatabaseTableProps) {
  const [data, setData] = useState<RiceQualityAnalysisRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rowLimit, setRowLimit] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [goToPage, setGoToPage] = useState<string>("");
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const fetchTotalCount = async () => {
    try {
      const { count, error } = await supabase
        .from('rice_quality_analysis')
        .select('*', { count: 'exact', head: true })
        .eq('device_code', deviceCode)
        .not(symbol, 'is', null);
        
      if (error) {
        console.error("Error fetching count:", error);
        return;
      }
      
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error in fetchTotalCount:", error);
    }
  };
  
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Calculate offset based on current page and row limit
      const offset = (currentPage - 1) * rowLimit;
      
      console.log(`Fetching filtered data for device ${deviceCode}, symbol ${symbol}, page ${currentPage} with limit ${rowLimit}`);
      
      // Fetch total count first if we don't have it yet
      if (totalCount === 0) {
        await fetchTotalCount();
      }
      
      // Fetch paginated data with filter
      const { data, error } = await supabase
        .from('rice_quality_analysis')
        .select('*')
        .eq('device_code', deviceCode)
        .not(symbol, 'is', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + rowLimit - 1);
      
      if (error) {
        console.error("Error fetching filtered database table:", error);
        setError("ไม่สามารถดึงข้อมูลจากฐานข้อมูลได้");
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลจากฐานข้อมูลได้",
          variant: "destructive",
        });
        return;
      }
      
      console.log(`Fetched ${data?.length || 0} filtered rows from rice_quality_analysis`);
      setData(data || []);
    } catch (error) {
      console.error("Unexpected error fetching filtered database table:", error);
      setError("เกิดข้อผิดพลาดที่ไม่คาดคิด");
    } finally {
      setLoading(false);
    }
  };
  
  // Navigation functions
  const goToFirstPage = () => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  const goToNextPage = () => {
    const maxPage = Math.ceil(totalCount / rowLimit);
    if (currentPage < maxPage) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  const goToLastPage = () => {
    const maxPage = Math.ceil(totalCount / rowLimit);
    if (currentPage !== maxPage) {
      setCurrentPage(maxPage);
    }
  };
  
  const handleGoToPageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(goToPage);
    const maxPage = Math.ceil(totalCount / rowLimit);
    
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPage) {
      setCurrentPage(pageNum);
      setGoToPage("");
    } else {
      toast({
        title: "หน้าไม่ถูกต้อง",
        description: `กรุณาระบุหน้าระหว่าง 1 ถึง ${maxPage}`,
        variant: "destructive",
      });
    }
  };

  // Drag scrolling with touch support
  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    if (!tableContainer) return;
    
    let isDown = false;
    let startX: number;
    let startScrollLeft: number;
    
    const onPointerDown = (e: PointerEvent) => {
      isDown = true;
      tableContainer.style.cursor = 'grabbing';
      tableContainer.style.userSelect = 'none';
      
      // Record starting positions
      startX = e.clientX;
      startScrollLeft = tableContainer.scrollLeft;
      
      // Capture pointer to get events outside the element
      tableContainer.setPointerCapture(e.pointerId);
    };
    
    const onPointerUp = () => {
      isDown = false;
      tableContainer.style.cursor = 'grab';
      tableContainer.style.removeProperty('user-select');
    };
    
    const onPointerLeave = () => {
      isDown = false;
      tableContainer.style.cursor = 'grab';
      tableContainer.style.removeProperty('user-select');
    };
    
    const onPointerMove = (e: PointerEvent) => {
      if (!isDown) return;
      e.preventDefault();
      
      // Calculate distance moved and new scroll position
      const x = e.clientX;
      const dist = (x - startX) * 1.5; 
      tableContainer.scrollLeft = startScrollLeft - dist;
    };
    
    // Add all event listeners
    tableContainer.addEventListener('pointerdown', onPointerDown);
    tableContainer.addEventListener('pointerup', onPointerUp);
    tableContainer.addEventListener('pointerleave', onPointerLeave);
    tableContainer.addEventListener('pointermove', onPointerMove);
    
    // Set initial cursor style
    tableContainer.style.cursor = 'grab';
    
    // Cleanup
    return () => {
      tableContainer.removeEventListener('pointerdown', onPointerDown);
      tableContainer.removeEventListener('pointerup', onPointerUp);
      tableContainer.removeEventListener('pointerleave', onPointerLeave);
      tableContainer.removeEventListener('pointermove', onPointerMove);
    };
  }, []);
  
  // โหลดข้อมูลเมื่อหน้าหรือจำนวนแถวเปลี่ยน
  useEffect(() => {
    fetchData();
  }, [rowLimit, currentPage, deviceCode, symbol]);

  const handleRefresh = async () => {
    await fetchData();
    toast({
      title: "อัพเดทข้อมูลสำเร็จ",
      description: `แสดงผลข้อมูลล่าสุดจำนวน ${data.length} รายการ`,
    });
  };

  // ปรับปรุงฟังก์ชัน formatDate เพื่อให้แสดง thai_datetime ในรูปแบบที่ต้องการ
  const formatDate = (dateString: string | null, columnKey?: string) => {
    if (!dateString) return "-";
    try {
      // ถ้าเป็นคอลัมน์ thai_datetime ให้แสดงค่าตามที่มีในฐานข้อมูลโดยตรง แต่ปรับรูปแบบให้เหลือแค่วันที่และเวลา
      if (columnKey === 'thai_datetime') {
        // แยกส่วนวันที่และเวลาจากข้อมูล thai_datetime
        // รูปแบบที่คาดหวัง: "2023-05-21 15:30:45+00"
        try {
          const dateParts = dateString.split(' ');
          
          if (dateParts.length >= 2) {
            // แยกเอาเฉพาะวันที่ (dateParts[0]) และเวลา (dateParts[1])
            // ตัดส่วนของ timezone (+00) ออกจากเวลา
            const timeWithoutTimezone = dateParts[1].split('+')[0];
            
            // แสดงในรูปแบบ "YYYY-MM-DD HH:MM:SS" (ไม่มีคำนำหน้า "วันที่:" หรือ "เวลา:")
            return `${dateParts[0]} ${timeWithoutTimezone}`;
          }
          
          // หากไม่สามารถแยกได้ ให้แสดงค่าเดิม
          return dateString;
        } catch (e) {
          // หากมีข้อผิดพลาดในการแยก ให้แสดงค่าเดิม
          return dateString;
        }
      }
      
      // สำหรับคอลัมน์อื่นๆ ยังคงใช้การแปลงวันที่แบบเดิม
      return new Date(dateString).toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return <div className="text-center py-8">กำลังโหลดข้อมูล...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
        <Button onClick={fetchData} variant="outline" className="mt-4">
          ลองอีกครั้ง
        </Button>
      </div>
    );
  }

  // Get all column keys from the first data item, excluding internal columns
  const getColumnKeys = () => {
    // Default columns if no data
    if (!data || data.length === 0) return ['thai_datetime', 'device_code', symbol];
    
    const firstItem = data[0];
    
    // Get filtered columns - exclude specific columns
    const filteredColumns = Object.keys(firstItem).filter(key => 
      !key.startsWith('_') && 
      key !== 'sample_index' && 
      key !== 'output' &&
      key !== 'id' &&
      key !== 'created_at'
    );
    
    // Create a prioritized array with thai_datetime first, then device_code, then the specific symbol
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
    
    // Add the specific symbol next if it exists
    if (filteredColumns.includes(symbol)) {
      orderedColumns.push(symbol);
      filteredColumns.splice(filteredColumns.indexOf(symbol), 1);
    }
    
    // Add the rest
    return [...orderedColumns, ...filteredColumns];
  };

  const columnKeys = getColumnKeys();

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-base font-medium">ข้อมูล {name} จากอุปกรณ์ {deviceCode}</h2>
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
            รีเฟรช
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div 
          ref={tableContainerRef}
          className="overflow-x-auto" 
          style={{ 
            WebkitOverflowScrolling: 'touch',
            position: 'relative'
          }}
        >
          <ResponsiveTable>
            <TableHeader>
              <TableRow>
                {columnKeys.map((key) => (
                  <TableHead key={key} className="whitespace-nowrap">
                    {key === symbol ? name : key}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columnKeys.length} className="text-center py-4">
                    ไม่พบข้อมูล
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row) => (
                  <TableRow key={row.id}>
                    {columnKeys.map((key) => (
                      <TableCell key={`${row.id}-${key}`} className="whitespace-nowrap">
                        {key.includes('date') || key.includes('_at') 
                          ? formatDate(row[key], key) 
                          : row[key]?.toString() || "-"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </ResponsiveTable>
        </div>
        
        {/* Pagination Controls */}
        {totalCount > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-2 py-2 sm:px-6 mt-2">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-gray-700">
                  แสดง <span className="font-medium">{Math.min((currentPage - 1) * rowLimit + 1, totalCount)}</span> ถึง <span className="font-medium">{Math.min(currentPage * rowLimit, totalCount)}</span> จากทั้งหมด{' '}
                  <span className="font-medium">{totalCount}</span> รายการ
                </p>
              </div>
              <div>
                <nav className="flex items-center space-x-1" aria-label="Pagination">
                  <Button
                    onClick={goToFirstPage}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 p-0"
                  >
                    <span className="sr-only">First page</span>
                    <ChevronsLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 p-0"
                  >
                    <span className="sr-only">Previous page</span>
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  
                  <form 
                    onSubmit={handleGoToPageSubmit} 
                    className="flex items-center space-x-1"
                  >
                    <span className="text-xs">หน้า</span>
                    <Input
                      type="text"
                      value={goToPage}
                      onChange={(e) => setGoToPage(e.target.value)}
                      className="w-12 h-7 text-xs p-1 text-center"
                      placeholder={currentPage.toString()}
                    />
                    <span className="text-xs">จาก {Math.ceil(totalCount / rowLimit)}</span>
                    <Button 
                      type="submit" 
                      size="sm" 
                      className="h-7 px-2 py-0 text-xs"
                    >
                      ไป
                    </Button>
                  </form>
                  
                  <Button
                    onClick={goToNextPage}
                    disabled={currentPage >= Math.ceil(totalCount / rowLimit)}
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 p-0"
                  >
                    <span className="sr-only">Next page</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    onClick={goToLastPage}
                    disabled={currentPage >= Math.ceil(totalCount / rowLimit)}
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 p-0"
                  >
                    <span className="sr-only">Last page</span>
                    <ChevronsRight className="h-3.5 w-3.5" />
                  </Button>
                </nav>
              </div>
            </div>
            
            {/* Mobile pagination */}
            <div className="flex flex-1 items-center justify-between sm:hidden">
              <Button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                variant="outline"
                size="icon"
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              
              <div className="text-xs text-gray-700">
                หน้า {currentPage} จาก {Math.ceil(totalCount / rowLimit)}
              </div>
              
              <Button
                onClick={goToNextPage}
                disabled={currentPage >= Math.ceil(totalCount / rowLimit)}
                variant="outline"
                size="icon"
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FilteredDatabaseTable;
