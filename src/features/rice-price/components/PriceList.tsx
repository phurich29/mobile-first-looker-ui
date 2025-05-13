
import { useIsMobile } from "@/hooks/use-mobile";
import { RicePrice } from "@/features/user-management/types";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/features/user-management/utils";
import { formatThaiDate, getPriceColorClass, formatPrice } from "../utils";
import { cn } from "@/lib/utils";

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
          {!isMobile && (
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อข้าว</TableHead>
                <TableHead>ราคา (บาท/100กก.)</TableHead>
                <TableHead>วันที่</TableHead>
                <TableHead className="text-right">การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
          )}
          <TableBody>
            {ricePrices && ricePrices.length > 0 ? (
              ricePrices.map((price) => (
                isMobile ? (
                  <TableRow key={price.id} className="flex flex-col py-2 border-b">
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-1">
                      <TableCell className="whitespace-normal p-2 border-0">
                        <div className="text-xs font-semibold text-gray-500">ชื่อข้าว</div>
                        <div className="font-medium">{price.name}</div>
                      </TableCell>
                      <TableCell className={cn("p-2 border-0", getPriceColorClass(price.priceColor))}>
                        <div className="text-xs font-semibold text-gray-500">ราคา (บาท/100กก.)</div>
                        <div className="font-medium">{formatPrice(price.price)}</div>
                      </TableCell>
                    </div>
                    <div className="flex">
                      <TableCell className="whitespace-normal p-2 border-0 flex-1">
                        <div className="text-xs font-semibold text-gray-500">วันที่</div>
                        <div>{price.document_date ? formatThaiDate(price.document_date) : '-'}</div>
                      </TableCell>
                    </div>
                    <div className="flex justify-between border-0 mt-1 px-2">
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
                  </TableRow>
                ) : (
                  <TableRow key={price.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="font-medium">{price.name}</div>
                    </TableCell>
                    <TableCell className={getPriceColorClass(price.priceColor)}>
                      {formatPrice(price.price)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {price.document_date ? formatThaiDate(price.document_date) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
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
                )
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">ไม่พบข้อมูลราคาข้าว</TableCell>
              </TableRow>
            )}
          </TableBody>
        </ResponsiveTable>
      </CardContent>
    </Card>
  );
}
