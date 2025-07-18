
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { useGuestMode } from '@/hooks/useGuestMode';
import { useQuery } from '@tanstack/react-query';
import { fetchDevicesWithDetails } from '@/features/equipment/services/deviceDataService';
import { supabase } from '@/integrations/supabase/client';
import { LoadingScreen } from '@/features/device-details/components/LoadingScreen';

const Index = () => {
  const navigate = useNavigate();
  const { isLoading: authLoading, user, userRoles } = useAuth();
  const { isGuest, isAuthenticated } = useGuestMode();
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  const [hasRedirected, setHasRedirected] = useState(false);

  const isAdmin = userRoles.includes('admin');
  const isSuperAdmin = userRoles.includes('superadmin');

  console.log('🏠 Index page render:', {
    authLoading,
    isAuthenticated,
    isGuest,
    user: !!user,
    redirectAttempts,
    hasRedirected
  });

  // Safeguard against infinite redirects
  const MAX_REDIRECT_ATTEMPTS = 3;
  
  // Fetch devices for authenticated users
  const { data: accessibleDevices } = useQuery({
    queryKey: ['accessible-devices-check', user?.id, isAdmin, isSuperAdmin],
    queryFn: () => fetchDevicesWithDetails(user?.id, isAdmin, isSuperAdmin),
    enabled: !authLoading && !!user && isAuthenticated && !isGuest,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Fetch guest accessible devices
  const { data: guestAccessibleDevices } = useQuery({
    queryKey: ['guest-accessible-devices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guest_device_access')
        .select('device_code')
        .eq('enabled', true);
      
      if (error) {
        console.error('Error fetching guest device access:', error);
        return [];
      }
      
      return data?.map(item => ({ device_code: item.device_code })) || [];
    },
    enabled: isGuest && !authLoading,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    // Prevent infinite redirect loops
    if (redirectAttempts >= MAX_REDIRECT_ATTEMPTS) {
      console.error('🚫 Max redirect attempts reached, staying on Index');
      return;
    }

    if (hasRedirected) {
      console.log('🔄 Already redirected, skipping');
      return;
    }

    // Wait for authentication to be fully resolved
    if (authLoading) {
      console.log('⏳ Auth still loading, waiting...');
      return;
    }

    const handleRedirect = async () => {
      console.log('🚀 Starting redirect logic:', {
        isGuest,
        isAuthenticated,
        user: !!user,
        accessibleDevices: accessibleDevices?.length,
        guestAccessibleDevices: guestAccessibleDevices?.length
      });

      const lastViewedDeviceCode = localStorage.getItem('lastViewedDeviceCode');
      console.log('🔍 Checking last viewed device:', lastViewedDeviceCode);

      // For guests (visitors)
      if (isGuest) {
        console.log('👤 Guest user detected');
        
        if (lastViewedDeviceCode && guestAccessibleDevices) {
          const hasGuestAccess = guestAccessibleDevices.some(d => d.device_code === lastViewedDeviceCode);
          
          if (hasGuestAccess) {
            console.log('✅ Guest has access to last viewed device, redirecting');
            setHasRedirected(true);
            navigate(`/device/${lastViewedDeviceCode}`, { replace: true });
            return;
          } else {
            console.warn(`❌ Guest access revoked for device ${lastViewedDeviceCode}, clearing and redirecting to equipment`);
            localStorage.removeItem('lastViewedDeviceCode');
          }
        }
        
        console.log('📋 Guest redirecting to equipment page');
        setHasRedirected(true);
        navigate('/equipment', { replace: true });
        return;
      }

      // For authenticated users
      if (isAuthenticated && user) {
        if (lastViewedDeviceCode && accessibleDevices) {
          const hasAccess = accessibleDevices.some(d => d.device_code === lastViewedDeviceCode);

          if (hasAccess) {
            console.log('✅ Authenticated user has access, redirecting to device page');
            setHasRedirected(true);
            navigate(`/device/${lastViewedDeviceCode}`, { replace: true });
          } else {
            console.warn(`❌ Access revoked for device ${lastViewedDeviceCode}, clearing and redirecting to equipment`);
            localStorage.removeItem('lastViewedDeviceCode');
            setHasRedirected(true);
            navigate('/equipment', { replace: true });
          }
        } else {
          console.log('📋 No last viewed device, redirecting to equipment');
          setHasRedirected(true);
          navigate('/equipment', { replace: true });
        }
        return;
      }

      // Fallback: if we can't determine user state, go to equipment
      console.log('🤷 Unable to determine user state, fallback to equipment');
      setRedirectAttempts(prev => prev + 1);
      setHasRedirected(true);
      navigate('/equipment', { replace: true });
    };

    // Small delay to prevent race conditions
    const timeoutId = setTimeout(() => {
      handleRedirect();
    }, 100);

    return () => clearTimeout(timeoutId);

  }, [
    authLoading,
    isGuest,
    isAuthenticated,
    user,
    navigate,
    accessibleDevices,
    guestAccessibleDevices,
    redirectAttempts,
    hasRedirected
  ]);

  // Show loading screen while determining redirect
  return <LoadingScreen />;
};

export default Index;
