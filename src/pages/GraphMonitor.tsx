import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { GraphSelector } from "@/components/graph-monitor/GraphSelector";
import { GraphDisplay } from "@/components/graph-monitor/GraphDisplay";
import { SelectedGraph } from "@/components/graph-monitor/types";
import { Plus, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { Separator } from "@/components/ui/separator";
import { BackgroundImage } from "@/components/graph-monitor/BackgroundImage";
import { useGraphPreferences } from "@/components/graph-monitor/hooks/useGraphPreferences";
import { GraphPresets } from "@/components/graph-monitor/GraphPresets";
import { useToast } from "@/hooks/use-toast";

const GraphMonitor = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedGraphs, setSelectedGraphs] = useState<SelectedGraph[]>([]);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  
  const { 
    savedGraphs, 
    loading: preferencesLoading, 
    saving,
    saveGraphPreferences,
    presets,
    activePreset,
    setActivePreset,
    createPreset,
    deletePreset
  } = useGraphPreferences();
  
  // Load saved preferences when component mounts
  useEffect(() => {
    if (!preferencesLoading && savedGraphs.length > 0) {
      setSelectedGraphs(savedGraphs);
    }
  }, [savedGraphs, preferencesLoading]);

  // Auto-save when graphs change (delayed to prevent too many saves)
  useEffect(() => {
    if (user && selectedGraphs.length > 0) {
      const timer = setTimeout(() => {
        // Always save to the current active preset, including Default
        saveGraphPreferences(selectedGraphs, activePreset);
      }, 2000); // 2-second delay before saving
      
      return () => clearTimeout(timer);
    }
  }, [selectedGraphs, activePreset]);

  // Show indicator that changes are pending save
  useEffect(() => {
    if (user && selectedGraphs.length > 0 && 
        JSON.stringify(selectedGraphs) !== JSON.stringify(savedGraphs)) {
      setShowSaveIndicator(true);
    } else {
      setShowSaveIndicator(false);
    }
  }, [selectedGraphs, savedGraphs, user]);

  const handleAddGraph = (graph: SelectedGraph) => {
    const newGraphs = [...selectedGraphs, graph];
    setSelectedGraphs(newGraphs);
    setSelectorOpen(false);
  };

  const handleRemoveGraph = (index: number) => {
    const newGraphs = selectedGraphs.filter((_, i) => i !== index);
    setSelectedGraphs(newGraphs);
  };

  const handleSaveGraphs = () => {
    if (user) {
      // Explicitly save to the current active preset, including Default
      saveGraphPreferences(selectedGraphs, activePreset);
    } else {
      toast({
        title: "กรุณาเข้าสู่ระบบ",
        description: "คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถบันทึกการตั้งค่าได้",
        variant: "destructive",
      });
    }
  };

  const handleCreatePreset = (name: string) => {
    createPreset(name, selectedGraphs);
  };

  const handleChangePreset = (preset: string) => {
    setActivePreset(preset);
  };

  const handleResetGraphs = () => {
    setSelectedGraphs([]);
    toast({
      title: "รีเซ็ตการตั้งค่าแล้ว",
      description: "ลบกราฟทั้งหมดออกจากการแสดงผลแล้ว",
      variant: "update",
    });
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      <BackgroundImage />
      <Header />

      <main className={`flex-1 p-4 ${isMobile ? 'pb-24' : 'ml-64'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Graph Monitor</h1>
              <p className="text-gray-600 text-sm mt-1">
                แสดงผลกราฟจากอุปกรณ์ต่างๆ ในรูปแบบ dashboard
              </p>
            </div>

            <div className="flex items-center mt-4 md:mt-0 gap-2">
              {(showSaveIndicator || saving) && (
                <div className="flex items-center text-sm text-purple-600 mr-2">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <>
                      <span>มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก</span>
                    </>
                  )}
                </div>
              )}
              
              <Button 
                onClick={handleSaveGraphs} 
                variant="outline"
                size="sm"
                disabled={saving || (!showSaveIndicator && selectedGraphs.length > 0)}
                className="bg-white hover:bg-gray-50"
              >
                <Save className="h-4 w-4 mr-2" />
                บันทึก
              </Button>

              <Button 
                onClick={() => setSelectorOpen(true)} 
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มกราฟ
              </Button>
            </div>
          </div>

          {user && (
            <GraphPresets 
              presets={presets}
              activePreset={activePreset}
              onChangePreset={handleChangePreset}
              onCreatePreset={handleCreatePreset}
              onDeletePreset={deletePreset}
              onResetGraphs={handleResetGraphs}
              saving={saving}
            />
          )}

          {preferencesLoading ? (
            <div className="bg-gray-50 border border-purple-200 rounded-lg p-8 text-center bg-opacity-90">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-16 h-16 bg-purple-200 rounded-full mb-4"></div>
                <div className="h-4 bg-purple-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-purple-200 rounded w-1/4 mb-6"></div>
                <div className="h-10 bg-purple-200 rounded w-32"></div>
              </div>
            </div>
          ) : selectedGraphs.length === 0 ? (
            <div className="bg-gray-50 border border-purple-200 rounded-lg p-8 text-center bg-opacity-90">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">ยังไม่มีกราฟที่เลือก</h3>
              <p className="text-gray-600 mb-6">คลิกปุ่ม "เพิ่มกราฟ" เพื่อเลือกอุปกรณ์และค่าที่ต้องการแสดง</p>
              <Button 
                onClick={() => setSelectorOpen(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มกราฟ
              </Button>
            </div>
          ) : (
            <GraphDisplay 
              selectedGraphs={selectedGraphs} 
              onRemoveGraph={handleRemoveGraph} 
            />
          )}
        </div>
      </main>

      <GraphSelector 
        open={selectorOpen} 
        onOpenChange={setSelectorOpen} 
        onSelectGraph={handleAddGraph}
      />

      <FooterNav />
    </div>
  );
};

export default GraphMonitor;
