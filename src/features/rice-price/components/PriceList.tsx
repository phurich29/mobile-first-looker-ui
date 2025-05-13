
import { useIsMobile } from "@/hooks/use-mobile";
import { RicePrice } from "@/features/user-management/types";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/features/user-management/utils";
import { formatThaiDate, getPriceColorClass } from "../utils";

interface PriceListProps {
  ricePrices: RicePrice[] | undefined;
  onEdit: (price: RicePrice) => void;
  onDelete: (price: RicePrice) => void;
}

export function PriceList({ ricePrices, onEdit, onDelete }: PriceListProps) {
  const isMobile = useIsMobile();

  return (
    <Card>
      <CardHeader>
        <CardTitle>รายการราคาข้าว</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveTable>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อข้าว</TableHead>
              <TableHead>ราคา (บาท/100กก.)</TableHead>
              <TableHead>วันที่</TableHead>
              <TableHead>อัพเดทเมื่อ</TableHead>
              <TableHead className="text-right">การจัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ricePrices && ricePrices.length > 0 ? (
              ricePrices.map((price) => (
                <TableRow key={price.id}>
                  <TableCell className={isMobile ? "whitespace-normal" : "whitespace-nowrap"}>
                    <div className="font-medium">{price.name}</div>
                  </TableCell>
                  <TableCell className={getPriceColorClass(price.priceColor)}>
                    {price.price !== null ? price.price.toLocaleString('th-TH') : "-"}
                  </TableCell>
                  <TableCell className={isMobile ? "whitespace-normal" : "whitespace-nowrap"}>
                    {price.document_date ? formatThaiDate(price.document_date) : '-'}
                  </TableCell>
                  <TableCell className={isMobile ? "whitespace-normal" : "whitespace-nowrap"}>
                    {formatDate(price.updated_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className={`flex ${isMobile ? "flex-col gap-1" : "justify-end space-x-2"}`}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center text-blue-600 hover:text-blue-800"
                        onClick={() => onEdit(price)}
                      >
                        <Edit size={16} className="mr-1" />
                        แก้ไข
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center text-red-600 hover:text-red-800"
                        onClick={() => onDelete(price)}
                      >
                        <Trash2 size={16} className="mr-1" />
                        ลบ
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">ไม่พบข้อมูลราคาข้าว</TableCell>
              </TableRow>
            )}
          </TableBody>
        </ResponsiveTable>
      </CardContent>
    </Card>
  );
}
