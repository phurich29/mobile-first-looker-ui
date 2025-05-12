
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
    <div className="w-full">
      <div className="rounded-lg border shadow-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-emerald-500 to-emerald-600">
              <TableHead className="w-3/4 py-4 text-white font-bold text-base">
                วันที่
              </TableHead>
              <TableHead className="text-center py-4 text-white font-bold text-base">
                ราคาข้าว
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ricePriceData.map((item, index) => (
              <TableRow 
                key={index}
                className={index % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-50 hover:bg-gray-100"}
              >
                <TableCell className="font-medium text-gray-700 py-4 border-b">
                  {item.date}
                </TableCell>
                <TableCell className="text-center py-4 border-b">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => handlePdfClick(item.pdfUrl)}
                          aria-label="ดูราคาข้าว"
                          className={`flex items-center gap-2 ${isMobile ? 'px-2 py-1' : 'px-4 py-2'} bg-red-100 text-red-600 hover:bg-red-200 border-red-300 hover:text-red-700 rounded-md font-medium shadow-sm transition-all hover:shadow`}
                        >
                          <FileText className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} />
                          <span className="font-bold">PDF</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-800 text-white">
                        <p>คลิกเพื่อดูราคาข้าว</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
