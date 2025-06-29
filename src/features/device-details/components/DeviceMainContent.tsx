
import React, { Suspense, useState } from "react";
import { AppLayout } from "@/components/layouts/app-layout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Wheat, BarChart3 } from "lucide-react";
import { DeviceHeader } from "./DeviceHeader";
import { MeasurementTabs } from "./MeasurementTabs";
import { NotificationSetting } from "../types";
import { lazy } from "react";
import { Button } from "@/components/ui/button";
import { GraphSelector } from "@/components/graph-monitor/GraphSelector";
import { SelectedGraph } from "@/components/graph-monitor/types";
import { useToast } from "@/components/ui/use-toast";

// Lazy load the DeviceHistoryTable component
const DeviceHistoryTable = lazy(() => import("./DeviceHistoryTable").then(module => ({
  default: module.DeviceHistoryTable
})));

interface DeviceMainContentProps {
  deviceCode: string;
  searchTerm: string;
  wholeGrainData: any[] | null;
  ingredientsData: any[] | null;
  impuritiesData: any[] | null;
  allData: any[] | null;
  notificationSettings: NotificationSetting[];
  isLoadingWholeGrain: boolean;
  isLoadingIngredients: boolean;
  isLoadingImpurities: boolean;
  isLoadingAllData: boolean;
  isGuest: boolean;
  onMeasurementClick: (symbol: string, name: string) => void;
}

export const DeviceMainContent: React.FC<DeviceMainContentProps> = ({
  deviceCode,
  searchTerm,
  wholeGrainData,
  ingredientsData,
  impuritiesData,
  allData,
  notificationSettings,
  isLoadingWholeGrain,
  isLoadingIngredients,
  isLoadingImpurities,
  isLoadingAllData,
  isGuest,
  onMeasurementClick
}) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [graphSelectorOpen, setGraphSelectorOpen] = useState(false);

  const handleAddGraph = (deviceCode: string, symbol: string, name: string, deviceName?: string) => {
    // Navigate to the device-specific graph monitor page
    const url = `/device/${deviceCode}/graphs`;
    
    // Store the selected graph info in sessionStorage for the graph monitor page to pick up
    const graphInfo = {
      deviceCode,
      symbol,
      name,
      deviceName
    };
    sessionStorage.setItem('pendingGraph', JSON.stringify(graphInfo));
    
    // Open in new tab/window
    window.open(url, '_blank');
    
    // Close the selector
    setGraphSelectorOpen(false);
    
    toast({
      title: "เปิดหน้า Graph Monitor",
      description: `กำลังเปิดหน้า Graph Monitor สำหรับ ${name} ในแท็บใหม่`,
    });
  };

  return (
    <AppLayout showFooterNav={true} contentPaddingBottom={isMobile ? 'pb-32' : 'pb-4'}>
      <div className="flex-1">
        <div className="px-[5%] mb-3 flex justify-between items-center md:px-0">
          <DeviceHeader deviceCode={deviceCode} />
          <div className="flex items-center gap-3">
            {/* Add Graph Button - Show for all users including guests */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGraphSelectorOpen(true)}
              className="flex items-center gap-2 bg-white/80 hover:bg-white/90 backdrop-blur-sm border-emerald-200 text-emerald-700 hover:text-emerald-800"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">เพิ่มกราฟ</span>
            </Button>
            
            {/* Wheat icon group with varied sizes and positions */}
            <div className="flex items-center relative">
              <Wheat className="text-amber-400 absolute -top-3 -left-8" size={16} strokeWidth={2.5} />
              <Wheat className="text-amber-500 mr-1" size={20} strokeWidth={2.5} />
              <Wheat className="text-amber-600" size={18} strokeWidth={2.5} />
              <Wheat className="text-amber-700 ml-1" size={14} strokeWidth={2.5} />
              <Wheat className="text-yellow-600 absolute -bottom-2 -right-3" size={12} strokeWidth={2.5} />
            </div>
          </div>
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
            onMeasurementClick={onMeasurementClick} 
          />
        </div>

        {/* Add Device History Table at the bottom - Show to all users including guests with proper container styling */}
        {deviceCode && deviceCode !== 'default' && (
          <div className="px-0">
            <div className="mt-8 bg-white/70 dark:bg-gray-800/40 p-5 rounded-xl border border-gray-100 dark:border-gray-800/30 shadow-md backdrop-blur-sm">
              <Suspense fallback={
                <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
                  <h3 className="text-lg font-semibold mb-4">ประวัติข้อมูลทั้งหมด</h3>
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                  </div>
                </div>
              }>
                <DeviceHistoryTable deviceCode={deviceCode} />
              </Suspense>
            </div>
          </div>
        )}
      </div>

      {/* Graph Selector Dialog - Filter to only show this device */}
      <GraphSelector 
        open={graphSelectorOpen} 
        onOpenChange={setGraphSelectorOpen} 
        onSelectGraph={handleAddGraph}
        deviceFilter={deviceCode}
      />
    </AppLayout>
  );
};
