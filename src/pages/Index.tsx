import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgressiveAuth } from '@/hooks/useProgressiveAuth';
import { useDeviceDataQuery } from '@/hooks/useDeviceDataQuery';
import { ProgressiveLoadingScreen } from '@/components/loading/ProgressiveLoadingScreen';

const Index = () => {
  const navigate = useNavigate();
  const { isLoading: authLoading, isAuthenticated, userId } = useProgressiveAuth();
  const [loadingStage, setLoadingStage] = useState<'auth' | 'devices' | 'complete'>('auth');
  const [progress, setProgress] = useState(0);

  // Use React Query for device data with progressive loading
  const {
    devices,
    isLoading: devicesLoading,
    error: devicesError,
  } = useDeviceDataQuery({
    enabled: !authLoading && (isAuthenticated || true), // Enable for guests too
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });

  useEffect(() => {
    // Progressive loading stages
    if (authLoading) {
      setLoadingStage('auth');
      setProgress(20);
      return;
    }

    if (devicesLoading) {
      setLoadingStage('devices');
      setProgress(60);
      return;
    }

    setLoadingStage('complete');
    setProgress(100);

    // Small delay for smooth transition
    const redirectTimer = setTimeout(() => {
      handleRedirect();
    }, 500);

    return () => clearTimeout(redirectTimer);
  }, [authLoading, devicesLoading]);

  const handleRedirect = () => {
    const lastViewedDeviceCode = localStorage.getItem('lastViewedDeviceCode');

    if (lastViewedDeviceCode && devices.length > 0) {
      // Quick check using cached data from React Query
      const hasAccess = devices.some(d => d.device_code === lastViewedDeviceCode);

      if (hasAccess) {
        console.log(`✅ Using cached data: Access confirmed for device ${lastViewedDeviceCode}`);
        navigate(`/device/${lastViewedDeviceCode}`, { replace: true });
        return;
      } else {
        console.warn(`❌ Using cached data: Access revoked for device ${lastViewedDeviceCode}`);
        localStorage.removeItem('lastViewedDeviceCode');
      }
    }

    // Default redirect to equipment page
    navigate('/equipment', { replace: true });
  };

  const handleSkipToEquipment = () => {
    console.log('⏭️ User skipped loading, redirecting to equipment');
    navigate('/equipment', { replace: true });
  };

  // Show error state if device fetch fails
  if (devicesError && !authLoading) {
    console.error('❌ Device fetch error, redirecting to equipment:', devicesError);
    setTimeout(() => navigate('/equipment', { replace: true }), 1000);
  }

  return (
    <ProgressiveLoadingScreen
      stage={loadingStage}
      progress={progress}
      showSkipOption={loadingStage === 'devices' && progress < 100}
      onSkip={handleSkipToEquipment}
    />
  );
};

export default Index;
