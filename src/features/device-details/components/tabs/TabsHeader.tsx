
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabsHeaderProps {
  activeTab: string;
}

export const TabsHeader: React.FC<TabsHeaderProps> = ({ activeTab }) => {
  return (
    <TabsList className="grid grid-cols-4 mb-4">
      <TabsTrigger 
        value="wholegrain" 
        className="text-xs md:text-sm"
        data-active={activeTab === "wholegrain"}
      >
        พื้นข้าวเต็มเมล็ด
      </TabsTrigger>
      <TabsTrigger 
        value="ingredients" 
        className="text-xs md:text-sm"
        data-active={activeTab === "ingredients"}
      >
        ส่วนผสม
      </TabsTrigger>
      <TabsTrigger 
        value="impurities" 
        className="text-xs md:text-sm"
        data-active={activeTab === "impurities"}
      >
        สิ่งเจือปน
      </TabsTrigger>
      <TabsTrigger 
        value="all" 
        className="text-xs md:text-sm"
        data-active={activeTab === "all"}
      >
        ทั้งหมด
      </TabsTrigger>
    </TabsList>
  );
};
