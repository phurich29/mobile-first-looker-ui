
import React from "react";

export function LoadingState() {
  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header Skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse mr-4"></div>
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-48"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
          </div>
        </div>
      </div>

      {/* Filter Skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notification Cards Skeleton */}
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 border-l-4 border-l-gray-200">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-full"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="flex space-x-4">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                </div>
              </div>
              <div className="space-y-2 text-right">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                <div className="h-7 bg-gray-200 rounded animate-pulse w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
