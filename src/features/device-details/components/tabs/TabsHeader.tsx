
import React, { useRef, useState, MouseEvent } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabsHeaderProps {
  activeTab: string;
}

export const TabsHeader: React.FC<TabsHeaderProps> = ({ activeTab }) => {
  const tabsListRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!tabsListRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - tabsListRef.current.offsetLeft);
    setScrollLeft(tabsListRef.current.scrollLeft);
    tabsListRef.current.style.cursor = 'grabbing';
    tabsListRef.current.style.userSelect = 'none';
  };

  const handleMouseLeaveOrUp = () => {
    if (!tabsListRef.current) return;
    setIsDragging(false);
    tabsListRef.current.style.cursor = 'grab';
    tabsListRef.current.style.userSelect = '';
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !tabsListRef.current) return;
    e.preventDefault();
    const x = e.pageX - tabsListRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Adjust scroll speed with * 1.5
    tabsListRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <TabsList 
      ref={tabsListRef}
      className="flex overflow-x-auto whitespace-nowrap mb-4 md:grid md:grid-cols-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] cursor-grab select-none"
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeaveOrUp}
      onMouseUp={handleMouseLeaveOrUp}
      onMouseMove={handleMouseMove}
    >
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
