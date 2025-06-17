
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingScreen } from '@/features/device-details/components/LoadingScreen';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const lastViewedDeviceCode = localStorage.getItem('lastViewedDeviceCode');
    if (lastViewedDeviceCode) {
      navigate(`/device/${lastViewedDeviceCode}`, { replace: true });
    } else {
      // Optional: If no device is saved, navigate to the equipment list or show a different UI.
      // For now, it will just show LoadingScreen if no redirect happens.
      // Consider navigating to '/equipment' if that's preferred:
      // navigate('/equipment', { replace: true });
    }
  }, [navigate]);

  // Show a loading screen while checking localStorage and potentially redirecting.
  // If no redirect happens, this screen will persist unless further logic is added.
  return <LoadingScreen />;
};

export default Index;
