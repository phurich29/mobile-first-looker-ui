
import React, { useState } from "react";
import { DeviceHistoryTableProps } from "./device-history/types";
import { useHistoryData } from "./device-history/useHistoryData";
import { HistoryTable } from "./device-history/HistoryTable";
import { HistoryDetailDialog } from "./device-history/HistoryDetailDialog";
import { RiceQualityData } from "./device-history/types";
import { getColumnKeys } from "./device-history/utils";

export const DeviceHistoryTable: React.FC<DeviceHistoryTableProps> = ({ deviceCode }) => {
  const [selectedRow, setSelectedRow] = useState<RiceQualityData | null>(null);
  
  const {
    historyData,
    totalCount,
    currentPage,
    totalPages,
    itemsPerPage,
    isLoading,
    error,
    setCurrentPage,
    setItemsPerPage
  } = useHistoryData(deviceCode);

  const handleRowClick = (row: RiceQualityData) => {
    setSelectedRow(row);
  };

  const handleCloseDialog = () => {
    setSelectedRow(null);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <h3 className="text-lg font-semibold mb-4">ประวัติข้อมูลทั้งหมด</h3>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <h3 className="text-lg font-semibold mb-4">ประวัติข้อมูลทั้งหมด</h3>
        <div className="text-center py-8 text-red-600">
          เกิดข้อผิดพลาดในการโหลดข้อมูล
        </div>
      </div>
    );
  }

  const columnKeys = getColumnKeys(historyData);

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">ประวัติข้อมูลทั้งหมด</h3>
          <span className="text-sm text-gray-500">
            แสดง {columnKeys.length + 1} คอลัมน์
          </span>
        </div>

        <HistoryTable
          historyData={historyData}
          totalCount={totalCount}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          onRowClick={handleRowClick}
        />
      </div>

      <HistoryDetailDialog
        selectedRow={selectedRow}
        onClose={handleCloseDialog}
      />
    </>
  );
};
