
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface NotificationPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export function NotificationPagination({
  currentPage,
  totalPages,
  totalCount,
  onPageChange
}: NotificationPaginationProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white rounded-lg shadow-sm">
      <div className="flex-1 text-sm text-gray-700">
        <span>{t('notificationHistory', 'showing')} {totalCount > 0 ? ((currentPage - 1) * 10) + 1 : 0} {t('notificationHistory', 'to')} {Math.min(currentPage * 10, totalCount)} {t('notificationHistory', 'from')} {totalCount} {t('notificationHistory', 'entries')}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 py-1 h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="text-sm text-gray-700">
          {t('general', 'page')} <span className="font-medium">{currentPage}</span> {t('general', 'of')} <span className="font-medium">{totalPages}</span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
