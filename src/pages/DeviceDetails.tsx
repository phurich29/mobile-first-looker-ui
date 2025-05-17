
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import MeasurementHistory from "@/components/MeasurementHistory";
import "@/components/notification-item-animation.css";

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
    isLoadingAllData
  } = useDeviceData(deviceCode);

  // Handle measurement item click
  const handleMeasurementClick = (symbol: string, name: string) => {
    setSelectedMeasurement({ symbol, name });
  };

  // Close history view
  const handleCloseHistory = () => {
    setSelectedMeasurement(null);
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

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />

      <main className="flex-1 p-4 pb-32">
        <DeviceHeader deviceCode={deviceCode} />
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

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
      </main>

      {/* Add space to prevent content from being hidden behind footer */}
      <div className="pb-32"></div>

      {/* Footer navigation */}
      <FooterNav />
    </div>
  );
}
