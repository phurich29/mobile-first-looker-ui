import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { 
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ 
  color, 
  onChange,
  className = ""
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline"
          size="sm" 
          className={`h-7 px-2 text-xs relative border-2 ${className}`}
          style={{ borderColor: color }}
        >
          <span className="mr-2">สีกราฟ</span>
          <div 
            className="w-4 h-4 rounded-full inline-block" 
            style={{ backgroundColor: color }} 
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3">
        <div className="space-y-2">
          <p className="text-sm font-medium mb-2">เลือกสีกราฟ</p>
          <HexColorPicker color={color} onChange={onChange} />
          <div className="flex items-center justify-between mt-2">
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

export default ColorPicker;
