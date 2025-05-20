
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { GroupedData } from "../types";
import { getFieldLabel, formatValue } from "../utils";

interface TableViewProps {
  groupedData: GroupedData;
  highlightKey: string;
}

export const TableView: React.FC<TableViewProps> = ({ groupedData, highlightKey }) => {
  const renderValueWithHighlight = (key: string, value: any) => {
    const formattedValue = formatValue(key, value);
    
    if (key === highlightKey) {
      return <span className="font-bold text-emerald-600">{formattedValue}</span>;
    }
    
    return formattedValue;
  };

  return (
    <div className="p-1">
      <div className="border border-emerald-100 rounded-md overflow-hidden">
        <Table>
          <TableHeader className="bg-emerald-50">
            <TableRow>
              <TableHead className="font-medium text-emerald-800">ฟิลด์</TableHead>
              <TableHead className="font-medium text-emerald-800">ค่า</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.values(groupedData).flat().map(({ key, value }, index) => (
              <TableRow 
                key={key} 
                className={index % 2 === 0 ? 'bg-white' : 'bg-emerald-50/30'} 
              >
                <TableCell className="py-1.5 text-muted-foreground">
                  {getFieldLabel(key)}
                </TableCell>
                <TableCell className="py-1.5">
                  {renderValueWithHighlight(key, value)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TableView;
