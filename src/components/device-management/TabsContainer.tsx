
import React, { useRef, useEffect } from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Square, Wheat, Blend, Circle } from "lucide-react";
import { useDragScroll } from "@/utils/dragUtils";

type TabsContainerProps = {
  handleTabChange?: (value: string) => void;
};

export const TabsContainer: React.FC<TabsContainerProps> = ({ handleTabChange }) => {
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [
    { isDragging }, 
    { handleMouseDown, handleMouseMove, handleTouchStart, handleTouchMove, handleDragEnd }
  ] = useDragScroll(tabsContainerRef);

  // Add event listeners for mouse/touch events
  useEffect(() => {
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchend', handleDragEnd);
    
    return () => {
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [handleDragEnd]);
  
  return (
    <div className="relative w-full overflow-hidden">
      <div 
        ref={tabsContainerRef}
        className="w-full overflow-x-auto pb-3 no-scrollbar"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleDragEnd}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <TabsList 
          className="flex min-w-max h-12 bg-white border-y border-gray-200 p-1 space-x-1 overflow-visible shadow-md"
          style={{ paddingLeft: '0.25rem', paddingRight: '0.25rem' }}
        >
          <TabsTrigger 
            value="all" 
            className="whitespace-nowrap min-w-[100px] flex items-center justify-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-md px-4"
            onClick={() => handleTabChange && handleTabChange('all')}
          >
            <Square className="h-4 w-4 flex-shrink-0" />
            <span>ทั้งหมด</span>
          </TabsTrigger>
          <TabsTrigger 
            value="wholegrain" 
            className="whitespace-nowrap min-w-[160px] flex items-center justify-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-md px-4"
            onClick={() => handleTabChange && handleTabChange('wholegrain')}
          >
            <Wheat className="h-4 w-4 flex-shrink-0" />
            <span>พื้นข้าวเต็มเมล็ด (%)</span>
          </TabsTrigger>
          <TabsTrigger 
            value="ingredients" 
            className="whitespace-nowrap min-w-[130px] flex items-center justify-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-md px-4"
            onClick={() => handleTabChange && handleTabChange('ingredients')}
          >
            <Blend className="h-4 w-4 flex-shrink-0" />
            <span>ส่วนผสม (%)</span>
          </TabsTrigger>
          <TabsTrigger 
            value="impurities" 
            className="whitespace-nowrap min-w-[130px] flex items-center justify-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-md px-4"
            onClick={() => handleTabChange && handleTabChange('impurities')}
          >
            <Circle className="h-4 w-4 flex-shrink-0" />
            <span>สิ่งเจือปน (%)</span>
          </TabsTrigger>
        </TabsList>
      </div>
    </div>
  );
};

export default TabsContainer;
