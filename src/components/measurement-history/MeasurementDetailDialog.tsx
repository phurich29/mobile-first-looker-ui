
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/components/database-table/utils";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface MeasurementDetail {
  id: number;
  device_code: string;
  created_at: string;
  thai_datetime: string;
  [key: string]: any;
}

interface MeasurementDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: MeasurementDetail | null;
  symbol: string;
  name: string;
}

// Helper function to group measurement fields
const groupFields = (data: MeasurementDetail | null): Record<string, { key: string; value: any }[]> => {
  if (!data) return {};
  
  const groups: Record<string, { key: string; value: any }[]> = {
    "ข้อมูลทั่วไป": [],
    "ข้าวเต็มเมล็ด": [],
    "องค์ประกอบ": [],
    "สิ่งเจือปน": [],
    "อื่นๆ": [],
  };
  
  // Map specific prefixes to groups
  const prefixToGroup: Record<string, string> = {
    "wg_": "ข้าวเต็มเมล็ด",
    "ing_": "องค์ประกอบ", 
    "imp_": "สิ่งเจือปน",
  };
  
  // Process each field
  Object.entries(data).forEach(([key, value]) => {
    // Skip internal fields and empty values
    if (key.startsWith("_") || value === null || value === undefined) return;
    
    // Add basic fields to general info
    if (["device_code", "thai_datetime", "created_at"].includes(key)) {
      groups["ข้อมูลทั่วไป"].push({ key, value });
      return;
    }
    
    // Check for known prefixes
    let assigned = false;
    for (const [prefix, group] of Object.entries(prefixToGroup)) {
      if (key.startsWith(prefix)) {
        groups[group].push({ key, value });
        assigned = true;
        break;
      }
    }
    
    // If not assigned to any group, add to "others"
    if (!assigned && !key.startsWith("_") && key !== "id" && key !== "sample_index" && key !== "output") {
      groups["อื่นๆ"].push({ key, value });
    }
  });
  
  // Filter out empty groups
  return Object.fromEntries(
    Object.entries(groups).filter(([_, items]) => items.length > 0)
  );
};

export function MeasurementDetailDialog({
  open,
  onOpenChange,
  data,
  symbol,
  name,
}: MeasurementDetailDialogProps) {
  const groupedData = groupFields(data);
  
  const formatValue = (key: string, value: any) => {
    if (key.includes('date') || key.includes('_at')) {
      return formatDate(value, key);
    }
    
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    
    return value?.toString() || "-";
  };
  
  const renderValueWithHighlight = (key: string, value: any, highlightKey: string) => {
    const formattedValue = formatValue(key, value);
    
    if (key === highlightKey) {
      return (
        <span className="font-bold text-emerald-600">{formattedValue}</span>
      );
    }
    
    return formattedValue;
  };
  
  const getFieldLabel = (key: string): string => {
    // Remove common prefixes
    let label = key
      .replace(/^wg_|^ing_|^imp_/, '')
      .replace(/_/g, ' ');
    
    // Capitalize first letter
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <span className="text-lg font-medium">รายละเอียดการวัด</span>
            {data && (
              <Badge variant="outline" className="ml-2">
                {data.device_code}
              </Badge>
            )}
          </DialogTitle>
          <div className="text-sm text-muted-foreground pt-1">
            {data?.thai_datetime && formatDate(data.thai_datetime, 'thai_datetime')}
          </div>
        </DialogHeader>
        
        {!data ? (
          <div className="text-center py-8 text-muted-foreground">ไม่พบข้อมูล</div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1">
              {/* Card View Section */}
              <div className="space-y-4 p-1 mb-4">
                {Object.entries(groupedData).map(([groupName, fields]) => (
                  <Card key={groupName} className="overflow-hidden">
                    <div className="bg-muted px-4 py-2 font-medium text-sm">
                      {groupName}
                    </div>
                    <CardContent className="p-4 pt-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {fields.map(({ key, value }) => (
                          <div key={key} className="flex flex-col">
                            <span className="text-xs text-muted-foreground">
                              {getFieldLabel(key)}
                            </span>
                            <span className="text-sm">
                              {renderValueWithHighlight(key, value, symbol)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Separator between Card and Table views */}
              <Separator className="my-4" />
              
              {/* Table View Section */}
              <div className="p-1">
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-medium">ฟิลด์</TableHead>
                        <TableHead className="font-medium">ค่า</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.values(groupedData).flat().map(({ key, value }, index) => (
                        <TableRow key={key}>
                          <TableCell className="py-1.5 text-muted-foreground">
                            {getFieldLabel(key)}
                          </TableCell>
                          <TableCell className="py-1.5">
                            {renderValueWithHighlight(key, value, symbol)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </ScrollArea>
            
            <div className="mt-4 px-1">
              <div className="bg-muted-foreground/10 p-3 rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium">{name}</span>
                    <div className="text-lg font-bold text-emerald-600">
                      {data[symbol] ? Number(data[symbol]).toFixed(2) : '-'}
                    </div>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                    ค่าที่ติดตาม
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter className="sm:justify-between mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ปิด
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MeasurementDetailDialog;
