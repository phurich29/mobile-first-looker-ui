
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RiceQualityAnalysisRow } from "./types";
import { getColumnKeys } from "./utils";

export function useDatabaseTable() {
  const [data, setData] = useState<RiceQualityAnalysisRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rowLimit, setRowLimit] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [goToPage, setGoToPage] = useState<string>("");
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

  const columnKeys = getColumnKeys(data);

  return {
    data,
    loading,
    error,
    rowLimit,
    setRowLimit,
    currentPage,
    setCurrentPage,
    totalCount,
    goToPage,
    setGoToPage,
    columnKeys,
    fetchData,
    handleRefresh,
    handleGoToPageSubmit,
    goToFirstPage,
    goToPreviousPage,
    goToNextPage,
    goToLastPage,
  };
}
