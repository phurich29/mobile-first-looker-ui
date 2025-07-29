import { FCMNotificationTest } from '@/components/fcm-notification-test';

export default function FCMTestPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          FCM Push Notification Test
        </h1>
        <p className="text-gray-600">
          ทดสอบการส่งและรับ Push Notifications ผ่าน Firebase Cloud Messaging
        </p>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <FCMNotificationTest />
      </div>
      
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">วิธีการทดสอบ:</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>คลิก "Enable Notifications" เพื่ออนุญาตการแจ้งเตือน</li>
          <li>คัดลอก FCM Token จาก Console (F12)</li>
          <li>ไปที่ Firebase Console → Cloud Messaging</li>
          <li>คลิก "Send test message"</li>
          <li>ใส่ FCM Token และส่งข้อความทดสอบ</li>
          <li>ตรวจสอบว่าได้รับ notification หรือไม่</li>
        </ol>
      </div>
    </div>
  );
}
