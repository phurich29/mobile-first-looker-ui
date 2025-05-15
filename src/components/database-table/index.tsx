
import React from "react";
import { TableControls } from "./TableControls";
import { TableContent } from "./TableContent";
import { TablePagination } from "./TablePagination";
import { useDatabaseTable } from "./useDatabaseTable";

export function DatabaseTable() {
  const {
    data,
    loading,
    error,
    rowLimit,
    setRowLimit,
    currentPage,
    setCurrentPage,
    totalCount,
    goToPage,
    setGoToPage,
    columnKeys,
    fetchData,
    handleRefresh,
    handleGoToPageSubmit,
  } = useDatabaseTable();

  return (
    <div className="mt-8">
      <TableControls 
        rowLimit={rowLimit}
        setRowLimit={setRowLimit}
        handleRefresh={handleRefresh}
      />
      
      <div className="bg-white rounded-lg shadow">
        <TableContent 
          data={data}
          loading={loading}
          error={error}
          columnKeys={columnKeys}
          fetchData={fetchData}
        />
        
        {/* Pagination Controls */}
        {totalCount > 0 && (
          <TablePagination
            currentPage={currentPage}
            rowLimit={rowLimit}
            totalCount={totalCount}
            setCurrentPage={setCurrentPage}
            goToPage={goToPage}
            setGoToPage={setGoToPage}
            handleGoToPageSubmit={handleGoToPageSubmit}
          />
        )}
      </div>
    </div>
  );
}
