
import { useState } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layouts/app-layout"; // Import AppLayout
import { useIsMobile } from "@/hooks/use-mobile"; // Import useIsMobile
// Header and FooterNav are handled by AppLayout for the main view
import MeasurementHistory from "@/components/MeasurementHistory"; // Keep for its own view
import "@/components/notification-item-animation.css";
import { CountdownProvider } from "@/contexts/CountdownContext";
import { CountdownTimer } from "@/components/CountdownTimer";

// Import custom hooks
import { useDeviceData } from "@/features/device-details/hooks/useDeviceData";
import { useDefaultDeviceRedirect } from "@/features/device-details/hooks/useDefaultDeviceRedirect";

// Import components
import { DeviceHeader } from "@/features/device-details/components/DeviceHeader";
import { SearchBar } from "@/features/device-details/components/SearchBar";
import { MeasurementTabs } from "@/features/device-details/components/MeasurementTabs";
import { LoadingScreen } from "@/features/device-details/components/LoadingScreen";

export default function DeviceDetails() {
  const { deviceCode } = useParams();
  const isMobile = useIsMobile(); // Add useIsMobile
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMeasurement, setSelectedMeasurement] = useState<{
    symbol: string;
    name: string;
  } | null>(null);

  // Use custom hooks
  useDefaultDeviceRedirect(deviceCode);
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

  // Handle measurement item click
  const handleMeasurementClick = (symbol: string, name: string) => {
    setSelectedMeasurement({ symbol, name });
  };

  // Close history view
  const handleCloseHistory = () => {
    setSelectedMeasurement(null);
  };

  // Handler for when countdown completes
  const handleCountdownComplete = () => {
    console.log("Global countdown complete - triggering refresh or other actions");
    refreshData();
  };

  // If deviceCode is 'default', show loading screen
  if (deviceCode === 'default') {
    return <LoadingScreen />;
  }

  // Show measurement history if a measurement is selected
  if (selectedMeasurement && deviceCode && deviceCode !== 'default') {
    return (
      <MeasurementHistory
        symbol={selectedMeasurement.symbol}
        name={selectedMeasurement.name}
        deviceCode={deviceCode}
        onClose={handleCloseHistory}
      />
    );
  }

  // Main device details view with AppLayout
  return (
    <CountdownProvider initialSeconds={60} onComplete={handleCountdownComplete}>
      <AppLayout showFooterNav={true} contentPaddingBottom={isMobile ? 'pb-32' : 'pb-4'}>
        {/* Header and FooterNav are handled by AppLayout */}
        {/* The md:ml-64 for sidebar is handled by AppLayout */}
        {/* Background and min-height are handled by AppLayout or its children */}
        <div className="flex-1">
          <DeviceHeader deviceCode={deviceCode} />
          
          <div className="flex justify-between items-center mb-4">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <CountdownTimer useGlobal={true} iconSize={18} className="mr-2" />
          </div>

          <div className="mb-4">
            <MeasurementTabs
              deviceCode={deviceCode}
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
              onMeasurementClick={handleMeasurementClick}
            />
          </div>
        </div>
        {/* Removed redundant spacer div and FooterNav direct usage */}
      </AppLayout>
    </CountdownProvider>
  );
}
