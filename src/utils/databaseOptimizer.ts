import { supabase } from "@/integrations/supabase/client";

/**
 * Database optimization utilities
 */
export class DatabaseOptimizer {
  private static instance: DatabaseOptimizer;
  
  static getInstance(): DatabaseOptimizer {
    if (!DatabaseOptimizer.instance) {
      DatabaseOptimizer.instance = new DatabaseOptimizer();
    }
    return DatabaseOptimizer.instance;
  }

  /**
   * Refresh materialized views for better performance
   */
  async refreshViews(): Promise<boolean> {
    try {
      console.log('🔄 Refreshing materialized views...');
      
      const { data, error } = await supabase.rpc('refresh_device_summary');
      
      if (error) {
        console.error('❌ Failed to refresh views:', error);
        return false;
      }
      
      console.log('✅ Materialized views refreshed successfully');
      return data === true;
      
    } catch (error) {
      console.error('🚨 View refresh error:', error);
      return false;
    }
  }

  /**
   * Check database performance
   */
  async checkPerformance(): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('get_performance_metrics');
      
      if (error) {
        console.error('❌ Performance check failed:', error);
        return null;
      }
      
      return data;
      
    } catch (error) {
      console.error('🚨 Performance check error:', error);
      return null;
    }
  }

  /**
   * Get query performance analysis
   */
  async analyzeQueries(hoursBack: number = 1): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('analyze_slow_queries', {
        hours_back: hoursBack
      });
      
      if (error) {
        console.error('❌ Query analysis failed:', error);
        return [];
      }
      
      return data || [];
      
    } catch (error) {
      console.error('🚨 Query analysis error:', error);
      return [];
    }
  }

  /**
   * Test query with timeout (circuit breaker test)
   */
  async testQuery(queryName: string, timeoutSeconds: number = 5): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase.rpc('query_with_timeout', {
        query_name: queryName,
        timeout_seconds: timeoutSeconds
      });
      
      if (error) {
        return { success: false, message: error.message };
      }
      
      return data?.[0] || { success: false, message: 'No result' };
      
    } catch (error) {
      return { success: false, message: String(error) };
    }
  }
}

/**
 * Optimized device data fetcher
 */
export class OptimizedDeviceService {
  private static retryCount = 0;
  private static maxRetries = 2;
  private static lastFailure = 0;
  private static circuitBreakerTimeout = 30000; // 30 seconds

  static async getGuestDevices(): Promise<any[]> {
    const now = Date.now();
    
    // Circuit breaker check
    if (this.retryCount >= this.maxRetries && (now - this.lastFailure) < this.circuitBreakerTimeout) {
      console.warn('🔴 Guest devices circuit breaker is open');
      return [];
    }
    
    try {
      const startTime = performance.now();
      
      const { data, error } = await supabase.rpc('get_super_fast_guest_devices');
      
      if (error) {
        this.recordFailure();
        throw error;
      }
      
      const executionTime = performance.now() - startTime;
      console.log(`⚡ Super fast guest devices: ${executionTime.toFixed(2)}ms`);
      
      this.recordSuccess();
      return data || [];
      
    } catch (error) {
      console.error('❌ Super fast guest devices failed:', error);
      this.recordFailure();
      return [];
    }
  }

  static async getAuthDevices(userId: string | null, isAdmin: boolean, isSuperAdmin: boolean): Promise<any[]> {
    const now = Date.now();
    
    // Circuit breaker check
    if (this.retryCount >= this.maxRetries && (now - this.lastFailure) < this.circuitBreakerTimeout) {
      console.warn('🔴 Auth devices circuit breaker is open');
      return [];
    }
    
    try {
      const startTime = performance.now();
      
      const { data, error } = await supabase.rpc('get_super_fast_auth_devices', {
        user_id_param: userId,
        is_admin_param: isAdmin,
        is_superadmin_param: isSuperAdmin
      });
      
      if (error) {
        this.recordFailure();
        throw error;
      }
      
      const executionTime = performance.now() - startTime;
      console.log(`⚡ Super fast auth devices: ${executionTime.toFixed(2)}ms`);
      
      this.recordSuccess();
      return data || [];
      
    } catch (error) {
      console.error('❌ Super fast auth devices failed:', error);
      this.recordFailure();
      return [];
    }
  }

  private static recordSuccess() {
    this.retryCount = 0;
  }

  private static recordFailure() {
    this.retryCount++;
    this.lastFailure = Date.now();
  }

  static getCircuitBreakerStatus() {
    const now = Date.now();
    const isOpen = this.retryCount >= this.maxRetries && (now - this.lastFailure) < this.circuitBreakerTimeout;
    
    return {
      isOpen,
      retryCount: this.retryCount,
      timeUntilReset: isOpen ? this.circuitBreakerTimeout - (now - this.lastFailure) : 0,
    };
  }
}