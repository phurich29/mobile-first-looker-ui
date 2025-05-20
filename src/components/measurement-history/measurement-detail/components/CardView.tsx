
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { GroupedData } from "../types";
import { getFieldLabel, formatValue } from "../utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CardViewProps {
  groupedData: GroupedData;
  highlightKey: string;
}

export const CardView: React.FC<CardViewProps> = ({ groupedData, highlightKey }) => {
  const renderValueWithHighlight = (key: string, value: any) => {
    const formattedValue = formatValue(key, value);
    
    if (key === highlightKey) {
      return <span className="font-bold text-emerald-600">{formattedValue}</span>;
    }
    
    return formattedValue;
  };

  return (
    <div className="space-y-4 p-1 mb-4">
      {Object.entries(groupedData).map(([groupName, fields]) => (
        <Card key={groupName} className="overflow-hidden border-emerald-100 shadow-sm">
          <div className="bg-emerald-100 px-4 py-2 font-medium text-sm text-emerald-800">
            {groupName}
          </div>
          <CardContent className="p-0">
            <ScrollArea className="h-[200px]">
              <div className="p-4 pt-3 bg-white/60">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {fields.map(({ key, value }) => (
                    <div key={key} className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        {getFieldLabel(key)}
                      </span>
                      <span className="text-sm">
                        {renderValueWithHighlight(key, value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CardView;
