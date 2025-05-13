
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { RicePrice } from "@/features/user-management/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { getPriceColorClass, formatPrice } from "../utils";
import { formatThaiDate, getLatestUpdateTimestamp } from "../utils/formatting";
import { Wheat } from "lucide-react";

interface PriceTableTabProps {
  ricePrices: RicePrice[] | undefined;
}

export function PriceTableTab({ ricePrices }: PriceTableTabProps) {
  const isMobile = useIsMobile();

  if (!ricePrices || ricePrices.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">ไม่พบข้อมูลราคาข้าว</p>
      </div>
    );
  }

  // Get the document date from the first rice price entry
  const documentDate = ricePrices[0]?.document_date 
    ? formatThaiDate(ricePrices[0].document_date) 
    : 'ไม่ระบุวันที่';

  return (
    <div className="space-y-5">
      {/* หัวตารางแสดงวันที่ */}
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-semibold text-base text-gray-800">ตารางราคาข้าว</h3>
        <p className="text-sm font-medium text-gray-700">
          ประจำวันที่: <span className="text-emerald-600">{documentDate}</span>
        </p>
      </div>

      <div className="rounded-md">
        <ResponsiveTable>
          <TableHeader>
            <TableRow className="bg-emerald-600">
              <TableHead className="py-3 text-sm font-bold text-white">ชื่อข้าว</TableHead>
              <TableHead className="text-right py-3 text-sm font-bold text-white">ราคา (บาท/ก.ก.)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ricePrices.map((price, index) => (
              <TableRow key={price.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-emerald-50'} hover:bg-emerald-100`}>
                <TableCell className={`${isMobile ? "whitespace-normal break-words" : "whitespace-nowrap"} text-sm py-3 border-b border-emerald-100`}>
                  <div className="flex items-center gap-2">
                    <Wheat size={16} className={index % 2 === 0 ? "text-emerald-600" : "text-amber-600"} />
                    <span>{price.name}</span>
                  </div>
                </TableCell>
                <TableCell className={`text-right font-medium text-sm py-3 border-b border-emerald-100 ${getPriceColorClass(price.priceColor)}`}>
                  {formatPrice(price.price)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </ResponsiveTable>
      </div>
      <p className="text-xs text-gray-500 text-right mt-2 italic">
        อัพเดทล่าสุด: {getLatestUpdateTimestamp(ricePrices)}
      </p>
    </div>
  );
}
