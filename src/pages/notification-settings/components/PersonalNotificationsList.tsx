import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, AlertTriangle, CheckCircle, Settings, Clock, TrendingUp, TrendingDown, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useDevicesQuery } from "@/features/equipment/hooks/useDevicesQuery";
import { getNotificationsEnabled } from "@/hooks/useAlertSound";
import NotificationSettingsDialog from "@/components/measurement-history/notification-settings/NotificationSettingsDialog";

interface PersonalNotification {
  id: string;
  device_code: string;
  rice_type_id: string;
  threshold_type: 'min' | 'max';
  value: number;
  notification_message: string;
  timestamp: string;
  notification_count: number;
  user_id: string;
  settings_snapshot?: {
    min_threshold?: number;
    max_threshold?: number;
    min_enabled?: boolean;
    max_enabled?: boolean;
    rice_type_name?: string;
  };
}

interface NotificationSetting {
  rice_type_id: string;
  device_code: string;
  enabled: boolean;
  min_enabled: boolean;
  max_enabled: boolean;
  min_threshold: number;
  max_threshold: number;
  rice_type_name?: string;
}

interface PersonalNotificationsListProps {
  notifications: PersonalNotification[];
  userSettings: NotificationSetting[];
  hasActiveSettings: boolean;
}

export const PersonalNotificationsList = ({ 
  notifications, 
  userSettings, 
  hasActiveSettings 
}: PersonalNotificationsListProps) => {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const enabledCount = (userSettings || []).filter(s => (s as any).enabled).length;
  const { user } = useAuth();
  const { devices } = useDevicesQuery();
  const deviceNameByCode = Object.fromEntries((devices || []).map((d: any) => [d.device_code, d.display_name]));
  
  // ตรวจสอบสถานะการแจ้งเตือนทั่วไป
  const globalNotificationsEnabled = getNotificationsEnabled();

  // แสดงสถานะระบบ
  const renderSystemStatus = () => (
    <Card className="border-l-4 border-l-primary/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {enabledCount > 0 ? (
            <>
              <div className="p-2 bg-emerald-100 rounded-full">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-emerald-700">
                  ระบบแจ้งเตือนส่วนตัวทำงานอยู่
                </h3>
                <p className="text-sm text-muted-foreground">
                  ทำงานอยู่ {enabledCount} จาก {userSettings.length} รายการ
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="p-2 bg-gray-100 rounded-full">
                <BellOff className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-700">
                  ระบบแจ้งเตือนส่วนตัวไม่ทำงาน
                </h3>
                <p className="text-sm text-muted-foreground">
                  ยังไม่มีการตั้งค่าแจ้งเตือน
                </p>
              </div>
              <Button 
                onClick={globalNotificationsEnabled ? () => navigate('/notifications') : undefined}
                size="sm"
                variant="outline"
                disabled={!globalNotificationsEnabled}
                className={!globalNotificationsEnabled ? "opacity-50 cursor-not-allowed" : ""}
              >
                ตั้งค่าแจ้งเตือน
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // แสดงการตั้งค่าปัจจุบัน
  const renderCurrentSettings = () => {
    if (!userSettings || userSettings.length === 0) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="w-5 h-5" />
            การตั้งค่าปัจจุบัน ({userSettings.length} รายการ, ทำงาน {enabledCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userSettings.map((setting, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-foreground">
                    {deviceNameByCode[setting.device_code] || setting.device_code}
                  </div>
                  <div className="text-xs text-muted-foreground">{setting.device_code}</div>
                  <div className="text-sm text-muted-foreground font-medium">{setting.rice_type_name || setting.rice_type_id}</div>
                  <div className="text-xs text-muted-foreground mt-1">ผู้ใช้: {user?.email || user?.id}</div>
                  <div className="flex gap-2 mt-2">
                    {setting.min_enabled && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="secondary"
                              className="text-xs ring-1 ring-foreground/10 shadow-sm hover:shadow transition-colors"
                            >
                              <TrendingDown className="w-3 h-3 mr-1" />
                              แจ้งเตือนเมื่อต่ำกว่า {setting.min_threshold}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            แจ้งเตือนเมื่อค่าน้อยกว่าค่าที่ตั้งไว้
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {setting.max_enabled && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="destructive"
                              className="text-xs ring-1 ring-destructive/20 shadow-sm hover:shadow transition-colors"
                            >
                              <TrendingUp className="w-3 h-3 mr-1" />
                              แจ้งเตือนเมื่อเกิน {setting.max_threshold}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            แจ้งเตือนเมื่อค่ามากกว่าค่าที่ตั้งไว้
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {setting.enabled ? (
                    <>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-emerald-600 font-medium">ทำงาน</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-sm text-muted-foreground font-medium">ปิดใช้งาน</span>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-2"
                    onClick={() => {
                      setSelectedDevice(setting.device_code);
                      setSelectedSymbol(setting.rice_type_id); // ใช้ rice_type_id เป็น symbol
                      setSelectedName(setting.rice_type_name || setting.rice_type_id); // ใช้ชื่อถ้ามี
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4 mr-1" /> แก้ไข
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // แสดงประวัติการแจ้งเตือนล่าสุด
  const renderRecentNotifications = () => {
    if (!notifications || notifications.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-5 h-5" />
              ประวัติการแจ้งเตือนล่าสุด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {hasActiveSettings 
                  ? "ยังไม่มีการแจ้งเตือน" 
                  : "ตั้งค่าแจ้งเตือนเพื่อรับการแจ้งเตือน"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="w-5 h-5" />
            ประวัติการแจ้งเตือนล่าสุด ({notifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.slice(0, 3).map((notification) => (
              <div key={`${notification.id}-${notification.notification_count}`} 
                   className="border rounded-lg overflow-hidden">
                <div className="p-3 bg-muted/30">
                  {/* Device info - consistent with settings list */}
                  <p className="text-sm text-foreground font-medium">
                    {deviceNameByCode[notification.device_code] || notification.device_code}
                  </p>
                  <p className="text-xs text-muted-foreground">{notification.device_code}</p>
                  <p className="text-sm text-muted-foreground font-medium">{notification.rice_type_id}</p>
                  <p className="text-xs text-muted-foreground mt-1">ผู้ใช้: {user?.email || user?.id}</p>

                  {/* Badge/time row */}
                  <div className="flex items-center justify-between mt-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={notification.threshold_type === 'max' ? 'destructive' : 'secondary'} 
                             className="text-xs">
                        {notification.threshold_type === 'max' ? (
                          <><TrendingUp className="w-3 h-3 mr-1" />เกินค่า</>
                        ) : (
                          <><TrendingDown className="w-3 h-3 mr-1" />ต่ำกว่า</>
                        )}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.timestamp), { 
                          addSuffix: true, 
                          locale: th 
                        })}
                      </span>
                    </div>
                    {notification.notification_count > 1 && (
                      <Badge variant="outline" className="text-xs">
                        {notification.notification_count} ครั้ง
                      </Badge>
                    )}
                  </div>

                  {/* Message */}
                  <p className="text-sm font-medium">{notification.notification_message}</p>
                </div>
                
                {/* การเปรียบเทียบค่า */}
                {notification.settings_snapshot && (
                  <div className="p-3 border-t">
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-2 bg-secondary/20 rounded">
                        <p className="text-xs text-muted-foreground">ค่าที่ตั้งไว้</p>
                        <p className="text-sm font-semibold">
                          {notification.threshold_type === 'max' 
                            ? notification.settings_snapshot.max_threshold?.toFixed(2)
                            : notification.settings_snapshot.min_threshold?.toFixed(2)
                          }
                        </p>
                      </div>
                      <div className="p-2 bg-destructive/10 border border-destructive/20 rounded">
                        <p className="text-xs text-muted-foreground">ค่าที่ได้รับ</p>
                        <p className="text-sm font-semibold text-destructive">
                          {notification.value.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {notifications.length > 3 && (
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm" onClick={() => navigate('/notification-history')}>
                ดูประวัติทั้งหมด ({notifications.length} รายการ)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {renderSystemStatus()}
      {renderCurrentSettings()}
      {renderRecentNotifications()}
      <NotificationSettingsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        deviceCode={selectedDevice || ""}
        symbol={selectedSymbol || ""}
        name={selectedName || selectedSymbol || ""}
      />
    </div>
  );
};