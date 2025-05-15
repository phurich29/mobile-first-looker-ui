
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLatestDeviceCode } from "@/integrations/supabase/client";

/**
 * Custom hook to handle redirection when deviceCode is 'default'
 */
export const useDefaultDeviceRedirect = (deviceCode: string | undefined) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // If deviceCode is 'default', fetch the latest device data and navigate to it
    if (deviceCode === 'default') {
      const fetchLatestDevice = async () => {
        try {
          // Use the utility function to get the latest device code
          const latestDeviceCode = await fetchLatestDeviceCode();
          
          if (latestDeviceCode) {
            console.log("Found latest device:", latestDeviceCode);
            navigate(`/device/${latestDeviceCode}`, { replace: true });
          } else {
            // If no data is found, use a fallback device code
            console.log("No latest device found, using fallback");
            navigate(`/device/6400000401398`, { replace: true });
          }
        } catch (error) {
          console.error("Error handling default device:", error);
          // Use fallback device code on error
          navigate(`/device/6400000401398`, { replace: true });
        }
      };
      
      fetchLatestDevice();
    }
  }, [deviceCode, navigate]);
};
