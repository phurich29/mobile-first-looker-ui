import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { getColumnThaiName } from "@/lib/columnTranslations";

const PublicAnalysisView = () => {
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

      return { sharedLink, analysis };
    },
    enabled: !!token,
  });

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
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">ลิงก์ไม่ถูกต้อง</h2>
            <p className="text-muted-foreground mb-6">
              {error?.message === 'Shared link not found or inactive' 
                ? 'ลิงก์นี้ไม่มีอยู่หรือถูกปิดใช้งานแล้ว'
                : error?.message === 'Shared link has expired'
                ? 'ลิงก์นี้หมดอายุแล้ว'
                : 'เกิดข้อผิดพลาดในการโหลดข้อมูล'}
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              กลับสู่หน้าหลัก
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { sharedLink, analysis } = sharedData;

  const measurementFields = [
    'whiteness', 'head_rice', 'whole_kernels', 'imperfection_rate',
    'small_brokens', 'small_brokens_c1', 'total_brokens', 'paddy_rate',
    'yellow_rice_rate', 'sticky_rice_rate', 'red_line_rate', 'honey_rice',
    'black_kernel', 'partly_black', 'partly_black_peck', 'short_grain',
    'slender_kernel', 'parboiled_white_rice', 'parboiled_red_line'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับสู่หน้าหลัก
          </Button>
          <Badge variant="secondary" className="gap-2">
            <Share2 className="w-4 h-4" />
            ข้อมูลแบบสาธารณะ
          </Badge>
        </div>

        {/* Title Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{sharedLink.title}</CardTitle>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                วิเคราะห์เมื่อ: {format(new Date(analysis.created_at || ''), 'dd/MM/yyyy HH:mm', { locale: th })}
              </span>
            </div>
            {analysis.device_code && (
              <Badge variant="outline">อุปกรณ์: {analysis.device_code}</Badge>
            )}
          </CardHeader>
        </Card>

        {/* Analysis Data */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {measurementFields.map((field) => {
            const value = analysis[field as keyof typeof analysis];
            if (value === null || value === undefined) return null;

            return (
              <Card key={field}>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">
                    {getColumnThaiName(field)}
                  </div>
                  <div className="text-2xl font-bold">
                    {Number(value).toFixed(2)}%
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-muted-foreground">
          <p>ข้อมูลนี้ถูกแบบ่งปันผ่านระบบ RiceFlow</p>
          <p className="text-sm mt-2">
            แบ่งปันเมื่อ: {format(new Date(sharedLink.created_at), 'dd/MM/yyyy HH:mm', { locale: th })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicAnalysisView;