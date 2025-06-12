
import { useDefaultDeviceRedirect } from '@/features/device-details/hooks/useDefaultDeviceRedirect';
import { LoadingScreen } from '@/features/device-details/components/LoadingScreen';

const Index = () => {
  // This hook will handle the redirection logic internally.
  useDefaultDeviceRedirect('default');

  // While the hook is fetching the latest device and redirecting,
  // we can show a loading screen.
  return <LoadingScreen />;
};

export default Index;
