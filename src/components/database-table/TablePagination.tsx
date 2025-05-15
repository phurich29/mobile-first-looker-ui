
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaginationProps } from "./types";

export function TablePagination({
  currentPage,
  rowLimit,
  totalCount,
  setCurrentPage,
  goToPage,
  setGoToPage,
  handleGoToPageSubmit
}: PaginationProps) {
  
  const maxPage = Math.ceil(totalCount / rowLimit);
  
  const goToFirstPage = () => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToNextPage = () => {
    if (currentPage < maxPage) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const goToLastPage = () => {
    if (currentPage !== maxPage) {
      setCurrentPage(maxPage);
    }
  };
  
  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-2 py-2 sm:px-6 mt-2">
      <div className="flex flex-1 items-center justify-between sm:hidden">
        <Button
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          variant="outline"
          size="icon"
          className="h-7 w-12 p-0"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        
        <div className="flex items-center space-x-1">
          <form onSubmit={handleGoToPageSubmit} className="flex items-center space-x-1">
            <Select
              value={currentPage.toString()}
              onValueChange={(value) => setCurrentPage(parseInt(value))}
            >
              <SelectTrigger className="w-[70px] h-7 text-xs px-2">
                <span className="text-xs">หน้า {currentPage}</span>
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {Array.from({length: Math.min(maxPage, 20)}, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    หน้า {i + 1}
                  </SelectItem>
                ))}
                {maxPage > 20 && (
                  <div className="p-2 border-t">
                    <Input
                      type="number"
                      placeholder="ไปหน้า..."
                      value={goToPage}
                      onChange={(e) => setGoToPage(e.target.value)}
                      className="h-7 text-xs"
                      min={1}
                      max={maxPage}
                    />
                    <div className="pt-1">
                      <Button 
                        size="sm" 
                        className="w-full h-6 text-xs" 
                        onClick={handleGoToPageSubmit}
                      >
                        ไป
                      </Button>
                    </div>
                  </div>
                )}
              </SelectContent>
            </Select>
          </form>
        </div>
        
        <Button
          onClick={goToNextPage}
          disabled={currentPage >= maxPage}
          variant="outline"
          size="icon"
          className="h-7 w-12 p-0"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
      
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-gray-700">
            แสดง{" "}
            <span className="font-medium">{Math.min(rowLimit, totalCount - (currentPage - 1) * rowLimit)}</span>{" "}
            จาก{" "}
            <span className="font-medium">{totalCount}</span>{" "}
            รายการ
          </p>
        </div>
        
        <div className="flex items-center space-x-1.5">
          <Button
            onClick={goToFirstPage}
            disabled={currentPage === 1}
            variant="outline"
            size="icon"
            className="h-7 w-7 p-0"
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>
          
          <Button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            variant="outline"
            size="icon"
            className="h-7 w-7 p-0"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          
          <div className="flex items-center space-x-1">
            <form onSubmit={handleGoToPageSubmit} className="flex items-center space-x-1">
              <span className="text-xs">หน้า</span>
              <Input
                type="text"
                value={goToPage}
                onChange={(e) => setGoToPage(e.target.value)}
                className="h-7 w-12 text-center text-xs"
              />
              <span className="text-xs">จาก {maxPage}</span>
              <Button type="submit" variant="outline" size="sm" className="h-7 px-2 py-0 text-xs">
                ไป
              </Button>
            </form>
          </div>
          
          <Button
            onClick={goToNextPage}
            disabled={currentPage >= maxPage}
            variant="outline"
            size="icon"
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          
          <Button
            onClick={goToLastPage}
            disabled={currentPage >= maxPage}
            variant="outline"
            size="icon"
            className="h-7 w-7 p-0"
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
