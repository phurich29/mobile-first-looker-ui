import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { calculateYieldInHaab } from "@/utils/calculations";
import { ShareLinkModal } from "@/components/shared-links/ShareLinkModal";

interface DeviceCalculationSummaryProps {
  allData: any[] | null;
  isLoading: boolean;
}

export const DeviceCalculationSummary: React.FC<DeviceCalculationSummaryProps> = ({
  allData,
  isLoading
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Get the latest data entry
  const latestData = allData && allData.length > 0 ? allData[0] : null;
  
  // Calculate values
  const wholeKernels = latestData?.whole_kernels ?? 0;
  const headRice = latestData?.head_rice ?? 0;
  const totalRicePercentage = wholeKernels + headRice;
  const yieldInHaab = latestData ? calculateYieldInHaab(latestData) : 0;

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">สรุปผลการคำนวณ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!latestData) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">สรุปผลการคำนวณ</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">ไม่มีข้อมูลสำหรับการคำนวณ</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">
            สรุปผลการคำนวณ
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowShareModal(true)}
            className="gap-2 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-900/20"
          >
            <Share2 className="h-4 w-4" />
            แชร์ & QR Code
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Total Rice Percentage */}
          <div className="bg-white/70 dark:bg-gray-800/40 p-4 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
            <h3 className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">
              %ข้าวต้น + %เต็มเมล็ด
            </h3>
            <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
              {totalRicePercentage.toFixed(2)}%
            </p>
            <div className="text-xs text-muted-foreground mt-1">
              <span>ข้าวต้น: {headRice.toFixed(2)}% | </span>
              <span>เต็มเมล็ด: {wholeKernels.toFixed(2)}%</span>
            </div>
          </div>

          {/* Yield in Haab */}
          <div className="bg-white/70 dark:bg-gray-800/40 p-4 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
            <h3 className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">
              ผลผลิต
            </h3>
            <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
              {yieldInHaab.toFixed(2)} หาบ
            </p>
            <div className="text-xs text-muted-foreground mt-1">
              จากข้าวเปลือก 1 ตัน
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* Share Link Modal */}
      {latestData && (
        <ShareLinkModal
          open={showShareModal}
          onOpenChange={setShowShareModal}
          analysisId={latestData.id}
        />
      )}
    </Card>
  );
};