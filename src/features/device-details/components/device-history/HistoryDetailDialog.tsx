
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
  // Render categorized data in the dialog
  const renderCategorizedData = (data: RiceQualityData) => {
    return Object.entries(DATA_CATEGORIES).map(([categoryKey, category]) => {
      const categoryData = category.fields.filter(field => 
        data[field] !== null && data[field] !== undefined
      );

      if (categoryData.length === 0) return null;

      return (
        <Card key={categoryKey} className={`${category.color} shadow-sm`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span>{category.icon}</span>
              {category.title}
              <Badge variant="secondary" className="ml-auto">
                {categoryData.length} รายการ
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categoryData.map((field) => (
                <div key={field} className="flex justify-between items-center p-2 bg-white/60 rounded-md">
                  <span className="text-sm text-gray-600 font-medium">
                    {getColumnThaiName(field)}:
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {formatCellValue(field, data[field])}
                    {field !== 'device_code' && field !== 'thai_datetime' && field !== 'paddy_rate' ? '%' : ''}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    });
  };

  return (
    <Dialog open={selectedRow !== null} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center text-emerald-700">
            📊 รายละเอียดข้อมูลการวิเคราะห์คุณภาพข้าว
          </DialogTitle>
          <Separator className="my-2" />
        </DialogHeader>
        {selectedRow && (
          <div className="space-y-4 mt-4">
            {/* Summary Header */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-emerald-800">รหัสอุปกรณ์: {selectedRow.device_code}</h4>
                  <p className="text-sm text-emerald-600">
                    วันที่-เวลา: {selectedRow.thai_datetime 
                      ? new Date(selectedRow.thai_datetime).toLocaleString('th-TH', { 
                          year: 'numeric', month: '2-digit', day: '2-digit', 
                          hour: '2-digit', minute: '2-digit', second: '2-digit' 
                        }) 
                      : new Date(selectedRow.created_at).toLocaleString('th-TH', { 
                          year: 'numeric', month: '2-digit', day: '2-digit', 
                          hour: '2-digit', minute: '2-digit', second: '2-digit' 
                        })
                    }
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-emerald-700 border-emerald-300">
                    ID: {selectedRow.id}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Categorized Data Display */}
            <div className="grid gap-4">
              {renderCategorizedData(selectedRow)}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
