/**
 * Temporary utility to disable all Supabase realtime features for iOS PWA compatibility
 * This prevents WebSocket "operation is insecure" errors in iOS PWA
 */

// Override Supabase realtime functions to prevent WebSocket connections
export const disableSupabaseRealtime = () => {
  console.log('🔇 Disabling Supabase realtime for iOS PWA compatibility');
  
  // Create a mock channel that does nothing
  const mockChannel = {
    on: () => mockChannel,
    subscribe: () => Promise.resolve(),
    unsubscribe: () => Promise.resolve(),
    send: () => Promise.resolve(),
    track: () => Promise.resolve(),
    untrack: () => Promise.resolve(),
    presence: { state: {} }
  };

  // Override the global Supabase client if available
  if (typeof window !== 'undefined' && (window as any).supabase) {
    const supabase = (window as any).supabase;
    
    // Override channel method to return mock
    if (supabase.channel) {
      supabase.channel = () => mockChannel;
    }
    
    // Override realtime if it exists
    if (supabase.realtime) {
      supabase.realtime.channel = () => mockChannel;
    }
  }

  return mockChannel;
};

// Call immediately to disable realtime
if (typeof window !== 'undefined') {
  disableSupabaseRealtime();
}