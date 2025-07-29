/**
 * Server-side OneSignal Integration Example
 * 
 * This file shows how to integrate OneSignal with your existing notification system
 * on the server side. Add this to your Supabase Edge Functions or Node.js backend.
 */

// Example Supabase Edge Function for sending OneSignal notifications
// File: supabase/functions/send_push_notification/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const ONESIGNAL_APP_ID = Deno.env.get("ONESIGNAL_APP_ID") || "";
const ONESIGNAL_REST_API_KEY = Deno.env.get("ONESIGNAL_REST_API_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  title: string;
  message: string;
  data?: Record<string, string>;
  userIds?: string[];
  deviceCodes?: string[];
  segments?: string[];
}

async function sendOneSignalNotification(payload: {
  headings: Record<string, string>;
  contents: Record<string, string>;
  data?: Record<string, string>;
  include_player_ids?: string[];
  include_external_user_ids?: string[];
  included_segments?: string[];
  buttons?: Array<{ id: string; text: string }>;
}) {
  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      ...payload,
    }),
  });

  if (!response.ok) {
    throw new Error(`OneSignal API error: ${response.status}`);
  }

  return await response.json();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { title, message, data, userIds, deviceCodes, segments } = await req.json() as NotificationPayload;

    let include_player_ids: string[] = [];
    let include_external_user_ids: string[] = [];

    // If specific user IDs are provided, use them
    if (userIds && userIds.length > 0) {
      include_external_user_ids = userIds;
    }

    // If device codes are provided, find users who have access to those devices
    if (deviceCodes && deviceCodes.length > 0) {
      const { data: deviceUsers, error } = await supabase
        .from('user_device_access')
        .select('user_id')
        .in('device_code', deviceCodes);

      if (error) {
        console.error('Error fetching device users:', error);
      } else if (deviceUsers) {
        const deviceUserIds = deviceUsers.map(du => du.user_id);
        include_external_user_ids = [...include_external_user_ids, ...deviceUserIds];
      }
    }

    // Prepare OneSignal payload
    const oneSignalPayload = {
      headings: { en: title },
      contents: { en: message },
      data: data || {},
      include_external_user_ids: include_external_user_ids.length > 0 ? include_external_user_ids : undefined,
      included_segments: segments && segments.length > 0 ? segments : undefined,
      buttons: [
        {
          id: "view_details",
          text: "View Details",
        },
        {
          id: "dismiss",
          text: "Dismiss",
        }
      ],
    };

    // Send notification via OneSignal
    const result = await sendOneSignalNotification(oneSignalPayload);

    console.log('OneSignal notification sent:', result);

    return new Response(JSON.stringify({
      success: true,
      oneSignalResult: result,
      targetedUsers: include_external_user_ids.length,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('Error sending push notification:', error);
    return new Response(JSON.stringify({
      error: "Failed to send push notification",
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

/* 
 * Usage example from your existing check_notifications function:
 * 
 * // In your existing supabase/functions/check_notifications/index.ts
 * 
 * // After creating a notification in your database, send push notification
 * if (insertError) {
 *   console.error("Error creating notification:", insertError);
 * } else {
 *   console.log(`Created new notification for ${setting.rice_type_id}`);
 *   notificationCount++;
 *   
 *   // Send push notification
 *   try {
 *     const pushResponse = await supabase.functions.invoke('send_push_notification', {
 *       body: {
 *         title: `${setting.rice_type_name} Alert`,
 *         message: message,
 *         data: {
 *           screen: 'DeviceDetails',
 *           deviceCode: setting.device_code,
 *           riceTypeId: setting.rice_type_id,
 *           alertType: setting.threshold_type,
 *           value: value.toString(),
 *           threshold: (setting.threshold_type === 'min' ? setting.min_threshold : setting.max_threshold).toString(),
 *         },
 *         deviceCodes: [setting.device_code],
 *       }
 *     });
 *     
 *     if (pushResponse.error) {
 *       console.error('Error sending push notification:', pushResponse.error);
 *     } else {
 *       console.log('Push notification sent successfully');
 *     }
 *   } catch (pushError) {
 *     console.error('Error invoking push notification function:', pushError);
 *   }
 * }
 */

// Example Node.js/Express implementation
/*
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

app.post('/api/send-notification', async (req, res) => {
  try {
    const { title, message, userIds, deviceCodes, data } = req.body;

    // Prepare OneSignal notification
    const notification = {
      app_id: process.env.ONESIGNAL_APP_ID,
      headings: { en: title },
      contents: { en: message },
      data: data || {},
      include_external_user_ids: userIds,
    };

    const response = await axios.post('https://onesignal.com/api/v1/notifications', notification, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      },
    });

    res.json({ success: true, result: response.data });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});
*/

// Example client-side integration with your existing notification system
/*
// In your React components
import { oneSignalService } from '@/services/OneSignalService';

export const enhanceNotificationSystem = async () => {
  // When user logs in, set their external user ID
  const user = getCurrentUser();
  if (user) {
    await oneSignalService.setExternalUserId(user.id);
    
    // Set user tags for segmentation
    await oneSignalService.sendTags({
      user_type: user.subscription_type,
      device_count: user.devices.length.toString(),
      region: user.region,
      language: user.language,
    });
  }
};

// In your device management
export const setupDeviceNotifications = async (deviceCode: string) => {
  // Tag user with device access
  await oneSignalService.sendTags({
    [`device_${deviceCode}`]: 'true',
  });
};
*/

export {};
