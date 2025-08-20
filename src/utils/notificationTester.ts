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

// Run comprehensive notification system test
export const runNotificationSystemTest = async () => {
  console.log('🧪 Running comprehensive notification system test...');
  
  // Test the edge function
  const testNotification = await testCheckNotifications();
  
  // Check latest data
  const latestData = await checkLatestData();
  
  const results = {
    testNotification,
    latestData
  };
  
  console.log('📊 Notification system test results:', results);
  return results;
};