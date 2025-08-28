import { supabase } from "@/integrations/supabase/client";

/**
 * API Validation Utils - Enhanced security validation for all API calls
 * Phase 3: Comprehensive user_id validation and cross-user protection
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  userId?: string;
}

export interface SecurityLog {
  function_name: string;
  user_id?: string;
  action: string;
  device_code?: string;
  rice_type_id?: string;
  success: boolean;
  error_message?: string;
  timestamp: string;
  ip_address?: string;
}

/**
 * Validates current user authentication and returns user context
 */
export const validateUserAuthentication = async (): Promise<ValidationResult> => {
  try {
    console.log('🔍 Validating user authentication...');
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('🚫 Authentication error:', error);
      logSecurityEvent({
        function_name: 'validateUserAuthentication',
        action: 'auth_check_failed',
        success: false,
        error_message: error.message,
        timestamp: new Date().toISOString()
      });
      
      return {
        isValid: false,
        error: 'Authentication failed: ' + error.message
      };
    }
    
    if (!user) {
      console.warn('🚫 No authenticated user found');
      logSecurityEvent({
        function_name: 'validateUserAuthentication', 
        action: 'no_user_found',
        success: false,
        error_message: 'No authenticated user',
        timestamp: new Date().toISOString()
      });
      
      return {
        isValid: false,
        error: 'User must be authenticated to perform this action'
      };
    }
    
    console.log('✅ User authentication validated:', user.id);
    return {
      isValid: true,
      userId: user.id
    };
    
  } catch (error: any) {
    console.error('🚨 Exception in user authentication:', error);
    logSecurityEvent({
      function_name: 'validateUserAuthentication',
      action: 'validation_exception', 
      success: false,
      error_message: error.message,
      timestamp: new Date().toISOString()
    });
    
    return {
      isValid: false,
      error: 'Authentication validation failed: ' + error.message
    };
  }
};

/**
 * Validates user access to specific device
 */
export const validateDeviceAccess = async (
  userId: string, 
  deviceCode: string
): Promise<ValidationResult> => {
  try {
    console.log('🔍 Validating device access for user:', userId, 'device:', deviceCode);
    
    if (!userId || !deviceCode) {
      const error = 'Missing user ID or device code for validation';
      console.error('🚫', error);
      logSecurityEvent({
        function_name: 'validateDeviceAccess',
        user_id: userId,
        device_code: deviceCode,
        action: 'invalid_parameters',
        success: false,
        error_message: error,
        timestamp: new Date().toISOString()
      });
      
      return {
        isValid: false,
        error
      };
    }
    
    // Check if user is admin/superadmin (they have access to all devices)
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .in('role', ['admin', 'superadmin']);
    
    if (roleError) {
      console.error('🚫 Error checking user roles:', roleError);
      logSecurityEvent({
        function_name: 'validateDeviceAccess',
        user_id: userId,
        device_code: deviceCode,
        action: 'role_check_failed',
        success: false,
        error_message: roleError.message,
        timestamp: new Date().toISOString()
      });
      
      return {
        isValid: false,
        error: 'Failed to validate user permissions'
      };
    }
    
    if (userRoles && userRoles.length > 0) {
      console.log('✅ Admin/superadmin access granted for device:', deviceCode);
      logSecurityEvent({
        function_name: 'validateDeviceAccess',
        user_id: userId,
        device_code: deviceCode,
        action: 'admin_access_granted',
        success: true,
        timestamp: new Date().toISOString()
      });
      
      return { isValid: true, userId };
    }
    
    // Check user device access for regular users
    const { data: deviceAccess, error: accessError } = await supabase
      .from('user_device_access')
      .select('device_code')
      .eq('user_id', userId)
      .eq('device_code', deviceCode)
      .maybeSingle();
    
    if (accessError) {
      console.error('🚫 Error checking device access:', accessError);
      logSecurityEvent({
        function_name: 'validateDeviceAccess',
        user_id: userId,
        device_code: deviceCode,
        action: 'access_check_failed',
        success: false,
        error_message: accessError.message,
        timestamp: new Date().toISOString()
      });
      
      return {
        isValid: false,
        error: 'Failed to validate device access'
      };
    }
    
    if (!deviceAccess) {
      console.warn('🚫 User does not have access to device:', userId, deviceCode);
      logSecurityEvent({
        function_name: 'validateDeviceAccess',
        user_id: userId,
        device_code: deviceCode,
        action: 'access_denied',
        success: false,
        error_message: 'User does not have access to this device',
        timestamp: new Date().toISOString()
      });
      
      return {
        isValid: false,
        error: 'Access denied: You do not have permission to access this device'
      };
    }
    
    console.log('✅ Device access validated for user:', userId, 'device:', deviceCode);
    logSecurityEvent({
      function_name: 'validateDeviceAccess',
      user_id: userId,
      device_code: deviceCode,
      action: 'access_granted',
      success: true,
      timestamp: new Date().toISOString()
    });
    
    return { isValid: true, userId };
    
  } catch (error: any) {
    console.error('🚨 Exception in device access validation:', error);
    logSecurityEvent({
      function_name: 'validateDeviceAccess',
      user_id: userId,
      device_code: deviceCode,
      action: 'validation_exception',
      success: false,
      error_message: error.message,
      timestamp: new Date().toISOString()
    });
    
    return {
      isValid: false,
      error: 'Device access validation failed: ' + error.message
    };
  }
};

