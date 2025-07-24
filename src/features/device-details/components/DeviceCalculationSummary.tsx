import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateYieldInHaab } from "@/utils/calculations";
import { useTranslation } from "@/hooks/useTranslation";

interface DeviceCalculationSummaryProps {
  allData: any[] | null;
  isLoading: boolean;
}

export const DeviceCalculationSummary: React.FC<DeviceCalculationSummaryProps> = ({
  allData,
  isLoading
}) => {
  const { t } = useTranslation();
  
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
          <CardTitle className="text-lg font-semibold">{t('dataCategories', 'calculationSummary')}</CardTitle>
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
          <CardTitle className="text-lg font-semibold">{t('dataCategories', 'calculationSummary')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('dataCategories', 'noData')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">
          {t('dataCategories', 'calculationSummary')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Total Rice Percentage */}
          <div className="bg-white/70 dark:bg-gray-800/40 p-4 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
            <h3 className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">
              {t('dataCategories', 'totalRicePercentage')}
            </h3>
            <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
              {totalRicePercentage.toFixed(2)}%
            </p>
            <div className="text-xs text-muted-foreground mt-1">
              <span>{t('dataCategories', 'headRice')}: {headRice.toFixed(2)}% | </span>
              <span>{t('dataCategories', 'wholeKernels')}: {wholeKernels.toFixed(2)}%</span>
            </div>
          </div>

          {/* Yield in Haab */}
          <div className="bg-white/70 dark:bg-gray-800/40 p-4 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
            <h3 className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">
              {t('dataCategories', 'yield')}
            </h3>
            <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
              {yieldInHaab.toFixed(2)} {t('dataCategories', 'haab')}
            </p>
            <div className="text-xs text-muted-foreground mt-1">
              {t('dataCategories', 'fromOneTonPaddy')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};