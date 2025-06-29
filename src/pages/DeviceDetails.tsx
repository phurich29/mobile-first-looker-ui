
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MeasurementHistory from "@/components/measurement-history/MeasurementHistory";
import "@/components/notification-item-animation.css";
import { CountdownProvider } from "@/contexts/CountdownContext";
import { getColumnThaiName } from "@/lib/columnTranslations";

// Import custom hooks
import { useDeviceData } from "@/features/device-details/hooks/useDeviceData";
import { useDefaultDeviceRedirect } from "@/features/device-details/hooks/useDefaultDeviceRedirect";
import { useDeviceAccess } from "@/features/device-details/hooks/useDeviceAccess";

// Import components
import { LoadingScreen } from "@/features/device-details/components/LoadingScreen";
import { UnauthorizedAccess } from "@/features/device-details/components/UnauthorizedAccess";
import { DeviceMainContent } from "@/features/device-details/components/DeviceMainContent";

// Import utilities
import { convertUrlSymbolToMeasurementSymbol } from "@/features/device-details/utils/urlSymbolConverter";

export default function DeviceDetails() {
  const {
    deviceCode,
    symbol: urlSymbol
  } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Convert URL symbol to measurement symbol if present
  const measurementSymbol = urlSymbol ? convertUrlSymbolToMeasurementSymbol(urlSymbol) : null;
  const measurementName = measurementSymbol ? getColumnThaiName(measurementSymbol) : null;

  // Use custom hooks
  useDefaultDeviceRedirect(deviceCode);
  const { hasDeviceAccess, isLoading: isCheckingAccess, isGuest } = useDeviceAccess(deviceCode);
  const {
    wholeGrainData,
    ingredientsData,
    impuritiesData,
    allData,
    notificationSettings,
    isLoadingWholeGrain,
    isLoadingIngredients,
    isLoadingImpurities,
    isLoadingAllData,
    refreshData
  } = useDeviceData(deviceCode);

  // Handle measurement item click - now navigates to device-specific URL
  const handleMeasurementClick = (symbol: string, name: string) => {
    const urlSymbol = symbol.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (deviceCode && deviceCode !== 'default') {
      navigate(`/device/${deviceCode}/${urlSymbol}`);
    }
  };

  // Close history view - go back to device details
  const handleCloseHistory = () => {
    if (deviceCode && deviceCode !== 'default') {
      navigate(`/device/${deviceCode}`, {
        replace: true
      });
    }
  };

  // Handler for when countdown completes
  const handleCountdownComplete = () => {
    console.log("Global countdown complete - triggering refresh or other actions");
    refreshData();
  };

  // If still checking access permissions, show loading
  if (isCheckingAccess) {
    return <LoadingScreen />;
  }

  // If deviceCode is 'default', show loading screen
  if (deviceCode === 'default') {
    return <LoadingScreen />;
  }

  // If user doesn't have access to this device, show unauthorized message
  if (deviceCode && deviceCode !== 'default' && !hasDeviceAccess) {
    return <UnauthorizedAccess isGuest={isGuest} />;
  }

  // Show measurement history if a measurement symbol is present in URL
  if (measurementSymbol && measurementName && deviceCode && deviceCode !== 'default') {
    return (
      <MeasurementHistory 
        symbol={measurementSymbol} 
        name={measurementName} 
        deviceCode={deviceCode} 
        onClose={handleCloseHistory} 
      />
    );
  }

  // Main device details view with AppLayout
  return (
    <CountdownProvider initialSeconds={60} onComplete={handleCountdownComplete}>
      <DeviceMainContent
        deviceCode={deviceCode!}
        searchTerm={searchTerm}
        wholeGrainData={wholeGrainData}
        ingredientsData={ingredientsData}
        impuritiesData={impuritiesData}
        allData={allData}
        notificationSettings={notificationSettings || []}
        isLoadingWholeGrain={isLoadingWholeGrain}
        isLoadingIngredients={isLoadingIngredients}
        isLoadingImpurities={isLoadingImpurities}
        isLoadingAllData={isLoadingAllData}
        isGuest={isGuest}
        onMeasurementClick={handleMeasurementClick}
      />
    </CountdownProvider>
  );
}
