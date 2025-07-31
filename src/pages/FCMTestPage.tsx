import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { NotificationSettings } from '@/components/NotificationSettings';
import { Send, MessageSquare, Settings } from 'lucide-react';
import { toast } from 'sonner';

export const FCMTestPage: React.FC = () => {
  const [testMessage, setTestMessage] = useState({
    title: 'Test Notification',
    body: 'This is a test notification from FCM',
    data: '{"test": true}'
  });
  const [lastNotification, setLastNotification] = useState<any>(null);

  const handleTokenReceived = (token: string) => {
    console.log('FCM Token received:', token);
    toast.success('FCM token received and ready!');
  };

  const handleNotificationReceived = (notification: any) => {
    console.log('Notification received:', notification);
    setLastNotification(notification);
  };

  const sendTestNotification = async () => {
    try {
      // This would normally send to your backend API
      // For demo purposes, we'll just show how the payload would look
      const payload = {
        title: testMessage.title,
        body: testMessage.body,
        data: JSON.parse(testMessage.data || '{}')
      };

      console.log('Test notification payload:', payload);
      toast.info('Test notification sent (check console for payload)');
    } catch (error) {
      toast.error('Failed to parse test data');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">FCM Push Notifications</h1>
        <p className="text-muted-foreground">
          Test and configure Firebase Cloud Messaging push notifications
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Settings */}
        <div>
          <NotificationSettings
            userId="test-user-123"
            onTokenReceived={handleTokenReceived}
            onNotificationReceived={handleNotificationReceived}
          />
        </div>

        {/* Test Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Test Notification
              </CardTitle>
              <CardDescription>
                Send a test notification to verify FCM setup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={testMessage.title}
                  onChange={(e) => setTestMessage(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Notification title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Body</Label>
                <Textarea
                  id="body"
                  value={testMessage.body}
                  onChange={(e) => setTestMessage(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Notification body"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data">Data (JSON)</Label>
                <Textarea
                  id="data"
                  value={testMessage.data}
                  onChange={(e) => setTestMessage(prev => ({ ...prev, data: e.target.value }))}
                  placeholder='{"key": "value"}'
                  rows={2}
                />
              </div>

              <Button onClick={sendTestNotification} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Send Test Notification
              </Button>
            </CardContent>
          </Card>

          {/* Last Notification */}
          {lastNotification && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Last Notification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium">Title:</Label>
                    <p className="text-sm">{lastNotification.notification?.title || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Body:</Label>
                    <p className="text-sm">{lastNotification.notification?.body || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Data:</Label>
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                      {JSON.stringify(lastNotification.data || {}, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Timestamp:</Label>
                    <p className="text-sm">{new Date().toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Integration Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Integration Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-2">
            <h4 className="font-medium">To complete FCM setup:</h4>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Update Firebase configuration in <code>src/services/firebase.ts</code> with your actual project details</li>
              <li>Replace the VAPID key in the firebase config with your Web Push certificate key</li>
              <li>Implement server-side API endpoints for token registration (<code>/api/fcm/register</code> and <code>/api/fcm/unregister</code>)</li>
              <li>Add the Firebase service worker registration to your main app</li>
              <li>Test on both web and mobile platforms</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
