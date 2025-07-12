
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Share } from "lucide-react";
import { getColumnThaiName } from "@/lib/columnTranslations";
import { RiceQualityData } from './types';
import { DATA_CATEGORIES } from './dataCategories';
import { formatCellValue } from './utils';
import { supabase } from "@/integrations/supabase/client";
import { ShareLinkModal } from "@/components/shared-links/ShareLinkModal";
import { DeviceCalculationSummary } from "../DeviceCalculationSummary";

interface HistoryDetailDialogProps {
  selectedRow: RiceQualityData | null;
  onClose: () => void;
}

export const HistoryDetailDialog: React.FC<HistoryDetailDialogProps> = ({
  selectedRow,
  onClose
}) => {
  const [deviceDisplayName, setDeviceDisplayName] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

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
        <div key={categoryKey} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="bg-gray-100 dark:bg-gray-700/50 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{category.title}</h4>
          </div>
          <div className="bg-white dark:bg-gray-800">
            {categoryData.map((field, index) => (
              <div key={field} className={`flex justify-between items-center py-3 px-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-700/60'
              }`}>
                <span className="text-gray-600 dark:text-gray-300 font-medium text-sm">
                  {getColumnThaiName(field)}
                </span>
                <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
        <DialogHeader className="pb-2 pt-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Rice Quality Analysis Details
            </DialogTitle>
            {selectedRow && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowShareModal(true)}
                className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white"
              >
                <Share className="h-4 w-4 mr-2" />
                สร้าง Link สำหรับแชร์
              </Button>
            )}
          </div>
          <Separator className="bg-gray-200 dark:bg-gray-700" />
        </DialogHeader>
        
        {selectedRow && (
          <>
            {/* Summary Header */}
            <div className="bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {deviceDisplayName && (
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                      Name : {deviceDisplayName}
                    </div>
                  )}
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                    Device Code: {selectedRow.device_code}
                  </div>
                  {selectedRow.output && (
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                      จำนวนเมล็ด: {selectedRow.output.toLocaleString()}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedRow.thai_datetime ? (() => {
                      const dateObj = new Date(selectedRow.thai_datetime);
                      dateObj.setHours(dateObj.getHours() - 7);
                      return dateObj.toLocaleString('th-TH', {
                        year: 'numeric', month: '2-digit', day: '2-digit',
                        hour: '2-digit', minute: '2-digit'
                      });
                    })() : (() => {
                      const dateObj = new Date(selectedRow.created_at);
                      dateObj.setHours(dateObj.getHours() - 7);
                      return dateObj.toLocaleString('th-TH', {
                        year: 'numeric', month: '2-digit', day: '2-digit',
                        hour: '2-digit', minute: '2-digit'
                      });
                    })()}
                  </div>
                </div>
                <Badge variant="outline" className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-xs text-gray-800 dark:text-gray-200">
                  ID: {selectedRow.id}
                </Badge>
              </div>
            </div>

            {/* Categorized Data Display */}
            <div className="space-y-3">
              {renderCategorizedData(selectedRow)}
            </div>

            {/* Calculation Summary Box */}
            <div className="mt-4">
              <DeviceCalculationSummary 
                allData={[selectedRow]}
                isLoading={false}
              />
            </div>
          </>
        )}

        {selectedRow && (
          <ShareLinkModal
            open={showShareModal}
            onOpenChange={setShowShareModal}
            analysisId={selectedRow.id}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
