
import { Button } from "@/components/ui/button";
import { RicePriceDocument } from "@/features/user-management/types";
import { ExternalLink, FileText } from "lucide-react";
import { formatThaiDate } from "../utils/formatting";
import { SAMPLE_RICE_DOCUMENTS } from "../utils";
import { useEffect, useState } from "react";

interface DocumentsTableTabProps {
  ricePriceDocuments: RicePriceDocument[] | undefined;
}

export function DocumentsTableTab({ ricePriceDocuments }: DocumentsTableTabProps) {
  const [displayDocs, setDisplayDocs] = useState<RicePriceDocument[]>([]);

  // Use sample data if no real data is available
  useEffect(() => {
    if (!ricePriceDocuments || ricePriceDocuments.length === 0) {
      console.log('No real document data, using sample data');
      setDisplayDocs(SAMPLE_RICE_DOCUMENTS as unknown as RicePriceDocument[]);
    } else {
      setDisplayDocs(ricePriceDocuments);
    }
  }, [ricePriceDocuments]);

  if (displayDocs.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">กำลังโหลดข้อมูลเอกสาร...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayDocs.map((document) => (
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
                {document.id.startsWith('doc-') ? 'ข้อมูลตัวอย่าง' : `อัพเดทเมื่อ: ${new Date(document.updated_at).toLocaleDateString('th-TH')}`}
              </p>
            </div>
          </div>
          <a 
            href={document.file_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 mt-2 sm:mt-0"
          >
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <ExternalLink size={14} />
              ดูเอกสาร
            </Button>
          </a>
        </div>
      ))}
    </div>
  );
}
