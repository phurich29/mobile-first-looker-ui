import { supabase } from '@/integrations/supabase/client';

/**
 * Utility functions for testing notification system
 */

// Test the edge function directly
export const testCheckNotifications = async () => {
  console.log('🧪 Testing check_notifications edge function...');
  
  try {
    const { data, error } = await supabase.functions.invoke('check_notifications', {
      body: { checkType: 'manual_test' }
    });
    
    if (error) {
      console.error('❌ Edge function error:', error);
      return { success: false, error };
    }
    
    console.log('✅ Edge function response:', data);
    return { success: true, data };
  } catch (err) {
    console.error('❌ Edge function call failed:', err);
    return { success: false, error: err };
  }
};

// Insert a test notification directly
export const insertTestNotification = async () => {
  console.log('🧪 Inserting test notification...');
  
  const testNotification = {
    device_code: '6400000401432',
    rice_type_id: 'class1',
    threshold_type: 'max',
    value: 100.00,
    notification_message: '🧪 ทดสอบ: ค่า "ชั้น 1 (>7.0 mm)" (100) สูงกว่าเกณฑ์ที่กำหนดไว้ (70)',
    timestamp: new Date().toISOString(),
    user_id: 'bae7bf0b-2aa4-4f8d-a108-4aebdb388695'
  };
  
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert(testNotification)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Failed to insert test notification:', error);
      return { success: false, error };
    }
    
    console.log('✅ Test notification created:', data);
    return { success: true, data };
  } catch (err) {
    console.error('❌ Insert test notification failed:', err);
    return { success: false, error: err };
  }
};

// Check latest rice quality data that should trigger alerts
export const checkLatestData = async () => {
  console.log('🔍 Checking latest rice quality data...');
  
  try {
    const { data, error } = await supabase
      .from('rice_quality_analysis')
      .select('*')
      .eq('device_code', '6400000401432')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('❌ Failed to fetch latest data:', error);
      return { success: false, error };
    }
    
    console.log('✅ Latest rice quality data:', data);
    return { success: true, data };
  } catch (err) {
    console.error('❌ Check latest data failed:', err);
    return { success: false, error: err };
  }
};

// Run comprehensive test
export const runNotificationSystemTest = async () => {
  console.log('🚀 Running comprehensive notification system test...');
  
  const results = {
    dataCheck: await checkLatestData(),
    edgeFunctionTest: await testCheckNotifications(),
    testNotification: await insertTestNotification()
  };
  
  console.log('📊 Test Results Summary:', results);
  return results;
};