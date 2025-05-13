
import { Button } from "@/components/ui/button";
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Check, X } from "lucide-react";

interface DeviceUserTableProps {
  isLoading: boolean;
  items: { id: string; name: string }[];
  hasAccess: (itemId: string) => boolean;
  onToggleAccess: (itemId: string) => Promise<void>;
  isUserTable?: boolean;
}

export function DeviceUserTable({
  isLoading,
  items,
  hasAccess,
  onToggleAccess,
  isUserTable = false
}: DeviceUserTableProps) {
  return (
    <ResponsiveTable>
      <TableHeader>
        <TableRow>
          <TableHead>{isUserTable ? 'อีเมล' : 'รหัสอุปกรณ์'}</TableHead>
          <TableHead className="text-right">การเข้าถึง</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={2} className="text-center">
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
              </div>
            </TableCell>
          </TableRow>
        ) : items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
              {isUserTable ? 'ไม่พบข้อมูลผู้ใช้' : 'ไม่พบข้อมูลอุปกรณ์'}
            </TableCell>
          </TableRow>
        ) : (
          items.map(item => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant={hasAccess(item.id) ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => onToggleAccess(item.id)}
                >
                  {hasAccess(item.id) ? (
                    <>
                      <X className="h-3.5 w-3.5 mr-1" />
                      <span>ยกเลิกสิทธิ์</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1" />
                      <span>ให้สิทธิ์</span>
                    </>
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </ResponsiveTable>
  );
}
