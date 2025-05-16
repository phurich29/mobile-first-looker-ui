
import React from "react";

export const LoadingGraphState: React.FC = () => {
  return (
    <div className="bg-gray-50 border border-purple-200 rounded-lg p-8 text-center bg-opacity-90">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-16 h-16 bg-purple-200 rounded-full mb-4"></div>
        <div className="h-4 bg-purple-200 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-purple-200 rounded w-1/4 mb-6"></div>
        <div className="h-10 bg-purple-200 rounded w-32"></div>
      </div>
    </div>
  );
};
