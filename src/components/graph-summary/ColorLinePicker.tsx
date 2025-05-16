import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { 
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';

interface ColorLinePickerProps {
  color: string;
  onChange: (color: string) => void;
  metricName: string;
  deviceName: string;
}

export const ColorLinePicker: React.FC<ColorLinePickerProps> = ({ 
  color, 
  onChange,
  metricName,
  deviceName
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <div 
          className="w-3 h-3 rounded-full cursor-pointer transition-transform hover:scale-125"
          style={{ backgroundColor: color }}
          title="คลิกเพื่อเปลี่ยนสี"
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" side="right">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">เลือกสีเส้น</p>
            <p className="text-xs text-gray-500 truncate max-w-[150px]">{metricName}</p>
          </div>
          
          <HexColorPicker color={color} onChange={onChange} />
          
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs font-mono">{color}</div>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs h-6"
              onClick={() => setOpen(false)}
            >
              ตกลง
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColorLinePicker;
