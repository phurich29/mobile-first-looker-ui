
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { RicePrice } from "@/features/user-management/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { getPriceColorClass, formatPrice } from "../utils";
import { formatThaiDate, getLatestUpdateTimestamp } from "../utils/formatting";

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
    <div className="space-y-6">
      <div className="rounded-md border">
        <ResponsiveTable>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อข้าว</TableHead>
              <TableHead className="text-right">ราคา (บาท/100กก.)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ricePrices.map((price) => (
              <TableRow key={price.id}>
                <TableCell className={isMobile ? "whitespace-normal break-words" : "whitespace-nowrap"}>{price.name}</TableCell>
                <TableCell className={`text-right font-medium ${getPriceColorClass(price.priceColor)}`}>
                  {formatPrice(price.price)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </ResponsiveTable>
      </div>
      <p className="text-xs text-gray-500 text-center mt-2">
        ราคาประจำวันที่: {documentDate}
      </p>
      <p className="text-xs text-gray-500 text-right mt-2 italic">
        อัพเดทล่าสุด: {getLatestUpdateTimestamp(ricePrices)}
      </p>
    </div>
  );
}
