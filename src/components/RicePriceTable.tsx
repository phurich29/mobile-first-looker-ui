import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const handlePdfClick = (pdfUrl: string) => {
    window.open(pdfUrl, "_blank");
  };

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-3/4">วันที่</TableHead>
              <TableHead className="text-center">ราคาข้าว</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ricePriceData.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.date}</TableCell>
                <TableCell className="text-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => handlePdfClick(item.pdfUrl)}
                          aria-label="ดูราคาข้าว"
                          className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-600 hover:bg-red-200 border-red-300 hover:text-red-700 rounded-md font-medium"
                        >
                          <FileText className="h-5 w-5" />
                          <span className="font-bold">PDF</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
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