/**
 * Validates notification settings ownership
 */
export const validateNotificationOwnership = async (
  userId: string, 
  deviceCode: string, 
  riceTypeId: string
): Promise<ValidationResult> => {
  try {
    console.log('🔍 Validating notification ownership:', { userId, deviceCode, riceTypeId });
    
    const { data: settings, error } = await supabase
      .from('notification_settings')
      .select('user_id, device_code, rice_type_id')
      .eq('device_code', deviceCode)
      .eq('rice_type_id', riceTypeId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('🚫 Error validating notification ownership:', error);
      logSecurityEvent({
        function_name: 'validateNotificationOwnership',
        user_id: userId,
        device_code: deviceCode,
        rice_type_id: riceTypeId,
        action: 'ownership_check_failed',
        success: false,
        error_message: error.message,
        timestamp: new Date().toISOString()
      });
      
      return {
        isValid: false,
        error: 'Failed to validate notification settings ownership'
      };
    }
    
    // If no settings exist, that's OK (user can create new ones)
    if (!settings) {
      console.log('📝 No existing notification settings found - user can create new ones');
      return { isValid: true, userId };
    }
    
    // Verify ownership
    if (settings.user_id !== userId) {
      console.warn('🚫 Notification settings belong to different user:', {
        settingsUser: settings.user_id,
        requestingUser: userId
      });
      
      logSecurityEvent({
        function_name: 'validateNotificationOwnership',
        user_id: userId,
        device_code: deviceCode,
        rice_type_id: riceTypeId,
        action: 'ownership_violation',
        success: false,
        error_message: `Cross-user access attempt: settings belong to ${settings.user_id}`,
        timestamp: new Date().toISOString()
      });
      
      return {
        isValid: false,
        error: 'Access denied: These notification settings belong to another user'
      };
    }
    
    console.log('✅ Notification ownership validated');
    logSecurityEvent({
      function_name: 'validateNotificationOwnership',
      user_id: userId,
      device_code: deviceCode,
      rice_type_id: riceTypeId,
      action: 'ownership_validated',
      success: true,
      timestamp: new Date().toISOString()
    });
    
    return { isValid: true, userId };
    
  } catch (error: any) {
    console.error('🚨 Exception in notification ownership validation:', error);
    logSecurityEvent({
      function_name: 'validateNotificationOwnership',
      user_id: userId,
      device_code: deviceCode,
      rice_type_id: riceTypeId,
      action: 'validation_exception',
      success: false,
      error_message: error.message,
      timestamp: new Date().toISOString()
    });
    
    return {
      isValid: false,
      error: 'Ownership validation failed: ' + error.message
    };
  }
};

/**
 * Comprehensive API validation - combines all validation steps
 */
export const validateApiAccess = async (
  deviceCode?: string,
  riceTypeId?: string
): Promise<ValidationResult> => {
  // Step 1: Validate user authentication
  const authResult = await validateUserAuthentication();
  if (!authResult.isValid || !authResult.userId) {
    return authResult;
  }
  
  // Step 2: Validate device access (if deviceCode provided)
  if (deviceCode) {
    const deviceResult = await validateDeviceAccess(authResult.userId, deviceCode);
    if (!deviceResult.isValid) {
      return deviceResult;
    }
  }
  
  // Step 3: Validate notification ownership (if both deviceCode and riceTypeId provided)
  if (deviceCode && riceTypeId) {
    const ownershipResult = await validateNotificationOwnership(
      authResult.userId, 
      deviceCode, 
      riceTypeId
    );
    if (!ownershipResult.isValid) {
      return ownershipResult;
    }
  }
  
  return { isValid: true, userId: authResult.userId };
};

/**
 * Log security events for audit and monitoring
 */
export const logSecurityEvent = (event: SecurityLog): void => {
  // Enhanced console logging with security context
  const logLevel = event.success ? 'info' : 'warn';
  const icon = event.success ? '✅' : '🚫';
  
  console[logLevel](`${icon} [SECURITY] ${event.function_name}:`, {
    action: event.action,
    user_id: event.user_id,
    device_code: event.device_code,
    rice_type_id: event.rice_type_id,
    success: event.success,
    error: event.error_message,
    timestamp: event.timestamp
  });
  
  // In production, you might want to send these to a monitoring service
  // or store them in a secure audit log table
  if (!event.success) {
    // Additional alerting for security violations
    console.error('🚨 SECURITY ALERT:', event);
  }
};

/**
 * Create standardized API error response
 */
export const createApiError = (
  functionName: string,
  message: string,
  userId?: string,
  context?: Record<string, any>
): Error => {
  logSecurityEvent({
    function_name: functionName,
    user_id: userId,
    action: 'api_error',
    success: false,
    error_message: message,
    timestamp: new Date().toISOString(),
    ...context
  });
  
  return new Error(message);
};