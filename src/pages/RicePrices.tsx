
import { AppLayout } from "@/components/layouts/app-layout"; // Import AppLayout
import { RicePriceTable } from "@/components/RicePriceTable";
import { useIsMobile } from "@/hooks/use-mobile";
// FooterNav will be handled by AppLayout
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RicePrice, RicePriceDocument } from "@/features/user-management/types";
import { SAMPLE_RICE_PRICES, SAMPLE_RICE_DOCUMENTS } from "@/features/rice-price/utils";

export default function RicePrices() {
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);
  const [ricePrices, setRicePrices] = useState<RicePrice[]>([]);
  const [ricePriceDocuments, setRicePriceDocuments] = useState<RicePriceDocument[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Fetch rice prices
        const { data: pricesData, error: pricesError } = await supabase
          .from('rice_prices')
          .select('*')
          .order('name', { ascending: true });
          
        if (pricesError) {
          console.error('Error fetching rice prices:', pricesError);
          setError(pricesError);
        } else {
          console.log('Successfully fetched rice prices:', pricesData?.length || 0);
          setRicePrices(pricesData as RicePrice[] || []);
        }
        
        // Fetch rice price documents
        const { data: docsData, error: docsError } = await supabase
          .from('rice_price_documents')
          .select('*')
          .order('document_date', { ascending: false });
          
        if (docsError) {
          console.error('Error fetching documents:', docsError);
          setError(docsError);
        } else {
          console.log('Successfully fetched rice price documents:', docsData?.length || 0);
          setRicePriceDocuments(docsData as RicePriceDocument[] || []);
        }
      } catch (err) {
        console.error('Exception in loadData:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, []);

  // Show sample data if we couldn't fetch real data
  useEffect(() => {
    if (!isLoading && ((ricePrices.length === 0 && ricePriceDocuments.length === 0) || error)) {
      toast({
        title: "ข้อมูลราคาข้าว",
        description: error ? "เกิดข้อผิดพลาดในการโหลดข้อมูล กำลังแสดงข้อมูลตัวอย่าง" : "ไม่พบข้อมูลจริง กำลังแสดงข้อมูลตัวอย่าง",
        variant: "default"
      });
    }
  }, [isLoading, ricePrices, ricePriceDocuments, error]);
  
  return (
    <AppLayout showFooterNav={true}>
      {/* The main tag and its specific classes (p-4, pb-32, md:mx-auto, etc.) are now handled by AppLayout's main tag. */}
      {/* We can add a wrapper div here if specific padding beyond AppLayout's default is needed for this page's content */}
      <div className="p-4 md:mx-auto md:max-w-5xl md:px-8 w-full"> {/* Retaining inner content padding & max-width for now */}
        <div className="flex flex-col mb-8">
          <div className="relative">
            <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold mb-2 text-emerald-800 dark:text-emerald-400`}>
              ราคาข้าว สมาคมโรงสีข้าวไทย
            </h1>
            <div className="absolute -bottom-1 left-0 w-16 h-1 bg-emerald-500 rounded-full"></div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm">
            ข้อมูลราคาข้าวจากสมาคมโรงสีข้าวไทย อัพเดทล่าสุด
          </p>
        </div>

        {/* Background decorative elements */}
        <div className="absolute top-32 right-16 w-48 h-48 bg-emerald-300 rounded-full filter blur-3xl opacity-10 -z-10"></div>
        <div className="absolute bottom-32 left-16 w-64 h-64 bg-teal-400 rounded-full filter blur-3xl opacity-10 -z-10"></div>

        {isLoading ? (
          <div className="flex justify-center items-center py-24 bg-white/50 dark:bg-gray-800/20 rounded-xl backdrop-blur-sm border border-gray-100 dark:border-gray-700/30">
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-2" />
              <p className="text-gray-500 dark:text-gray-400">กำลังโหลดข้อมูลราคาข้าว...</p>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <Card className="border border-emerald-100 dark:border-emerald-800/30 dark:bg-gray-900/50 shadow-md backdrop-blur-sm rounded-xl overflow-hidden">
              <div className="p-4">
                <div className="bg-emerald-50/50 dark:bg-emerald-900/20 py-2 px-4 rounded-lg mb-3 flex flex-wrap gap-2 items-center justify-between border border-emerald-100 dark:border-emerald-800/30">
                  <h2 className="text-sm font-medium text-emerald-800 dark:text-emerald-300">ตารางราคาข้าวล่าสุด</h2>
                  <div className="text-xs text-gray-500 dark:text-gray-400 bg-white/70 dark:bg-gray-800/70 py-1 px-2 rounded-md border border-gray-100 dark:border-gray-700/30">
                    อัพเดทเมื่อ: {new Date().toLocaleDateString('th-TH')}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <RicePriceTable />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-right">
                  * ราคาอาจมีการเปลี่ยนแปลงตามประกาศของสมาคมโรงสีข้าวไทย
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
