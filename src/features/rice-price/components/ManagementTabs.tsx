
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import { PriceList } from "./PriceList";
import { DocumentList } from "./DocumentList";
import { RicePrice, RicePriceDocument } from "@/features/user-management/types";

interface ManagementTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  ricePrices: RicePrice[] | undefined;
  ricePriceDocuments: RicePriceDocument[] | undefined;
  onOpenAddPrice: () => void;
  onOpenAddDoc: () => void;
  onEditPrice: (price: RicePrice) => void;
  onDeletePrice: (price: RicePrice) => void;
  onDeleteDocument: (document: RicePriceDocument) => void;
}

export function ManagementTabs({
  activeTab,
  setActiveTab,
  ricePrices,
  ricePriceDocuments,
  onOpenAddPrice,
  onOpenAddDoc,
  onEditPrice,
  onDeletePrice,
  onDeleteDocument
}: ManagementTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-4">
        <TabsTrigger value="prices">ราคาข้าว</TabsTrigger>
        <TabsTrigger value="documents">เอกสารราคาข้าวจากสมาคม</TabsTrigger>
      </TabsList>
      
      {/* Tab content for Rice Prices */}
      <TabsContent value="prices">
        <div className="flex justify-end mb-4">
          <Button className="flex items-center gap-2" onClick={onOpenAddPrice}>
            <Plus size={16} />
            เพิ่มราคาข้าวใหม่
          </Button>
        </div>
        
        <PriceList 
          ricePrices={ricePrices} 
          onEdit={onEditPrice}
          onDelete={onDeletePrice}
        />
      </TabsContent>
      
      {/* Tab content for Price Documents */}
      <TabsContent value="documents">
        <div className="flex justify-end mb-4">
          <Button className="flex items-center gap-2" onClick={onOpenAddDoc}>
            <Upload size={16} />
            เพิ่มเอกสารราคาข้าว
          </Button>
        </div>
        
        <DocumentList 
          documents={ricePriceDocuments}
          onDelete={onDeleteDocument}
        />
      </TabsContent>
    </Tabs>
  );
}
