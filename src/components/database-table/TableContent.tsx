
import React, { useRef, useEffect } from "react";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TableContentProps } from "./types";
import { formatDate } from "./utils";

export function TableContent({
  data,
  loading,
  error,
  columnKeys,
  fetchData
}: TableContentProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
  // Drag scrolling with improved touch support
  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    if (!tableContainer) return;
    
    let isDown = false;
    let startX: number;
    let startScrollLeft: number;
    
    const onPointerDown = (e: PointerEvent) => {
      isDown = true;
      tableContainer.style.cursor = 'grabbing';
      tableContainer.style.userSelect = 'none';
      
      // Record starting positions
      startX = e.clientX;
      startScrollLeft = tableContainer.scrollLeft;
      
      // Capture pointer to get events outside the element
      tableContainer.setPointerCapture(e.pointerId);
    };
    
    const onPointerUp = () => {
      isDown = false;
      tableContainer.style.cursor = 'grab';
      tableContainer.style.removeProperty('user-select');
    };
    
    const onPointerLeave = () => {
      isDown = false;
      tableContainer.style.cursor = 'grab';
      tableContainer.style.removeProperty('user-select');
    };
    
    const onPointerMove = (e: PointerEvent) => {
      if (!isDown) return;
      e.preventDefault();
      
      // Calculate distance moved and new scroll position
      const x = e.clientX;
      const dist = (x - startX) * 1.5; // Adjust speed multiplier as needed
      tableContainer.scrollLeft = startScrollLeft - dist;
    };
    
    // Add all event listeners
    tableContainer.addEventListener('pointerdown', onPointerDown);
    tableContainer.addEventListener('pointerup', onPointerUp);
    tableContainer.addEventListener('pointerleave', onPointerLeave);
    tableContainer.addEventListener('pointermove', onPointerMove);
    
    // Set initial cursor style
    tableContainer.style.cursor = 'grab';
    
    // Cleanup
    return () => {
      tableContainer.removeEventListener('pointerdown', onPointerDown);
      tableContainer.removeEventListener('pointerup', onPointerUp);
      tableContainer.removeEventListener('pointerleave', onPointerLeave);
      tableContainer.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  if (loading) {
    return <div className="text-center py-8">กำลังโหลดข้อมูล...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
        <Button onClick={fetchData} variant="outline" className="mt-4">
          ลองอีกครั้ง
        </Button>
      </div>
    );
  }

  return (
    <div 
      ref={tableContainerRef}
      className="overflow-x-auto" 
      style={{ 
        WebkitOverflowScrolling: 'touch',
        position: 'relative'
      }}
    >
      <ResponsiveTable>
        <TableHeader>
          <TableRow>
            {columnKeys.map((key) => (
              <TableHead key={key} className="whitespace-nowrap">{key}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columnKeys.length} className="text-center py-4">
                ไม่พบข้อมูล
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow key={row.id}>
                {columnKeys.map((key) => (
                  <TableCell key={`${row.id}-${key}`} className="whitespace-nowrap">
                    {key.includes('date') || key.includes('_at') 
                      ? formatDate(row[key], key) 
                      : row[key]?.toString() || "-"}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </ResponsiveTable>
    </div>
  );
}
