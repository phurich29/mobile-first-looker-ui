import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNotificationSettings } from "./notification-settings/hooks/useNotificationSettings";
import { NotificationSettingCard } from "./notification-settings/components/NotificationSettingCard";
import { useTranslation } from "@/hooks/useTranslation";
import { ArrowLeft, Settings, Bell, BellOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";

export const NotificationSettingsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings, loading, error, fetchSettings } = useNotificationSettings();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSettings();
    setIsRefreshing(false);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="max-w-md mx-auto pt-20">
          <Card className="text-center">
            <CardContent className="pt-6">
              <BellOff className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">กรุณาเข้าสู่ระบบ</h2>
              <p className="text-muted-foreground">
                เข้าสู่ระบบเพื่อดูการตั้งค่าการแจ้งเตือน
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {t('mainMenu', 'notificationSettings')}
                </h1>
                <p className="text-sm text-muted-foreground">
                  จัดการการแจ้งเตือนของคุณ
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="shrink-0"
            >
              <Settings className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              รีเฟรช
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4">
        {error ? (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6 text-center">
              <BellOff className="w-12 h-12 mx-auto mb-4 text-destructive" />
              <h3 className="text-lg font-semibold text-destructive mb-2">
                เกิดข้อผิดพลาดในการโหลดการตั้งค่า
              </h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={handleRefresh} variant="outline">
                ลองใหม่
              </Button>
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                    <div className="w-16 h-9 bg-muted rounded-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : settings.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                ยังไม่มีการตั้งค่าการแจ้งเตือน
              </h3>
              <p className="text-muted-foreground">
                สร้างการตั้งค่าการแจ้งเตือนแรกของคุณ
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  การแจ้งเตือนที่เปิดใช้งาน
                </CardTitle>
                <CardDescription>
                  พบการตั้งค่าการแจ้งเตือน {settings.length} รายการ
                </CardDescription>
              </CardHeader>
            </Card>

            {settings.map((setting) => (
              <NotificationSettingCard
                key={setting.id}
                setting={setting}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSettingsPage;