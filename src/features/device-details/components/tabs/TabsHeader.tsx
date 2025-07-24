
import React, { useRef, useState, MouseEvent } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/hooks/useTranslation";

interface TabsHeaderProps {
  activeTab: string;
}

export const TabsHeader: React.FC<TabsHeaderProps> = ({ activeTab }) => {
  const { t } = useTranslation();
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
      className="flex overflow-x-auto whitespace-nowrap mb-4 md:grid md:grid-cols-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] cursor-grab select-none gap-1"
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeaveOrUp}
      onMouseUp={handleMouseLeaveOrUp}
      onMouseMove={handleMouseMove}
    >
      <TabsTrigger 
        value="wholegrain" 
        className="text-xs md:text-sm flex-shrink-0 min-w-max px-4 py-2"
        data-active={activeTab === "wholegrain"}
      >
        {t('dataCategories', 'wholegrain')}
      </TabsTrigger>
      <TabsTrigger 
        value="ingredients" 
        className="text-xs md:text-sm flex-shrink-0 min-w-max px-4 py-2"
        data-active={activeTab === "ingredients"}
      >
        {t('dataCategories', 'ingredients')}
      </TabsTrigger>
      <TabsTrigger 
        value="impurities" 
        className="text-xs md:text-sm flex-shrink-0 min-w-max px-4 py-2"
        data-active={activeTab === "impurities"}
      >
        {t('dataCategories', 'impurities')}
      </TabsTrigger>
      <TabsTrigger 
        value="all" 
        className="text-xs md:text-sm flex-shrink-0 min-w-max px-4 py-2"
        data-active={activeTab === "all"}
      >
        {t('dataCategories', 'allData')}
      </TabsTrigger>
    </TabsList>
  );
};
