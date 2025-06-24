
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingScreen } from '@/features/device-details/components/LoadingScreen';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const lastViewedDeviceCode = localStorage.getItem('lastViewedDeviceCode');
    
    if (lastViewedDeviceCode) {
      console.log('Found lastViewedDeviceCode:', lastViewedDeviceCode);
      navigate(`/device/${lastViewedDeviceCode}`, { replace: true });
    } else {
      console.log('No lastViewedDeviceCode found, redirecting to equipment page');
      // Navigate to equipment page when no device is saved
      navigate('/equipment', { replace: true });
    }
  }, [navigate]);

  // Show loading screen briefly while checking localStorage and redirecting
  return <LoadingScreen />;
};

export default Index;
