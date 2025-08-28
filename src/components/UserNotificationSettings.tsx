import React from "react";
import { useAuth } from "@/components/AuthProvider";
import { useNotificationSettings } from "@/pages/notification-settings/hooks/useNotificationSettings";
import { Settings, Bell, BellRing, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";

export const UserNotificationSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { settings, loading, error } = useNotificationSettings();

  // Render skeleton loaders when loading
  const renderSkeletons = () => (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const formatThreshold = (setting: any) => {
    if (setting.min_enabled && setting.max_enabled) {
      return `${setting.min_threshold} - ${setting.max_threshold}`;
    } else if (setting.min_enabled) {
      return `ต่ำกว่า ${setting.min_threshold}`;
    } else if (setting.max_enabled) {
      return `สูงกว่า ${setting.max_threshold}`;
    }
    return 'ไม่ได้กำหนด';
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          กรุณาเข้าสู่ระบบ
        </h3>
        <p className="text-gray-500">
          เพื่อดูการตั้งค่าแจ้งเตือนของคุณ
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">การตั้งค่าแจ้งเตือนของคุณ</h3>
          <Skeleton className="h-9 w-32" />
        </div>
        {renderSkeletons()}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            เกิดข้อผิดพลาด
          </h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            ลองใหม่อีกครั้ง
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            การตั้งค่าแจ้งเตือนของคุณ
          </h3>
          <p className="text-sm text-gray-600">
            แสดงการตั้งค่าแจ้งเตือนที่คุณเปิดใช้งานไว้ ({settings.length} รายการ)
          </p>
        </div>
        <Button
          onClick={() => navigate('/notification-settings')}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          จัดการการตั้งค่า
        </Button>
      </div>

      {settings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ยังไม่มีการตั้งค่าแจ้งเตือน
            </h3>
            <p className="text-gray-500 mb-4">
              คุณยังไม่ได้ตั้งค่าแจ้งเตือนสำหรับอุปกรณ์ใดๆ
            </p>
            <Button
              onClick={() => navigate('/notification-settings')}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              ตั้งค่าแจ้งเตือนตอนนี้
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {settings.map((setting) => (
            <Card 
              key={setting.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate('/notification-settings')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {setting.enabled ? (
                        <BellRing className="h-8 w-8 text-emerald-600" />
                      ) : (
                        <Bell className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {setting.device_name || setting.device_code}
                      </div>
                      <div className="text-sm text-gray-600">
                        {setting.rice_type_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        เกณฑ์: {formatThreshold(setting)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge 
                      variant={setting.enabled ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {setting.enabled ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                    </Badge>
                    <div className="text-xs text-gray-500">
                      รหัส: {setting.device_code}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};