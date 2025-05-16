
import { Header } from "@/components/Header";
import { RicePriceTable } from "@/components/RicePriceTable";
import { useIsMobile } from "@/hooks/use-mobile";
import { FooterNav } from "@/components/FooterNav";
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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64 overflow-hidden">
      <Header />
      <main className="flex-1 p-4 pb-32 md:pb-16 md:mx-auto md:max-w-5xl md:px-8 w-full">
        <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold mb-4 text-emerald-800`}>
          ราคาข้าว สมาคมโรงสีข้าวไทย
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="mt-4">
            <Card className="border-emerald-100 mb-4 p-1 overflow-x-auto">
              <div className="p-2">
                <RicePriceTable />
              </div>
            </Card>
          </div>
        )}
      </main>

      <FooterNav />
    </div>
  );
}
