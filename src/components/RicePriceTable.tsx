
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RicePrice, RicePriceDocument } from "@/features/user-management/types";
import { ExternalLink, FileText } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ResponsiveTable } from "./ui/responsive-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

export function RicePriceTable() {
  const [activeTab, setActiveTab] = useState("prices");
  const isMobile = useIsMobile();

  // Function to fetch rice prices
  const fetchRicePrices = async () => {
    const { data, error } = await supabase
      .from('rice_prices')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return data as unknown as RicePrice[];
  };

  // Function to fetch rice price documents
  const fetchRicePriceDocuments = async () => {
    const { data, error } = await supabase
      .from('rice_price_documents')
      .select('*')
      .order('document_date', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data as unknown as RicePriceDocument[];
  };

  // Use React Query to fetch and cache rice prices
  const { 
    data: ricePrices, 
    isLoading: isPricesLoading, 
    error: pricesError 
  } = useQuery({
    queryKey: ['ricePricesPublic'],
    queryFn: fetchRicePrices
  });

  // Use React Query to fetch and cache rice price documents
  const { 
    data: ricePriceDocuments, 
    isLoading: isDocsLoading, 
    error: docsError 
  } = useQuery({
    queryKey: ['ricePriceDocumentsPublic'],
    queryFn: fetchRicePriceDocuments
  });

  // Format date for display in Thai format
  const formatThaiDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Get text color class based on price color
  const getPriceColorClass = (color: string = 'black') => {
    switch (color) {
      case 'green': return 'text-emerald-600';
      case 'red': return 'text-red-600';
      default: return 'text-gray-900';
    }
  };

  if (isPricesLoading || isDocsLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (pricesError || docsError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-2">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
        <p className="text-gray-500 text-sm">
          {((pricesError || docsError) as Error).message}
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-center text-emerald-800">ราคาข้าวสมาคมโรงสีข้าวไทย</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="prices" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="prices">ราคาข้าว</TabsTrigger>
            <TabsTrigger value="documents">เอกสารราคาข้าว</TabsTrigger>
          </TabsList>
          
          <TabsContent value="prices">
            {ricePrices && ricePrices.length > 0 ? (
              <div className="space-y-6">
                <div className="rounded-md border">
                  <ResponsiveTable>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ชื่อข้าว</TableHead>
                        <TableHead>วันที่</TableHead>
                        <TableHead className="text-right">ราคา (บาท/100กก.)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ricePrices.map((price) => (
                        <TableRow key={price.id}>
                          <TableCell className={isMobile ? "whitespace-normal break-words" : "whitespace-nowrap"}>{price.name}</TableCell>
                          <TableCell>{price.document_date ? formatThaiDate(price.document_date) : '-'}</TableCell>
                          <TableCell className={`text-right font-medium ${getPriceColorClass(price.priceColor)}`}>
                            {price.price.toLocaleString('th-TH')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </ResponsiveTable>
                </div>
                <p className="text-xs text-gray-500 text-right mt-2 italic">
                  อัพเดทล่าสุด: {ricePrices && ricePrices.length > 0 && 
                    new Date(Math.max(...ricePrices.map(p => new Date(p.updated_at).getTime())))
                      .toLocaleDateString('th-TH', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                  }
                </p>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">ไม่พบข้อมูลราคาข้าว</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="documents">
            {ricePriceDocuments && ricePriceDocuments.length > 0 ? (
              <div className="space-y-2">
                {ricePriceDocuments.map((document) => (
                  <div 
                    key={document.id} 
                    className="p-3 border rounded-md hover:bg-gray-50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                  >
                    <div className="flex items-center">
                      <FileText size={20} className="text-emerald-600 mr-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium break-words">
                          ราคาข้าวประจำวันที่ {formatThaiDate(document.document_date)}
                        </p>
                        <p className="text-xs text-gray-500">
                          อัพเดทเมื่อ: {new Date(document.updated_at).toLocaleDateString('th-TH')}
                        </p>
                      </div>
                    </div>
                    <a 
                      href={document.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 mt-2 sm:mt-0"
                    >
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <ExternalLink size={14} />
                        ดูเอกสาร
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">ไม่พบเอกสารราคาข้าว</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
