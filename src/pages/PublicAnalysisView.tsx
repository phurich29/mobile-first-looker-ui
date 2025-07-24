import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Share2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { getColumnTranslatedName } from "@/lib/columnTranslations";
import { getDataCategories } from "@/features/device-details/components/device-history/dataCategories";
import { formatCellValue } from "@/features/device-details/components/device-history/utils";
import { useTranslation } from "@/hooks/useTranslation";

const PublicAnalysisView = () => {
  const { t, language } = useTranslation();
  const { token } = useParams<{ token: string }>();

  const { data: sharedData, isLoading, error } = useQuery({
    queryKey: ['shared-analysis', token],
    queryFn: async () => {
      if (!token) throw new Error('Token is required');

      // Get shared link info
      const { data: sharedLink, error: linkError } = await supabase
        .from('shared_analysis_links')
        .select('*')
        .eq('share_token', token)
        .eq('is_active', true)
        .maybeSingle();

      if (linkError) throw linkError;
      if (!sharedLink) throw new Error('Shared link not found or inactive');

      // Check if expired
      if (sharedLink.expires_at && new Date(sharedLink.expires_at) < new Date()) {
        throw new Error('Shared link has expired');
      }

      // Get analysis data
      const { data: analysis, error: analysisError } = await supabase
        .from('rice_quality_analysis')
        .select('*')
        .eq('id', sharedLink.analysis_id)
        .single();

      if (analysisError) throw analysisError;

      // Get device display name
      let deviceDisplayName = null;
      if (analysis.device_code) {
        const { data: deviceSettings } = await supabase
          .from('device_settings')
          .select('display_name')
          .eq('device_code', analysis.device_code)
          .maybeSingle();
        deviceDisplayName = deviceSettings?.display_name || null;
      }

      return { sharedLink, analysis, deviceDisplayName };
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: (failureCount, error) => {
      if (error?.message?.includes('not found') || error?.message?.includes('expired')) {
        return false; // Don't retry for these errors
      }
      return failureCount < 2; // Retry up to 2 times for other errors
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
  });

  // Render categorized data with striped table style like HistoryDetailDialog
  const renderCategorizedData = (data: any) => {
    const DATA_CATEGORIES = getDataCategories(t);
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
                  {getColumnTranslatedName(field, language)}
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-gray-50 dark:from-gray-900 dark:to-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error || !sharedData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-gray-50 dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg mx-4">
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">ลิงก์ไม่ถูกต้อง</h2>
            <p className="text-muted-foreground mb-6">
              {error?.message === 'Shared link not found or inactive' 
                ? 'ลิงก์นี้ไม่มีอยู่หรือถูกปิดใช้งานแล้ว'
                : error?.message === 'Shared link has expired'
                ? 'ลิงก์นี้หมดอายุแล้ว'
                : 'เกิดข้อผิดพลาดในการโหลดข้อมูล'}
            </p>

          </div>
        </div>
      </div>
    );
  }

  const { sharedLink, analysis, deviceDisplayName } = sharedData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <div className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg animate-scale-in">
        {/* Header */}
        <div className="pb-2">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {sharedLink.title}
            </h1>
            <Badge variant="secondary" className="gap-2">
              <Share2 className="w-4 h-4" />
              แชร์สาธารณะ
            </Badge>
          </div>
          <Separator className="bg-gray-200 dark:bg-gray-700 mt-2" />
        </div>

        {/* Summary Header - เหมือน HistoryDetailDialog */}
        <div className="bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {deviceDisplayName && (
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                  Name: {deviceDisplayName}
                </div>
              )}
              <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                Device Code: {analysis.device_code}
              </div>
              {analysis.output && (
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                  จำนวนเมล็ด: {analysis.output.toLocaleString()}
                </div>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {analysis.thai_datetime ? (() => {
                  const dateObj = new Date(analysis.thai_datetime);
                  dateObj.setHours(dateObj.getHours() - 7);
                  return dateObj.toLocaleString('th-TH', {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit'
                  });
                })() : (() => {
                  const dateObj = new Date(analysis.created_at);
                  dateObj.setHours(dateObj.getHours() - 7);
                  return dateObj.toLocaleString('th-TH', {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit'
                  });
                })()}
              </div>
            </div>
            <Badge variant="outline" className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-xs text-gray-800 dark:text-gray-200">
              ID: {analysis.id}
            </Badge>
          </div>
        </div>

        {/* Categorized Data Display - เหมือน HistoryDetailDialog */}
        <div className="space-y-3 mb-6">
          {renderCategorizedData(analysis)}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">

            <div className="text-right text-xs text-gray-500 dark:text-gray-400">
              <div>แบ่งปันโดย: RiceFlow</div>
              <div className="flex items-center gap-1 mt-1">
                <Calendar className="w-3 h-3" />
                แบ่งปันเมื่อ: {format(new Date(sharedLink.created_at), 'dd/MM/yyyy HH:mm', { locale: th })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicAnalysisView;