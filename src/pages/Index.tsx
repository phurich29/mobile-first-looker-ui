
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { fetchDevicesWithDetails } from '@/features/equipment/services/deviceDataService';
import { LoadingScreen } from '@/features/device-details/components/LoadingScreen';

const Index = () => {
  const navigate = useNavigate();
  const { isLoading, user, userRoles } = useAuth();
  
  const isAdmin = userRoles.includes('admin');
  const isSuperAdmin = userRoles.includes('superadmin');

  // Use React Query to fetch devices for access verification
  const { data: accessibleDevices } = useQuery({
    queryKey: ['accessible-devices-check', user?.id, isAdmin, isSuperAdmin],
    queryFn: () => fetchDevicesWithDetails(user?.id, isAdmin, isSuperAdmin),
    enabled: !isLoading && !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    // Wait for the authentication to be fully resolved before making any decisions.
    if (isLoading) {
      return;
    }

    const handleRedirect = async () => {
      const lastViewedDeviceCode = localStorage.getItem('lastViewedDeviceCode');

      if (lastViewedDeviceCode && accessibleDevices) {
        const hasAccess = accessibleDevices.some(d => d.device_code === lastViewedDeviceCode);

        if (hasAccess) {
          // If access is confirmed, proceed to the device page.
          navigate(`/device/${lastViewedDeviceCode}`, { replace: true });
        } else {
          // If access is revoked, clear the invalid entry and go to the equipment page.
          console.warn(`Access to last viewed device (${lastViewedDeviceCode}) is revoked. Redirecting to equipment.`);
          localStorage.removeItem('lastViewedDeviceCode');
          navigate('/equipment', { replace: true });
        }
      } else {
        // For new users with no history, redirect to the equipment list.
        navigate('/equipment', { replace: true });
      }
    };

    if (!isLoading && (accessibleDevices !== undefined || !user)) {
      handleRedirect();
    }

  }, [isLoading, user, navigate, accessibleDevices]);

  // Render a loading screen while authentication and redirection logic are in progress.
  return <LoadingScreen />;
};

export default Index;
