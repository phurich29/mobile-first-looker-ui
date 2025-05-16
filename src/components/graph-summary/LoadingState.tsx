
import React from "react";

export const LoadingState: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-2 border-emerald-600 rounded-full border-t-transparent mx-auto"></div>
        <p className="mt-2 text-gray-500">กำลังโหลดข้อมูล...</p>
      </div>
    </div>
  );
};
