
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getColumnThaiName } from "@/lib/columnTranslations";
import { RiceQualityData } from './types';
import { DATA_CATEGORIES } from './dataCategories';
import { formatCellValue } from './utils';

interface HistoryDetailDialogProps {
  selectedRow: RiceQualityData | null;
  onClose: () => void;
}

export const HistoryDetailDialog: React.FC<HistoryDetailDialogProps> = ({ 
  selectedRow, 
  onClose 
}) => {
  // Render categorized data in minimal style
  const renderCategorizedData = (data: RiceQualityData) => {
    return Object.entries(DATA_CATEGORIES).map(([categoryKey, category]) => {
      const categoryData = category.fields.filter(field => 
        data[field] !== null && data[field] !== undefined
      );

      if (categoryData.length === 0) return null;

      return (
        <div key={categoryKey} className="border border-gray-200 rounded-md mb-2">
          <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">{category.title}</h4>
              <Badge variant="outline" className="text-xs bg-white border-gray-300">
                {categoryData.length}
              </Badge>
            </div>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              {categoryData.map((field) => (
                <div key={field} className="flex justify-between items-center py-1 px-2 hover:bg-gray-50 rounded text-xs">
                  <span className="text-gray-600 truncate mr-2">
                    {getColumnThaiName(field)}
                  </span>
                  <span className="font-medium text-gray-900 flex-shrink-0">
                    {formatCellValue(field, data[field])}
                    {field !== 'device_code' && field !== 'thai_datetime' && field !== 'paddy_rate' ? '%' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <Dialog open={selectedRow !== null} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white border border-gray-300">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-semibold text-gray-900 text-center">
            รายละเอียดข้อมูลการวิเคราะห์คุณภาพข้าว
          </DialogTitle>
          <Separator className="bg-gray-200" />
        </DialogHeader>
        
        {selectedRow && (
          <>
            {/* Summary Header - Minimal Style */}
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    รหัสอุปกรณ์: {selectedRow.device_code}
                  </div>
                  <div className="text-xs text-gray-600">
                    {selectedRow.thai_datetime 
                      ? new Date(selectedRow.thai_datetime).toLocaleString('th-TH', { 
                          year: 'numeric', month: '2-digit', day: '2-digit', 
                          hour: '2-digit', minute: '2-digit'
                        }) 
                      : new Date(selectedRow.created_at).toLocaleString('th-TH', { 
                          year: 'numeric', month: '2-digit', day: '2-digit', 
                          hour: '2-digit', minute: '2-digit'
                        })
                    }
                  </div>
                </div>
                <Badge variant="outline" className="bg-white border-gray-300 text-xs">
                  ID: {selectedRow.id}
                </Badge>
              </div>
            </div>

            {/* Categorized Data Display - Compact */}
            <div className="space-y-0">
              {renderCategorizedData(selectedRow)}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
