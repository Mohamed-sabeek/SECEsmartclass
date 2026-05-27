import React from 'react';

const SessionDetailsSkeleton = () => {
  return (
    <div className="animate-pulse space-y-10">
      {/* Top Navigation Shimmer */}
      <div className="h-6 w-36 bg-gray-200 rounded-md"></div>

      {/* Main Header Card Shimmer */}
      <div className="bg-gray-900 rounded-[2.5rem] p-12 shadow-2xl border border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4 flex-1">
            <div className="h-6 w-32 bg-gray-800 rounded-lg"></div>
            <div className="h-12 w-3/4 bg-gray-800 rounded-xl"></div>
            <div className="h-4 w-48 bg-gray-800 rounded-md"></div>
          </div>

          <div className="grid grid-cols-2 gap-8 md:gap-12 shrink-0 w-full md:w-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-24 bg-gray-800 rounded-md"></div>
                <div className="h-5 w-32 bg-gray-800 rounded-md"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance Log Table Shimmer */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/20 flex justify-between items-center">
          <div className="h-6 w-40 bg-gray-200 rounded-lg"></div>
          <div className="h-10 w-36 bg-gray-200 rounded-xl"></div>
        </div>
        <div className="divide-y divide-gray-50">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="px-10 py-6 flex items-center justify-between">
              <div className="h-8 w-24 bg-gray-100 rounded-lg"></div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="h-4 w-32 bg-gray-200 rounded-md"></div>
              </div>
              <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
              <div className="h-4 w-16 bg-gray-100 rounded-md"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SessionDetailsSkeleton;
