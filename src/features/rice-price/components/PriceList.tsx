
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
    <div className="bg-transparent">
      <h3 className="text-lg font-semibold mb-3">รายการราคาข้าว</h3>
      <div className="w-full">
        <ResponsiveTable>
          {!isMobile && (
            <TableHeader>
              <TableRow className="bg-emerald-600">
                <TableHead className="py-2 text-sm font-bold text-white">ชื่อข้าว</TableHead>
                <TableHead className="py-2 text-sm font-bold text-white">ราคา (บาท/ก.ก.)</TableHead>
                <TableHead className="py-2 text-sm font-bold text-white">วันที่</TableHead>
                <TableHead className="py-2 text-sm font-bold text-white text-right">การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
          )}
          <TableBody>
            {ricePrices && ricePrices.length > 0 ? (
              ricePrices.map((price, index) => (
                isMobile ? (
                  <TableRow key={price.id} className="border-b py-2" style={{display: 'block'}}>
                    <div className="flex justify-between items-center mb-1 px-2 pt-2">
                      {/* บรรทัดแรก: ชื่อข้าวและราคา */}
                      <div className="flex-grow">
                        <div className="font-medium truncate" style={{maxWidth: '180px'}}>{price.name}</div>
                      </div>
                      <div className={cn("font-bold", getPriceColorClass(price.priceColor))}>
                        {formatPrice(price.price)} <span className="text-xs font-normal text-gray-500">บาท/ก.ก.</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center px-2 pb-2">
                      {/* บรรทัดที่สอง: วันที่และปุ่มจัดการ */}
                      <div className="text-xs text-gray-500">
                        {price.document_date ? formatThaiDate(price.document_date) : '-'}
                      </div>
                      <div className="flex space-x-1">  
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-2 flex items-center text-blue-600 hover:text-blue-800"
                          onClick={() => onEdit(price)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-2 flex items-center text-red-600 hover:text-red-800"
                          onClick={() => onDelete(price)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </TableRow>
                ) : (
                  <TableRow key={price.id} className={index % 2 === 0 ? 'bg-white' : 'bg-emerald-50'}>
                    <TableCell className="whitespace-nowrap py-2.5">
                      <div className="font-medium">{price.name}</div>
                    </TableCell>
                    <TableCell className={`py-2.5 ${getPriceColorClass(price.priceColor)}`}>
                      {formatPrice(price.price)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap py-2.5">
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
      </div>
    </div>
  );
}
