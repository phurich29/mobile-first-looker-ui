
import { useIsMobile } from "@/hooks/use-mobile";
import { RicePriceDocument } from "@/features/user-management/types";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/features/user-management/utils";
import { formatThaiDate } from "../utils";

interface DocumentListProps {
  documents: RicePriceDocument[] | undefined;
  onDelete: (document: RicePriceDocument) => void;
}

export function DocumentList({ documents, onDelete }: DocumentListProps) {
  const isMobile = useIsMobile();

  return (
    <Card>
      <CardHeader>
        <CardTitle>เอกสารราคาข้าวจากสมาคมโรงสีข้าวไทย</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveTable>
          <TableHeader>
            <TableRow>
              <TableHead>วันที่</TableHead>
              <TableHead>ลิงก์เอกสาร</TableHead>
              <TableHead>อัพเดทเมื่อ</TableHead>
              <TableHead className="text-right">การจัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents && documents.length > 0 ? (
              documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell className={isMobile ? "whitespace-normal" : "whitespace-nowrap"}>
                    {formatThaiDate(document.document_date)}
                  </TableCell>
                  <TableCell>
                    <a 
                      href={document.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      ดูเอกสาร
                    </a>
                  </TableCell>
                  <TableCell className={isMobile ? "whitespace-normal" : "whitespace-nowrap"}>
                    {formatDate(document.updated_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center text-red-600 hover:text-red-800"
                      onClick={() => onDelete(document)}
                    >
                      <Trash2 size={16} className="mr-1" />
                      ลบ
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">ไม่พบข้อมูลเอกสารราคาข้าว</TableCell>
              </TableRow>
            )}
          </TableBody>
        </ResponsiveTable>
      </CardContent>
    </Card>
  );
}
