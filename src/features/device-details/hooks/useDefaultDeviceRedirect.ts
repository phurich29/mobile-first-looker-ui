import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLatestDeviceCode } from "@/integrations/supabase/client";
import { useDeviceListOptimistic } from "@/features/equipment/hooks/useGlobalDeviceCache";

/**
 * Custom hook to handle redirection for the 'default' device route.
 * It finds the latest device, checks for user access, and redirects intelligently.
 * It also returns a boolean `isRedirecting` to allow the calling component to show a loading state.
 */
export const useDefaultDeviceRedirect = (deviceCode: string | undefined): { isRedirecting: boolean } => {
  const navigate = useNavigate();
  const cachedDevices = useDeviceListOptimistic();
  // The redirecting state is ONLY true if the initial deviceCode is 'default'.
  const [isRedirecting] = useState(deviceCode === 'default');

  useEffect(() => {
    // This effect should only run if we are in a redirecting state.
    if (!isRedirecting) {
      return;
    }

    const determineRedirect = async () => {
      try {
        const latestDeviceCode = await fetchLatestDeviceCode();
        
        if (!latestDeviceCode) {
          console.log("No devices found in system, redirecting to equipment page.");
          navigate('/equipment', { replace: true });
          return;
        }

        // Use cached devices for faster access check
        const hasAccessToLatest = cachedDevices.some(d => d.device_code === latestDeviceCode);

        if (hasAccessToLatest) {
          console.log(`User has access to latest device (${latestDeviceCode}). Redirecting.`);
          navigate(`/device/${latestDeviceCode}`, { replace: true });
        } else if (cachedDevices.length > 0) {
          const firstAccessibleDevice = cachedDevices[0].device_code;
          console.log(`User lacks access to latest, redirecting to first accessible device (${firstAccessibleDevice}).`);
          navigate(`/device/${firstAccessibleDevice}`, { replace: true });
        } else {
          console.log("User has no accessible devices, redirecting to equipment page.");
          navigate('/equipment', { replace: true });
        }
      } catch (error) {
        console.error("Error during default device redirection:", error);
        navigate('/equipment', { replace: true });
      }
    };

    determineRedirect();
    // The component will unmount on navigate, so we don't need to set isRedirecting to false.
  }, [isRedirecting, navigate, cachedDevices]); // Run when devices are available

  return { isRedirecting };
};
