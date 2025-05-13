
import { Button } from "@/components/ui/button";
import { RicePriceDocument } from "@/features/user-management/types";
import { FileText, FileType } from "lucide-react";
import { formatThaiDate } from "../utils/formatting";

interface DocumentsTableTabProps {
  ricePriceDocuments: RicePriceDocument[] | undefined;
}

export function DocumentsTableTab({ ricePriceDocuments }: DocumentsTableTabProps) {
  if (!ricePriceDocuments || ricePriceDocuments.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">ไม่พบเอกสารราคาข้าว</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {ricePriceDocuments.map((document) => (
        <div 
          key={document.id} 
          className="p-3 border rounded-md hover:bg-gray-50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
        >
          <div className="flex items-center">
            <FileText size={20} className="text-emerald-600 mr-2 flex-shrink-0" />
            <div>
              <p className="font-medium break-words">
                ราคาข้าวประจำวันที่ {formatThaiDate(document.document_date)}
              </p>
              <p className="text-xs text-gray-500">
                อัพเดทเมื่อ: {new Date(document.updated_at).toLocaleDateString('th-TH')}
              </p>
            </div>
          </div>
          <a 
            href={document.file_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 mt-2 sm:mt-0 ml-auto"
          >
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <FileType size={14} className="text-red-600" />
              ดูเอกสาร
            </Button>
          </a>
        </div>
      ))}
    </div>
  );
}
