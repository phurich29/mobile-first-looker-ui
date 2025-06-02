
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Save, Trash2, Plus, RotateCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GraphPresetsProps {
  presets: { id: string; name: string }[];
  activePreset: string;
  onChangePreset: (preset: string) => void;
  onCreatePreset: (name: string) => void;
  onDeletePreset: (preset: string) => void;
  onResetGraphs: () => void;
  saving: boolean;
}

export const GraphPresets: React.FC<GraphPresetsProps> = ({
  presets,
  activePreset,
  onChangePreset,
  onCreatePreset,
  onDeletePreset,
  onResetGraphs,
  saving,
}) => {
  const [newPresetName, setNewPresetName] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  // Ensure active preset is always valid
  useEffect(() => {
    // If activePreset doesn't exist in presets, set it to "Default"
    if (presets.length > 0 && !presets.some(preset => preset.name === activePreset)) {
      onChangePreset("Default");
    }
  }, [presets, activePreset, onChangePreset]);

  const handleCreatePreset = () => {
    if (!newPresetName.trim()) {
      toast({
        title: "กรุณาระบุชื่อชุดการตั้งค่า",
        variant: "destructive",
      });
      return;
    }

    // Check if the preset name already exists
    if (presets.some(preset => preset.name === newPresetName.trim())) {
      toast({
        title: "ชื่อชุดการตั้งค่านี้มีอยู่แล้ว",
        description: "กรุณาใช้ชื่ออื่น",
        variant: "destructive",
      });
      return;
    }

    onCreatePreset(newPresetName);
    setNewPresetName("");
    setCreateDialogOpen(false);
  };

  const handleDeletePreset = () => {
    if (activePreset === "Default") {
      toast({
        title: "ไม่สามารถลบชุดการตั้งค่าหลักได้",
        variant: "destructive",
      });
      return;
    }

    onDeletePreset(activePreset);
    setDeleteDialogOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-2 mb-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={activePreset} onValueChange={onChangePreset}>
          <SelectTrigger className="w-[180px] h-8 text-xs">
            <SelectValue placeholder="เลือกชุดการตั้งค่า" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {presets.map((preset) => (
              <SelectItem key={preset.id} value={preset.name}>
                {preset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 flex items-center gap-1 text-xs">
              <Plus className="h-3.5 w-3.5" />
              <span>สร้างใหม่</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>สร้างชุดการตั้งค่าใหม่</DialogTitle>
              <DialogDescription>
                ชุดการตั้งค่าจะบันทึกรายการกราฟทั้งหมดที่กำลังแสดงผลอยู่
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="presetName" className="mb-2 block">
                ชื่อชุดการตั้งค่า
              </Label>
              <Input
                id="presetName"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="โปรดระบุชื่อ"
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="h-8 px-3 text-xs">ยกเลิก</Button>
              </DialogClose>
              <Button onClick={handleCreatePreset} className="h-8 px-3 text-xs">สร้าง</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {activePreset !== "Default" && (
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>ลบชุดนี้</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>ลบชุดการตั้งค่า</DialogTitle>
                <DialogDescription>
                  คุณแน่ใจหรือไม่ที่ต้องการลบชุดการตั้งค่า "{activePreset}"? การดำเนินการนี้ไม่สามารถย้อนกลับได้
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button variant="outline" className="h-8 px-3 text-xs">ยกเลิก</Button>
                </DialogClose>
                <Button
                  variant="destructive" className="h-8 px-3 text-xs"
                  onClick={handleDeletePreset}
                >
                  ลบ
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <Button
          variant="outline"
          size="sm"
          className="h-7 flex items-center gap-1 text-xs"
          onClick={onResetGraphs}
        >
          <RotateCw className="h-3.5 w-3.5" />
          <span>รีเซ็ต</span>
        </Button>
      </div>
    </div>
  );
};
