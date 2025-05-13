
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

interface RicePrice {
  date: string;
  pdfUrl: string;
}

const ricePriceData: RicePrice[] = [
  {
    date: "29 เมษายน 2568",
    pdfUrl: "http://www.thairicemillers.org/images/introc_1429264173/Pricerice29042568.pdf"
  }
];

export function RicePriceTable() {
  const isMobile = useIsMobile();
  
  const handlePdfClick = (pdfUrl: string) => {
    window.open(pdfUrl, "_blank");
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-0">
      <div className="rounded-xl border border-gray-200 shadow-lg overflow-hidden w-full">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-emerald-600 to-emerald-700">
              <TableHead className="w-2/3 py-3 text-white font-bold text-base tracking-wide px-6">
                <div className="flex items-center gap-2">
                  <span className="text-lg">วันที่</span>
                </div>
              </TableHead>
              <TableHead className="text-center py-3 text-white font-bold text-base tracking-wide px-6">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg">ราคาข้าว</span>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ricePriceData.map((item, index) => (
              <TableRow 
                key={index}
                className={index % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-50 hover:bg-gray-100"}
              >
                <TableCell className="font-medium text-gray-800 py-3 border-b px-6 text-base">
                  <div className="flex items-center">
                    {item.date}
                  </div>
                </TableCell>
                <TableCell className="text-center py-3 border-b px-6">
                  <div className="flex items-center justify-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => handlePdfClick(item.pdfUrl)}
                            aria-label="ดูราคาข้าว"
                            className={`flex items-center gap-2 ${isMobile ? 'px-3 py-2' : 'px-5 py-2.5'} bg-red-100 text-red-600 hover:bg-red-200 border-red-300 hover:text-red-700 rounded-md font-medium shadow-sm transition-all hover:shadow-md`}
                          >
                            <FileText className={`${isMobile ? 'h-5 w-5' : 'h-5 w-5'}`} />
                            <span className="font-bold text-sm">PDF</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-gray-800 text-white px-3 py-1.5 rounded-md">
                          <p>คลิกเพื่อดูราคาข้าว</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
