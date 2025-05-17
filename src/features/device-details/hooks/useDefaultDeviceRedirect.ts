import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLatestDeviceCode } from "@/integrations/supabase/client";
import { useDeviceContext } from "@/contexts/DeviceContext";

/**
 * Custom hook to handle redirection when deviceCode is 'default'
 */
export const useDefaultDeviceRedirect = (deviceCode: string | undefined) => {
  const navigate = useNavigate();
  const { selectedDeviceCode, isLoadingDevice } = useDeviceContext();

  useEffect(() => {
    const redirectToDevice = async () => {
      // If we're already on a specific device page, do nothing
      if (deviceCode && deviceCode !== "default") {
        return;
      }

      try {
        // First check if we have a selected device in context
        if (!isLoadingDevice && selectedDeviceCode) {
          navigate(`/device/${selectedDeviceCode}`, { replace: true });
          return;
        }
        
        // Otherwise fetch the latest device
        const latestDevice = await fetchLatestDeviceCode();
        if (latestDevice) {
          navigate(`/device/${latestDevice}`, { replace: true });
        }
      } catch (error) {
        console.error("Error in default device redirect:", error);
      }
    };

    redirectToDevice();
  }, [deviceCode, navigate, selectedDeviceCode, isLoadingDevice]);
};
