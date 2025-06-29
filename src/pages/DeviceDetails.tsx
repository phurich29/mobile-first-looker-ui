import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layouts/app-layout";
import { useIsMobile } from "@/hooks/use-mobile";
import MeasurementHistory from "@/components/measurement-history/MeasurementHistory";
import "@/components/notification-item-animation.css";
import { CountdownProvider } from "@/contexts/CountdownContext";
import { CountdownTimer } from "@/components/CountdownTimer";
import { Wheat } from "lucide-react";
import { getColumnThaiName } from "@/lib/columnTranslations";
import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { fetchDevicesWithDetails } from "@/features/equipment/services";

// Import custom hooks
import { useDeviceData } from "@/features/device-details/hooks/useDeviceData";
import { useDefaultDeviceRedirect } from "@/features/device-details/hooks/useDefaultDeviceRedirect";

// Import components
import { DeviceHeader } from "@/features/device-details/components/DeviceHeader";
import { SearchBar } from "@/features/device-details/components/SearchBar";
import { MeasurementTabs } from "@/features/device-details/components/MeasurementTabs";
import { LoadingScreen } from "@/features/device-details/components/LoadingScreen";
import { lazy, Suspense } from "react";

// Lazy load the DeviceHistoryTable component with named export
const DeviceHistoryTable = lazy(() => import("@/features/device-details/components/DeviceHistoryTable").then(module => ({
  default: module.DeviceHistoryTable
})));

// Helper function to convert URL symbol back to measurement symbol
const convertUrlSymbolToMeasurementSymbol = (urlSymbol: string): string => {
  // Map common URL symbols back to measurement symbols
  const symbolMap: Record<string, string> = {
    '70mm': 'class1',
    'class1': 'class1',
    'class2': 'class2',
    'class3': 'class3',
    'shortgrain': 'short_grain',
    'slenderkernel': 'slender_kernel',
    'wholekernels': 'whole_kernels',
    'headrice': 'head_rice',
    'totalbrokens': 'total_brokens',
    'smallbrokens': 'small_brokens',
    'smallbrokesc1': 'small_brokens_c1',
    'redlinerate': 'red_line_rate',
    'parboiledredline': 'parboiled_red_line',
    'parboiledwhiterice': 'parboiled_white_rice',
    'honeyrice': 'honey_rice',
    'yellowricerate': 'yellow_rice_rate',
    'blackkernel': 'black_kernel',
    'partlyblackpeck': 'partly_black_peck',
    'partlyblack': 'partly_black',
    'imperfectionrate': 'imperfection_rate',
    'stickyricerate': 'sticky_rice_rate',
    'impuritynum': 'impurity_num',
    'paddyrate': 'paddy_rate',
    'whiteness': 'whiteness',
    'processprecision': 'process_precision'
  };
  return symbolMap[urlSymbol.toLowerCase()] || urlSymbol;
};
export default function DeviceDetails() {
  const {
    deviceCode,
    symbol: urlSymbol
  } = useParams();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMeasurement, setSelectedMeasurement] = useState<{
    symbol: string;
    name: string;
  } | null>(null);
  const {
    user,
    userRoles
  } = useAuth();
  const isAdmin = userRoles.includes('admin');
  const isSuperAdmin = userRoles.includes('superadmin');

  // Convert URL symbol to measurement symbol if present
  const measurementSymbol = urlSymbol ? convertUrlSymbolToMeasurementSymbol(urlSymbol) : null;
  const measurementName = measurementSymbol ? getColumnThaiName(measurementSymbol) : null;

  // Check device access permissions
  const {
    data: accessibleDevices,
    isLoading: isCheckingAccess
  } = useQuery({
    queryKey: ['deviceAccess', user?.id, userRoles],
    queryFn: async () => {
      if (!user) return [];
      return await fetchDevicesWithDetails(user.id, isAdmin, isSuperAdmin);
    },
    enabled: !!user
  });

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

  // Check if user has access to the current device
  const hasDeviceAccess = accessibleDevices?.some(device => device.device_code === deviceCode) ?? false;

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
    return <AppLayout showFooterNav={true} contentPaddingBottom={isMobile ? 'pb-32' : 'pb-4'}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">ไม่พบอุปกรณ์ที่คุณมีสิทธิ์เข้าถึง</h2>
            
            <button onClick={() => navigate('/equipment')} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
              กลับไปหน้าอุปกรณ์
            </button>
          </div>
        </div>
      </AppLayout>;
  }

  // Show measurement history if a measurement symbol is present in URL
  if (measurementSymbol && measurementName && deviceCode && deviceCode !== 'default') {
    return <MeasurementHistory symbol={measurementSymbol} name={measurementName} deviceCode={deviceCode} onClose={handleCloseHistory} />;
  }

  // Main device details view with AppLayout
  return <CountdownProvider initialSeconds={60} onComplete={handleCountdownComplete}>
      <AppLayout showFooterNav={true} contentPaddingBottom={isMobile ? 'pb-32' : 'pb-4'}>
        <div className="flex-1">
          <div className="px-[5%] mb-3 flex justify-between items-center md:px-0">
            <DeviceHeader deviceCode={deviceCode} />
            <div className="flex items-center relative">
              {/* Wheat icon group with varied sizes and positions */}
              <Wheat className="text-amber-400 absolute -top-3 -left-8" size={16} strokeWidth={2.5} />
              <Wheat className="text-amber-500 mr-1" size={20} strokeWidth={2.5} />
              <Wheat className="text-amber-600" size={18} strokeWidth={2.5} />
              <Wheat className="text-amber-700 ml-1" size={14} strokeWidth={2.5} />
              <Wheat className="text-yellow-600 absolute -bottom-2 -right-3" size={12} strokeWidth={2.5} />
            </div>
          </div>
          
          <div className="mb-4">
            <MeasurementTabs deviceCode={deviceCode} searchTerm={searchTerm} wholeGrainData={wholeGrainData} ingredientsData={ingredientsData} impuritiesData={impuritiesData} allData={allData} notificationSettings={notificationSettings || []} isLoadingWholeGrain={isLoadingWholeGrain} isLoadingIngredients={isLoadingIngredients} isLoadingImpurities={isLoadingImpurities} isLoadingAllData={isLoadingAllData} onMeasurementClick={handleMeasurementClick} />
          </div>

          {/* Add Device History Table at the bottom with Suspense for lazy loading */}
          {deviceCode && deviceCode !== 'default' && <div className="px-0">
              <Suspense fallback={<div className="bg-white rounded-lg shadow-sm p-6 mb-4">
                  <h3 className="text-lg font-semibold mb-4">ประวัติข้อมูลทั้งหมด</h3>
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                  </div>
                </div>}>
                <DeviceHistoryTable deviceCode={deviceCode} />
              </Suspense>
            </div>}
        </div>
      </AppLayout>
    </CountdownProvider>;
}