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

export function DatabaseTable() {
  const [data, setData] = useState<RiceQualityAnalysisRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rowLimit, setRowLimit] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [goToPage, setGoToPage] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const fetchTotalCount = async () => {
    try {
      const { count, error } = await supabase
        .from('rice_quality_analysis')
        .select('*', { count: 'exact', head: true });
        
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
      
      console.log(`Fetching page ${currentPage} with limit ${rowLimit}`);
      
      // Fetch total count first if we don't have it yet
      if (totalCount === 0) {
        await fetchTotalCount();
      }
      
      // Fetch paginated data
      const { data, error } = await supabase
        .from('rice_quality_analysis')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + rowLimit - 1);
      
      if (error) {
        console.error("Error fetching database table:", error);
        setError("ไม่สามารถดึงข้อมูลจากฐานข้อมูลได้");
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลจากฐานข้อมูลได้",
          variant: "destructive",
        });
        return;
      }
      
      console.log(`Fetched ${data?.length || 0} rows from rice_quality_analysis`);
      setData(data || []);
    } catch (error) {
      console.error("Unexpected error fetching database table:", error);
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

  // Drag scrolling with improved touch support
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
      const dist = (x - startX) * 1.5; // Adjust speed multiplier as needed
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
  }, [rowLimit, currentPage]);

  const handleRefresh = async () => {
    await fetchData();
    toast({
      title: "อัพเดทข้อมูลสำเร็จ",
      description: `แสดงผลข้อมูลล่าสุดจำนวน ${data.length} รายการ`,
    });
  };

  // ปรับปรุงฟังก์ชัน formatDate เพื่อให้แสดง thai_datetime ในรูปแบบวันที่และเวลาเท่านั้น
  const formatDate = (dateString: string | null, columnKey?: string) => {
    if (!dateString) return "-";
    
    try {
      // ถ้าเป็นคอลัมน์ thai_datetime ให้แสดงเฉพาะวันที่และเวลา
      if (columnKey === 'thai_datetime') {
        // แยกส่วนวันที่และเวลาจาก thai_datetime
        const [datePart, timePart] = dateString.split('T');
        // ตัดส่วน timezone ออกจากเวลา (ถ้ามี)
        const timeOnly = timePart ? timePart.split('+')[0] : '';
        
        return `${datePart} ${timeOnly}`;
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
    if (!data || data.length === 0) return ['thai_datetime', 'device_code'];
    
    const firstItem = data[0];
    
    // Get filtered columns - exclude specific columns
    const filteredColumns = Object.keys(firstItem).filter(key => 
      !key.startsWith('_') && 
      key !== 'sample_index' && 
      key !== 'output' &&
      key !== 'id' &&
      key !== 'created_at'
    );
    
    // Create a prioritized array with thai_datetime first
    let orderedColumns = [];
    
    // Add thai_datetime first if it exists
    if (filteredColumns.includes('thai_datetime')) {
      orderedColumns.push('thai_datetime');
      // Remove from filtered columns to avoid duplication
      filteredColumns.splice(filteredColumns.indexOf('thai_datetime'), 1);
    }
    
    // Add the rest
    return [...orderedColumns, ...filteredColumns];
  };

  const columnKeys = getColumnKeys();

  return (
    <div className="mt-8">
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
                  <TableHead key={key} className="whitespace-nowrap">{key}</TableHead>
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
            <div className="flex flex-1 items-center justify-between sm:hidden">
              <Button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                variant="outline"
                size="icon"
                className="h-7 w-12 p-0"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              
              <div className="flex items-center space-x-1">
                <form onSubmit={handleGoToPageSubmit} className="flex items-center space-x-1">
                  <Select
                    value={currentPage.toString()}
                    onValueChange={(value) => setCurrentPage(parseInt(value))}
                  >
                    <SelectTrigger className="w-[70px] h-7 text-xs px-2">
                      <span className="text-xs">หน้า {currentPage}</span>
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {Array.from({length: Math.min(Math.ceil(totalCount / rowLimit), 20)}, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          หน้า {i + 1}
                        </SelectItem>
                      ))}
                      {Math.ceil(totalCount / rowLimit) > 20 && (
                        <div className="p-2 border-t">
                          <Input
                            type="number"
                            placeholder="ไปหน้า..."
                            value={goToPage}
                            onChange={(e) => setGoToPage(e.target.value)}
                            className="h-7 text-xs"
                            min={1}
                            max={Math.ceil(totalCount / rowLimit)}
                          />
                          <div className="pt-1">
                            <Button 
                              size="sm" 
                              className="w-full h-6 text-xs" 
                              onClick={handleGoToPageSubmit}
                            >
                              ไป
                            </Button>
                          </div>
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </form>
              </div>
              
              <Button
                onClick={goToNextPage}
                disabled={currentPage >= Math.ceil(totalCount / rowLimit)}
                variant="outline"
                size="icon"
                className="h-7 w-12 p-0"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-gray-700">
                  แสดง{" "}
                  <span className="font-medium">{Math.min(rowLimit, data.length)}</span>{" "}
                  จาก{" "}
                  <span className="font-medium">{totalCount}</span>{" "}
                  รายการ
                </p>
              </div>
              
              <div className="flex items-center space-x-1.5">
                <Button
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 p-0"
                >
                  <ChevronsLeft className="h-3.5 w-3.5" />
                </Button>
                
                <Button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 p-0"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                
                <div className="flex items-center space-x-1">
                  <form onSubmit={handleGoToPageSubmit} className="flex items-center space-x-1">
                    <span className="text-xs">หน้า</span>
                    <Input
                      type="text"
                      value={goToPage}
                      onChange={(e) => setGoToPage(e.target.value)}
                      className="h-7 w-12 text-center text-xs"
                    />
                    <span className="text-xs">จาก {Math.ceil(totalCount / rowLimit)}</span>
                    <Button type="submit" variant="outline" size="sm" className="h-7 px-2 py-0 text-xs">
                      ไป
                    </Button>
                  </form>
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
                
                <Button
                  onClick={goToLastPage}
                  disabled={currentPage >= Math.ceil(totalCount / rowLimit)}
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 p-0"
                >
                  <ChevronsRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
