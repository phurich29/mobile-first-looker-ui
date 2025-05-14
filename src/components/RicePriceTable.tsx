
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRicePriceData } from "@/features/rice-price/hooks/useRicePriceData";
import { PriceTableTab } from "@/features/rice-price/components/PriceTableTab";
import { DocumentsTableTab } from "@/features/rice-price/components/DocumentsTableTab";
import { PriceTableLoading } from "@/features/rice-price/components/PriceTableLoading";
import { PriceTableError } from "@/features/rice-price/components/PriceTableError";

export function RicePriceTable() {
  const [activeTab, setActiveTab] = useState("prices");
  const { 
    ricePrices, 
    ricePriceDocuments, 
    isPricesLoading, 
    isDocsLoading, 
    pricesError, 
    docsError 
  } = useRicePriceData();

  if (isPricesLoading || isDocsLoading) {
    return <PriceTableLoading />;
  }

  if (pricesError || docsError) {
    return <PriceTableError error={(pricesError || docsError) as Error} />;
  }

  return (
    <div className="bg-transparent">
      <div className="w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-emerald-100">
            <TabsTrigger value="prices" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">ราคาข้าว</TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">เอกสารราคาข้าว</TabsTrigger>
          </TabsList>
          
          <TabsContent value="prices" className="px-0">
            <PriceTableTab ricePrices={ricePrices} />
          </TabsContent>
          
          <TabsContent value="documents" className="px-0">
            <DocumentsTableTab ricePriceDocuments={ricePriceDocuments} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
