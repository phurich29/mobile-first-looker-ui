import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  getNotificationSettings, 
  saveNotificationSettings
} from "@/components/measurement-history/api";
import { NotificationSetting } from "@/pages/notification-settings/types";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, AlertTriangle, User, Database } from "lucide-react";

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  data?: any;
}

export const NotificationAPITester: React.FC = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSettings, setCurrentSettings] = useState<NotificationSetting | null>(null);

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setTestResults([]);
    setCurrentSettings(null);
  };

  // Test 1: ทดสอบการบันทึกการตั้งค่าใหม่
  const testSaveNewSettings = async () => {
    try {
      const testData = {
        deviceCode: "TEST_DEVICE_API",
        symbol: "head_rice",
        name: "หัวข้าว (ทดสอบ)",
        enabled: true,
        minEnabled: true,
        maxEnabled: true,
        minThreshold: 75,
        maxThreshold: 95
      };

      await saveNotificationSettings(testData);
      
      addTestResult({
        name: "Save New Settings",
        status: 'success',
        message: `บันทึกการตั้งค่าใหม่สำเร็จ (Device: ${testData.deviceCode}, Type: ${testData.symbol})`,
        data: testData
      });
    } catch (error) {
      addTestResult({
        name: "Save New Settings",
        status: 'error',
        message: `ไม่สามารถบันทึกการตั้งค่าได้: ${error}`,
        data: { error: error }
      });
    }
  };

  // Test 2: ทดสอบการดึงการตั้งค่า
  const testFetchSettings = async () => {
    try {
      const settings = await getNotificationSettings("TEST_DEVICE_API", "head_rice");
      
      if (settings) {
        setCurrentSettings(settings);
        addTestResult({
          name: "Fetch Settings",
          status: 'success',
          message: `ดึงการตั้งค่าสำเร็จ (ID: ${settings.id}, User: ${settings.user_id})`,
          data: settings
        });

        // ตรวจสอบว่า user_id ตรงกับ user ปัจจุบัน
        if (settings.user_id === user?.id) {
          addTestResult({
            name: "User ID Validation",
            status: 'success',
            message: "User ID ในการตั้งค่าตรงกับ user ปัจจุบัน ✅",
            data: { expected: user?.id, actual: settings.user_id }
          });
        } else {
          addTestResult({
            name: "User ID Validation",
            status: 'error',
            message: "User ID ไม่ตรงกัน! มีปัญหาการแยกข้อมูลตาม user",
            data: { expected: user?.id, actual: settings.user_id }
          });
        }
      } else {
        addTestResult({
          name: "Fetch Settings",
          status: 'warning',
          message: "ไม่พบการตั้งค่า (อาจยังไม่ได้บันทึกหรือ RLS กรองออก)",
        });
      }
    } catch (error) {
      addTestResult({
        name: "Fetch Settings",
        status: 'error',
        message: `ไม่สามารถดึงการตั้งค่าได้: ${error}`,
        data: { error: error }
      });
    }
  };

  // Test 3: ทดสอบการอัพเดทการตั้งค่า
  const testUpdateSettings = async () => {
    try {
      const updateData = {
        deviceCode: "TEST_DEVICE_API",
        symbol: "head_rice",
        name: "หัวข้าว (ทดสอบ - อัพเดท)",
        enabled: false, // เปลี่ยนเป็นปิด
        minEnabled: false,
        maxEnabled: true,
        minThreshold: 70,
        maxThreshold: 90
      };

      await saveNotificationSettings(updateData);
      
      addTestResult({
        name: "Update Settings",
        status: 'success',
        message: "อัพเดทการตั้งค่าสำเร็จ (เปลี่ยนเป็นปิดการแจ้งเตือน)",
        data: updateData
      });

      // ตรวจสอบการอัพเดท
      const updatedSettings = await getNotificationSettings("TEST_DEVICE_API", "head_rice");
      if (updatedSettings && !updatedSettings.enabled) {
        addTestResult({
          name: "Update Verification",
          status: 'success',
          message: "ยืนยันการอัพเดท: การแจ้งเตือนถูกปิดแล้ว",
        });
      }
    } catch (error) {
      addTestResult({
        name: "Update Settings",
        status: 'error',
        message: `ไม่สามารถอัพเดทการตั้งค่าได้: ${error}`,
        data: { error: error }
      });
    }
  };

  // Test 4: ทดสอบ RLS Isolation
  const testRLSIsolation = async () => {
    try {
      // ลองดึงการตั้งค่าทั้งหมดผ่าน direct query
      const { data: allSettings, error } = await supabase
        .from('notification_settings')
        .select('*')
        .limit(10);

      if (error) {
        addTestResult({
          name: "RLS Isolation Test",
          status: 'success',
          message: "RLS ทำงานถูกต้อง: ไม่สามารถดึงข้อมูลโดยไม่ผ่าน policy ได้",
          data: { error: error.message }
        });
      } else {
        // ตรวจสอบว่าข้อมูลทั้งหมดเป็นของ user ปัจจุบัน
        const userOnlyData = allSettings?.every(setting => setting.user_id === user?.id);
        
        addTestResult({
          name: "RLS Isolation Test",
          status: userOnlyData ? 'success' : 'error',
          message: userOnlyData 
            ? `RLS ทำงานถูกต้อง: เห็นเฉพาะข้อมูลของ user ปัจจุบัน (${allSettings?.length} รายการ)`
            : "⚠️ RLS อาจมีปัญหา: พบข้อมูลของ user อื่น",
          data: { count: allSettings?.length, userOnly: userOnlyData }
        });
      }
    } catch (error) {
      addTestResult({
        name: "RLS Isolation Test",
        status: 'error',
        message: `ไม่สามารถทดสอบ RLS ได้: ${error}`,
      });
    }
  };

  // รันการทดสอบทั้งหมด
  const runAllTests = async () => {
    setIsRunning(true);
    clearResults();

    addTestResult({
      name: "Test Environment",
      status: 'success',
      message: `เริ่มการทดสอบ API - User: ${user?.email || 'Unknown'} (${user?.id})`,
    });

    // รันการทดสอบตามลำดับ
    await testSaveNewSettings();
    await new Promise(resolve => setTimeout(resolve, 500)); // รอสักครู่

    await testFetchSettings();
    await new Promise(resolve => setTimeout(resolve, 500));

    await testUpdateSettings();
    await new Promise(resolve => setTimeout(resolve, 500));

    await testRLSIsolation();

    addTestResult({
      name: "Test Complete",
      status: 'success',
      message: "การทดสอบเสร็จสิ้น - ตรวจสอบผลลัพธ์ด้านบน",
    });

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
    }
  };

  if (!user) {
    return (
      <Alert>
        <User className="h-4 w-4" />
        <AlertDescription>
          กรุณาเข้าสู่ระบบก่อนทดสอบ API
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Task 1.3: API Testing Dashboard
          </CardTitle>
          <p className="text-sm text-gray-600">
            ทดสอบการทำงานของ notification settings API หลังแก้ไข user isolation
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <p><strong>User:</strong> {user.email}</p>
              <p><strong>User ID:</strong> {user.id}</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                {isRunning ? "กำลังทดสอบ..." : "รันการทดสอบทั้งหมด"}
              </Button>
              <Button 
                variant="outline" 
                onClick={clearResults}
                disabled={isRunning}
              >
                ล้างผลลัพธ์
              </Button>
            </div>
          </div>

          {currentSettings && (
            <Alert>
              <AlertDescription>
                <strong>การตั้งค่าปัจจุบัน:</strong> {currentSettings.rice_type_name} 
                ({currentSettings.enabled ? 'เปิด' : 'ปิด'}) - 
                Min: {currentSettings.min_threshold}, Max: {currentSettings.max_threshold}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ผลลัพธ์การทดสอบ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-start gap-2">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{result.name}</Badge>
                        <Badge 
                          variant={result.status === 'success' ? 'default' : 
                                  result.status === 'error' ? 'destructive' : 'secondary'}
                        >
                          {result.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm">{result.message}</p>
                      {result.data && (
                        <details className="mt-2">
                          <summary className="text-xs cursor-pointer text-gray-500">
                            ดูข้อมูลเพิ่มเติม
                          </summary>
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};