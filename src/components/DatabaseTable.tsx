
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching rice quality analysis data...");
      
      const { data, error } = await supabase
        .from('rice_quality_analysis')
        .select('id, device_code, created_at, thai_datetime')
        .order('created_at', { ascending: false })
        .limit(100);
      
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

  useEffect(() => {
    fetchData();
  }, []);

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

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">ตาราง Database</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          className="border-emerald-200 bg-white hover:bg-emerald-50"
        >
          รีเฟรชข้อมูล
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <ResponsiveTable>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Device Code</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Thai Datetime</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.device_code || "-"}</TableCell>
                  <TableCell>{formatDate(row.created_at)}</TableCell>
                  <TableCell>{formatDate(row.thai_datetime)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </ResponsiveTable>
      </div>
    </div>
  );
}
