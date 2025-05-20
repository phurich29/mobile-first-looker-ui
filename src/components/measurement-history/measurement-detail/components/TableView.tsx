
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
