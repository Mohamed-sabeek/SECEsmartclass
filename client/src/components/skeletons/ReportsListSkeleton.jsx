import React from 'react';

const ReportsListSkeleton = () => {
  return (
    <div className="w-full space-y-10 animate-pulse">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div className="space-y-3">
          <div className="h-9 w-64 bg-gray-200 rounded-2xl"></div>
          <div className="h-4 w-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>

      {/* 4 Filters Row Shimmer */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 bg-white border border-gray-100 rounded-[1.5rem] shadow-sm"></div>
        ))}
      </div>

      {/* Table List Shimmer */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
        {/* Table Headings placeholder */}
        <div className="px-10 py-6 border-b border-gray-50 bg-gray-50/50 flex justify-between">
          <div className="h-4 w-32 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-24 bg-gray-200 rounded-lg hidden md:block"></div>
          <div className="h-4 w-20 bg-gray-200 rounded-lg"></div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-50">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="px-10 py-6 flex items-center justify-between">
              {/* Academic Block and details */}
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-10 h-10 bg-gray-100 rounded-xl shrink-0"></div>
                <div className="space-y-2">
                  <div className="h-4 w-36 bg-gray-200 rounded-md"></div>
                  <div className="h-3 w-28 bg-gray-200 rounded-md"></div>
                </div>
              </div>
              
              {/* Date & Timing */}
              <div className="h-4 w-20 bg-gray-200 rounded-md flex-1 hidden md:block text-center mx-auto"></div>
              
              {/* Timing info */}
              <div className="h-6 w-24 bg-gray-100 rounded-xl flex-1 text-center mx-auto"></div>
              
              {/* Scanned/Attendance Count */}
              <div className="h-4 w-12 bg-gray-200 rounded-md flex-1 hidden lg:block mx-auto text-center"></div>
              
              {/* Action arrow button */}
              <div className="w-10 h-10 bg-gray-50 rounded-xl shrink-0"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsListSkeleton;
