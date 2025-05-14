import * as React from "react";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface SlideTabsProps {
  className?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

const SlideTabs = ({
  className,
  defaultValue = "all",
  onChange,
}: SlideTabsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [value, setValue] = useState(defaultValue);

  // จัดการการเลื่อนด้วยการลาก (drag)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartX(
      e.touches[0].pageX - (scrollRef.current?.offsetLeft || 0)
    );
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 1.5; // เพิ่มความเร็วในการเลื่อน
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 1.5;
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleValueChange = (val: string) => {
    setValue(val);
    if (onChange) {
      onChange(val);
    }
  };

  useEffect(() => {
    // เพิ่ม event listeners สำหรับการจัดการ drag ที่นอกเหนือจาก component
    document.addEventListener("mouseup", handleDragEnd);
    document.addEventListener("touchend", handleDragEnd);
    
    return () => {
      document.removeEventListener("mouseup", handleDragEnd);
      document.removeEventListener("touchend", handleDragEnd);
    };
  }, []);

  return (
    <Tabs
      value={value}
      onValueChange={handleValueChange}
      className={cn("w-full", className)}
    >
      <div 
        className="overflow-hidden"
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleDragEnd}
      >
        <TabsList 
          className="flex w-full h-12 bg-white border border-gray-200 rounded-lg p-1 space-x-1 overflow-x-auto scrollbar-hide"
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          <TabsTrigger 
            value="all"
            className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-md"
          >
            ทั้งหมด
          </TabsTrigger>
          <TabsTrigger 
            value="rice"
            className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-md"
          >
            พื้นข้าวเต้มเมล็ด (%)
          </TabsTrigger>
          <TabsTrigger 
            value="ingredients"
            className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-md"
          >
            ส่วนผสม (%)
          </TabsTrigger>
          <TabsTrigger 
            value="contaminants"
            className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-md"
          >
            สิ่งเจือปน (%)
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="all" className="mt-4">
        {/* เนื้อหาสำหรับแท็บ "ทั้งหมด" */}
        <div className="p-4 bg-white rounded-lg">
          <h3 className="text-lg font-medium">ข้อมูลทั้งหมด</h3>
          {/* ใส่เนื้อหาที่ต้องการแสดงในแท็บนี้ */}
        </div>
      </TabsContent>

      <TabsContent value="rice" className="mt-4">
        {/* เนื้อหาสำหรับแท็บ "พื้นข้าวเต้มเมล็ด (%)" */}
        <div className="p-4 bg-white rounded-lg">
          <h3 className="text-lg font-medium">พื้นข้าวเต้มเมล็ด (%)</h3>
          {/* ใส่เนื้อหาที่ต้องการแสดงในแท็บนี้ */}
        </div>
      </TabsContent>

      <TabsContent value="ingredients" className="mt-4">
        {/* เนื้อหาสำหรับแท็บ "ส่วนผสม (%)" */}
        <div className="p-4 bg-white rounded-lg">
          <h3 className="text-lg font-medium">ส่วนผสม (%)</h3>
          {/* ใส่เนื้อหาที่ต้องการแสดงในแท็บนี้ */}
        </div>
      </TabsContent>

      <TabsContent value="contaminants" className="mt-4">
        {/* เนื้อหาสำหรับแท็บ "สิ่งเจือปน (%)" */}
        <div className="p-4 bg-white rounded-lg">
          <h3 className="text-lg font-medium">สิ่งเจือปน (%)</h3>
          {/* ใส่เนื้อหาที่ต้องการแสดงในแท็บนี้ */}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default SlideTabs;
