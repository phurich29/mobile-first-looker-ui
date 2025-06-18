
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getColumnThaiName } from "@/lib/columnTranslations";
import { RiceQualityData } from './types';
import { DATA_CATEGORIES } from './dataCategories';
import { formatCellValue } from './utils';
import { supabase } from "@/integrations/supabase/client";

interface HistoryDetailDialogProps {
  selectedRow: RiceQualityData | null;
  onClose: () => void;
}

export const HistoryDetailDialog: React.FC<HistoryDetailDialogProps> = ({
  selectedRow,
  onClose
}) => {
  const [deviceDisplayName, setDeviceDisplayName] = useState<string | null>(null);

  // Fetch device display name when selectedRow changes
  useEffect(() => {
    const fetchDeviceDisplayName = async () => {
      if (!selectedRow?.device_code) {
        setDeviceDisplayName(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('device_settings')
          .select('display_name')
          .eq('device_code', selectedRow.device_code)
          .maybeSingle();

        if (error) {
          console.error('Error fetching device display name:', error);
          setDeviceDisplayName(null);
        } else {
          setDeviceDisplayName(data?.display_name || null);
        }
      } catch (error) {
        console.error('Error fetching device display name:', error);
        setDeviceDisplayName(null);
      }
    };

    fetchDeviceDisplayName();
  }, [selectedRow?.device_code]);

  // Render categorized data with striped table style
  const renderCategorizedData = (data: RiceQualityData) => {
    return Object.entries(DATA_CATEGORIES).map(([categoryKey, category]) => {
      const categoryData = category.fields.filter(field => data[field] !== null && data[field] !== undefined);
      if (categoryData.length === 0) return null;

      return (
        <div key={categoryKey} className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-slate-200 px-4 py-2 border-b border-gray-300">
            <h4 className="text-sm font-semibold text-slate-800">{category.title}</h4>
          </div>
          <div className="bg-white">
            {categoryData.map((field, index) => (
              <div key={field} className={`flex justify-between items-center py-3 px-4 border-b border-gray-100 last:border-b-0 ${
                index % 2 === 0 ? 'bg-slate-50' : 'bg-white'
              }`}>
                <span className="text-slate-700 font-medium text-sm">
                  {getColumnThaiName(field)}
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {formatCellValue(field, data[field])}
                  {field !== 'device_code' && field !== 'thai_datetime' && field !== 'paddy_rate' ? '%' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    });
  };

  return (
    <Dialog open={selectedRow !== null} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-gray-400 p-4">
        <DialogHeader className="pb-1">
          <DialogTitle className="text-lg font-semibold text-black text-center">
            Rice Quality Analysis Details
          </DialogTitle>
          <Separator className="bg-gray-300" />
        </DialogHeader>
        
        {selectedRow && (
          <>
            {/* Summary Header */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {deviceDisplayName && (
                    <div className="text-sm font-medium text-blue-900 mb-1">
                      Name : {deviceDisplayName}
                    </div>
                  )}
                  <div className="text-sm font-medium text-blue-900 mb-1">
                    Device Code: {selectedRow.device_code}
                  </div>
                  <div className="text-xs text-blue-700">
                    {selectedRow.thai_datetime ? new Date(selectedRow.thai_datetime).toLocaleString('th-TH', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : new Date(selectedRow.created_at).toLocaleString('th-TH', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <Badge variant="outline" className="bg-white border-blue-300 text-xs text-blue-800">
                  ID: {selectedRow.id}
                </Badge>
              </div>
            </div>

            {/* Categorized Data Display */}
            <div className="space-y-3">
              {renderCategorizedData(selectedRow)}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
