
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

  // Mouse drag scrolling handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tableContainerRef.current) return;
    
    setIsDragging(true);
    setStartX(e.pageX - tableContainerRef.current.offsetLeft);
    setScrollLeft(tableContainerRef.current.scrollLeft);
    
    // ตั้งค่า cursor เพื่อบอกว่าตอนนี้กำลังลาก
    if (tableContainerRef.current) {
      tableContainerRef.current.style.cursor = 'grabbing';
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    
    // คืนค่า cursor กลับเป็นปกติ
    if (tableContainerRef.current) {
      tableContainerRef.current.style.cursor = 'grab';
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !tableContainerRef.current) return;
    
    e.preventDefault();
    const x = e.pageX - tableContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // ปรับความเร็วในการเลื่อน
    tableContainerRef.current.scrollLeft = scrollLeft - walk;
  };
  
  // ติดตั้ง event listener สำหรับ mouseup บน window เพื่อให้ปล่อยเมาส์นอกตารางได้
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        
        if (tableContainerRef.current) {
          tableContainerRef.current.style.cursor = 'grab';
        }
      }
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging]);
  
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
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
                <SelectValue placeholder="100" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
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
            cursor: 'grab',
            userSelect: 'none',
            position: 'relative'
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseUp}
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
                          ? formatDate(row[key]) 
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
