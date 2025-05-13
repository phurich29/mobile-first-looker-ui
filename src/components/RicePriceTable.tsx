
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RicePrice, RicePriceDocument } from "@/features/user-management/types";
import { ExternalLink, FileText } from "lucide-react";

export function RicePriceTable() {
  const [activeTab, setActiveTab] = useState("prices");

  // Function to fetch rice prices
  const fetchRicePrices = async () => {
    const { data, error } = await supabase
      .from('rice_prices')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return data as RicePrice[];
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
    
    return data as RicePriceDocument[];
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

  // Group rice prices by category
  const groupedPrices = ricePrices?.reduce((acc, price) => {
    if (!acc[price.category]) {
      acc[price.category] = [];
    }
    acc[price.category].push(price);
    return acc;
  }, {} as Record<string, RicePrice[]>) || {};

  // Sort categories in a specific order
  const sortedCategories = Object.keys(groupedPrices).sort((a, b) => {
    const order = ["กข", "หอมมะลิ", "ปทุมธานี", "อื่นๆ"];
    return order.indexOf(a) - order.indexOf(b);
  });

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
            {sortedCategories.length > 0 ? (
              <div className="space-y-6">
                {sortedCategories.map((category) => (
                  <div key={category} className="rounded-md border">
                    <div className="bg-gray-50 px-4 py-2 border-b">
                      <h3 className="font-medium text-gray-700">ประเภทข้าว: {category}</h3>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อข้าว</th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ราคา (บาท/100กก.)</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {groupedPrices[category].map((price) => (
                          <tr key={price.id}>
                            <td className="px-4 py-3 text-sm text-gray-900">{price.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{price.price.toLocaleString('th-TH')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
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
                    className="p-3 border rounded-md hover:bg-gray-50 transition-colors flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      <FileText size={20} className="text-emerald-600 mr-2" />
                      <div>
                        <p className="font-medium">
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
                      className="text-blue-600 hover:text-blue-800"
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
