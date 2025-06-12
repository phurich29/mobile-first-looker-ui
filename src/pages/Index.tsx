
import { useState } from "react";
import { AppLayout } from "@/components/layouts";
import { useIsMobile } from "@/hooks/use-mobile";
import { CountdownProvider } from "@/contexts/CountdownContext";
import { CountdownTimer } from "@/components/CountdownTimer";
import "@/components/notification-item-animation.css";

// Import device details components
import { DeviceHeader } from "@/features/device-details/components/DeviceHeader";
import { SearchBar } from "@/features/device-details/components/SearchBar";
import { MeasurementTabs } from "@/features/device-details/components/MeasurementTabs";
import { useDeviceData } from "@/features/device-details/hooks/useDeviceData";
import { useIndexDeviceData } from "@/hooks/useIndexDeviceData";

const Index = () => {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');

  // Use our custom hook to get the selected device for the index page
  const { 
    selectedDeviceCode, 
    isLoading: isLoadingDeviceSelection,
    handleMeasurementClick 
  } = useIndexDeviceData();

  // Get device data using the existing hook
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
  } = useDeviceData(selectedDeviceCode);

  // Handler for when countdown completes
  const handleCountdownComplete = () => {
    console.log("Global countdown complete - triggering refresh on Index page");
    refreshData();
  };

  // Show loading while selecting device
  if (isLoadingDeviceSelection) {
    return (
      <AppLayout wideContent showFooterNav contentPaddingBottom="pb-32 md:pb-16">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูลอุปกรณ์...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <CountdownProvider initialSeconds={60} onComplete={handleCountdownComplete}>
      <AppLayout wideContent showFooterNav contentPaddingBottom={isMobile ? 'pb-32' : 'pb-16'}>
        <div className="flex-1">
          {/* Device Header - shows which device we're displaying */}
          <DeviceHeader deviceCode={selectedDeviceCode} />
          
          {/* Search bar and countdown timer */}
          <div className="flex justify-between items-center mb-4">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <CountdownTimer useGlobal={true} iconSize={18} className="mr-2" />
          </div>

          {/* Measurement tabs - same as device details page */}
          <div className="mb-4">
            <MeasurementTabs
              deviceCode={selectedDeviceCode}
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
      </AppLayout>
    </CountdownProvider>
  );
};

export default Index;
