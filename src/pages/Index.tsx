import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { fetchDevicesWithDetails } from '@/features/equipment/services/deviceDataService';
import { LoadingScreen } from '@/features/device-details/components/LoadingScreen';

const Index = () => {
  const navigate = useNavigate();
  const { isLoading, user } = useAuth();

  useEffect(() => {
    // Wait for the authentication to be fully resolved before making any decisions.
    if (isLoading) {
      return;
    }

    const handleRedirect = async () => {
      const lastViewedDeviceCode = localStorage.getItem('lastViewedDeviceCode');

      if (lastViewedDeviceCode) {
        try {
          // Before redirecting, VERIFY that the user still has access to this device.
          const accessibleDevices = await fetchDevicesWithDetails();
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
        } catch (error) {
          console.error("Error verifying device access, redirecting to equipment page:", error);
          navigate('/equipment', { replace: true });
        }
      } else {
        // For new users with no history, redirect to the equipment list.
        navigate('/equipment', { replace: true });
      }
    };

    handleRedirect();

  }, [isLoading, user, navigate]);

  // Render a loading screen while authentication and redirection logic are in progress.
  return <LoadingScreen />;
};

export default Index;
