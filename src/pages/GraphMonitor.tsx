
import React, { useState } from "react";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { GraphSelector } from "@/components/graph-monitor/GraphSelector";
import { GraphDisplay } from "@/components/graph-monitor/GraphDisplay";
import { SelectedGraph } from "@/components/graph-monitor/types";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { Separator } from "@/components/ui/separator";

const GraphMonitor = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [selectedGraphs, setSelectedGraphs] = useState<SelectedGraph[]>([]);
  const [selectorOpen, setSelectorOpen] = useState(false);

  const handleAddGraph = (graph: SelectedGraph) => {
    setSelectedGraphs((prev) => [...prev, graph]);
    setSelectorOpen(false);
  };

  const handleRemoveGraph = (index: number) => {
    setSelectedGraphs((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className={`flex-1 p-4 ${isMobile ? 'pb-24' : 'ml-64'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Graph Monitor</h1>
              <p className="text-gray-600 text-sm mt-1">
                แสดงผลกราฟจากอุปกรณ์ต่างๆ ในรูปแบบ dashboard
              </p>
            </div>

            <Button 
              onClick={() => setSelectorOpen(true)} 
              className="mt-4 md:mt-0 bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มกราฟ
            </Button>
          </div>

          {selectedGraphs.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
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
