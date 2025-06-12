
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLatestDeviceCode } from "@/integrations/supabase/client";
import { REQUIRED_DEVICE_CODES } from "@/features/equipment/services";

/**
 * Custom hook for managing device data on the Index page
 * Automatically selects the device with latest data or falls back to default
 */
export const useIndexDeviceData = () => {
  const [selectedDeviceCode, setSelectedDeviceCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const selectDefaultDevice = async () => {
      setIsLoading(true);
      try {
        // Try to get the latest device with data
        const latestDeviceCode = await fetchLatestDeviceCode();
        
        if (latestDeviceCode && REQUIRED_DEVICE_CODES.includes(latestDeviceCode)) {
          setSelectedDeviceCode(latestDeviceCode);
        } else {
          // Fallback to first required device
          setSelectedDeviceCode(REQUIRED_DEVICE_CODES[0]);
        }
      } catch (error) {
        console.error("Error selecting default device:", error);
        // Use fallback device on error
        setSelectedDeviceCode(REQUIRED_DEVICE_CODES[0]);
      } finally {
        setIsLoading(false);
      }
    };

    selectDefaultDevice();
  }, []);

  // Handler for measurement item click - navigates to specific measurement page
  const handleMeasurementClick = (symbol: string, name: string) => {
    const urlSymbol = symbol.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (selectedDeviceCode) {
      navigate(`/device/${selectedDeviceCode}/${urlSymbol}`);
    }
  };

  return {
    selectedDeviceCode,
    isLoading,
    handleMeasurementClick,
  };
};
