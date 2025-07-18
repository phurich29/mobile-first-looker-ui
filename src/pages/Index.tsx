import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { useDevices } from '@/features/equipment/contexts/DeviceContext';
import { LoadingScreen } from '@/features/device-details/components/LoadingScreen';

const Index = () => {
  const navigate = useNavigate();
  const { isLoading, user } = useAuth();
  const { devices: cachedDevices } = useDevices();

  useEffect(() => {
    // Wait for the authentication to be fully resolved before making any decisions.
    if (isLoading) {
      return;
    }

    const handleRedirect = async () => {
      const lastViewedDeviceCode = localStorage.getItem('lastViewedDeviceCode');

      if (lastViewedDeviceCode) {
        try {
          console.log(`Verifying access to device: ${lastViewedDeviceCode}`);
          
          // Use cached devices for faster verification
          const hasAccess = cachedDevices.some(d => d.device_code === lastViewedDeviceCode);

          if (hasAccess) {
            console.log(`Access confirmed for device: ${lastViewedDeviceCode}`);
            navigate(`/device/${lastViewedDeviceCode}`, { replace: true });
          } else {
            console.warn(`Access to last viewed device (${lastViewedDeviceCode}) is revoked. Redirecting to equipment.`);
            localStorage.removeItem('lastViewedDeviceCode');
            navigate('/equipment', { replace: true });
          }
        } catch (error) {
          console.error("Error verifying device access, redirecting to equipment page:", error);
          // Clear problematic cache and redirect
          localStorage.removeItem('lastViewedDeviceCode');
          navigate('/equipment', { replace: true });
        }
      } else {
        console.log("No last viewed device, redirecting to equipment");
        navigate('/equipment', { replace: true });
      }
    };

    // Add timeout for the entire redirect process
    const redirectTimeout = setTimeout(() => {
      console.warn("Redirect process taking too long, forcing navigation to equipment");
      navigate('/equipment', { replace: true });
    }, 15000);

    handleRedirect().finally(() => clearTimeout(redirectTimeout));

  }, [isLoading, user, navigate]);

  // Render a loading screen while authentication and redirection logic are in progress.
  return <LoadingScreen />;
};

export default Index;
