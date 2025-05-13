
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
            <PriceTableTab ricePrices={ricePrices} />
          </TabsContent>
          
          <TabsContent value="documents">
            <DocumentsTableTab ricePriceDocuments={ricePriceDocuments} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
