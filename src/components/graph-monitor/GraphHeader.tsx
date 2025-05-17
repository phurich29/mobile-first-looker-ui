
import React from "react";
import { Button } from "@/components/ui/button";
import { Save, Loader2, Plus } from "lucide-react";

interface GraphHeaderProps {
  showSaveIndicator: boolean;
  saving: boolean;
  onSaveGraphs: () => void;
  onAddGraph: () => void;
}

export const GraphHeader: React.FC<GraphHeaderProps> = ({
  showSaveIndicator,
  saving,
  onSaveGraphs,
  onAddGraph,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">กราฟมอนิเตอร์</h1>
        <p className="text-gray-600 text-sm mt-1 dark:text-gray-400">
          แสดงผลกราฟจากอุปกรณ์ต่างๆ ในรูปแบบ dashboard
        </p>
      </div>

      <div className="flex items-center mt-4 md:mt-0 gap-2">
        {(showSaveIndicator || saving) && (
          <div className="flex items-center text-sm text-purple-600 mr-2 dark:text-purple-400">
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
          onClick={onSaveGraphs} 
          variant="outline"
          size="sm"
          disabled={saving || (!showSaveIndicator)}
          className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white dark:border-gray-700"
        >
          <Save className="h-4 w-4 mr-2" />
          บันทึก
        </Button>

        <Button 
          onClick={onAddGraph} 
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900"
        >
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มกราฟ
        </Button>
      </div>
    </div>
  );
};
