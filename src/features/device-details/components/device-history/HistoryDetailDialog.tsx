
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, Hash } from "lucide-react";
import { RiceQualityData } from "./types";
import { formatCellValue } from "./utils";

interface HistoryDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: RiceQualityData | null;
}

// Format thai_datetime directly without timezone conversion
const formatThaiDateTime = (dateString?: string): { date: string; time: string } => {
  if (!dateString) return { date: "ไม่มีข้อมูล", time: "ไม่มีข้อมูล" };
  
  // แยกส่วนวันที่และเวลาจาก thai_datetime โดยตรง
  if (dateString.includes('T')) {
    const [datePart, timePart] = dateString.split('T');
    // ตัดส่วน timezone และมิลลิวินาทีออก
    const timeOnly = timePart ? timePart.split('.')[0] : '';
    
    // แปลงรูปแบบวันที่จาก YYYY-MM-DD เป็น DD/MM/YYYY
    const [year, month, day] = datePart.split('-');
    const formattedDate = `${day}/${month}/${year}`;
    
    return { date: formattedDate, time: timeOnly };
  }
  
  return { date: dateString, time: "ไม่มีข้อมูล" };
};

export const HistoryDetailDialog: React.FC<HistoryDetailDialogProps> = ({
  open,
  onOpenChange,
  data
}) => {
  if (!data) return null;

  const { date, time } = formatThaiDateTime(data.thai_datetime);

  // Group fields by category for better organization
  const classificationFields = [
    { key: 'class1', label: 'ข้าวเต็มเมล็ด เกรด 1' },
    { key: 'class2', label: 'ข้าวเต็มเมล็ด เกรด 2' },
    { key: 'class3', label: 'ข้าวเต็มเมล็ด เกรด 3' },
    { key: 'whole_kernels', label: 'ข้าวเต็มเมล็ด' },
    { key: 'head_rice', label: 'ข้าวหัว' }
  ];

  const brokenRiceFields = [
    { key: 'total_brokens', label: 'ข้าวหักรวม' },
    { key: 'small_brokens', label: 'ข้าวหักเล็ก' },
    { key: 'small_brokens_c1', label: 'ข้าวหักเล็ก C1' }
  ];

  const defectFields = [
    { key: 'red_line_rate', label: 'อัตราเส้นแดง' },
    { key: 'yellow_rice_rate', label: 'อัตราข้าวเหลือง' },
    { key: 'black_kernel', label: 'เมล็ดดำ' },
    { key: 'partly_black_peck', label: 'จุดดำบางส่วน' },
    { key: 'partly_black', label: 'ดำบางส่วน' }
  ];

  const qualityFields = [
    { key: 'whiteness', label: 'ความขาว' },
    { key: 'process_precision', label: 'ความแม่นยำ' },
    { key: 'imperfection_rate', label: 'อัตราความไม่สมบูรณ์' },
    { key: 'sticky_rice_rate', label: 'อัตราข้าวเหนียว' }
  ];

  const impurityFields = [
    { key: 'impurity_num', label: 'จำนวนสิ่งปนเปื้อน' },
    { key: 'paddy_rate', label: 'อัตราข้าวเปลือก' }
  ];

  const specialFields = [
    { key: 'parboiled_red_line', label: 'เส้นแดงข้าวสวย' },
    { key: 'parboiled_white_rice', label: 'ข้าวขาวสวย' },
    { key: 'honey_rice', label: 'ข้าวน้ำผึ้ง' }
  ];

  const renderFieldGroup = (title: string, fields: { key: string; label: string }[]) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-emerald-700">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {fields.map(({ key, label }) => {
          const value = data[key as keyof RiceQualityData];
          return (
            <div key={key} className="flex justify-between items-center py-1">
              <span className="text-sm text-gray-600">{label}</span>
              <Badge variant="outline" className="font-mono text-xs">
                {formatCellValue(key, value)}
                {key !== 'device_code' && key !== 'thai_datetime' && '%'}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-700">
            <Hash className="h-5 w-5" />
            รายละเอียดการวิเคราะห์ข้าว
          </DialogTitle>
          
          {/* Header Info */}
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{time} น.</span>
            </div>
            <Badge variant="secondary">
              {data.device_code}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {renderFieldGroup("การจำแนกเกรด", classificationFields)}
            {renderFieldGroup("ข้าวหัก", brokenRiceFields)}
            {renderFieldGroup("ข้อบกพร่อง", defectFields)}
            {renderFieldGroup("คุณภาพ", qualityFields)}
            {renderFieldGroup("สิ่งปนเปื้อน", impurityFields)}
            {renderFieldGroup("ข้าวพิเศษ", specialFields)}
          </div>
        </ScrollArea>

        <Separator />

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            ปิด
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
