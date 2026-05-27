import React from 'react';

const SessionReportSkeleton = () => {
  return (
    <div className="animate-pulse max-w-7xl mx-auto py-10 px-6 space-y-10">
      {/* Header Actions Shimmer */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="h-10 w-44 bg-gray-200 rounded-xl"></div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="h-12 w-full sm:w-36 bg-gray-200 rounded-2xl"></div>
          <div className="h-12 w-full sm:w-36 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>

      {/* Session Metadata Card Shimmer */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4 flex-1">
            <div className="flex items-center space-x-3">
              <div className="h-6 w-28 bg-gray-200 rounded-full"></div>
              <div className="h-6 w-24 bg-gray-100 rounded-full"></div>
            </div>
            <div className="h-12 w-3/4 bg-gray-200 rounded-2xl"></div>
            <div className="flex items-center gap-6 pt-2">
              <div className="h-5 w-32 bg-gray-100 rounded-md"></div>
              <div className="h-5 w-44 bg-gray-100 rounded-md"></div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto shrink-0">
            <div className="h-24 w-full sm:w-36 bg-gray-50 border border-gray-100 rounded-[2rem]"></div>
            <div className="h-24 w-full sm:w-36 bg-gray-200 rounded-[2rem]"></div>
          </div>
        </div>
      </div>

      {/* Advanced Filters Shimmer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-14 bg-white border border-gray-100 rounded-[2rem] shadow-sm"></div>
        <div className="h-14 bg-white border border-gray-100 rounded-[2rem] shadow-sm"></div>
        <div className="h-14 bg-white border border-gray-100 rounded-[2rem] shadow-sm"></div>
      </div>

      {/* Attendance Table Shimmer */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <div className="h-6 w-48 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-32 bg-gray-100 rounded-lg"></div>
        </div>
        <div className="divide-y divide-gray-50">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="px-10 py-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                <div className="space-y-2">
                  <div className="h-4 w-40 bg-gray-200 rounded-lg"></div>
                  <div className="h-3 w-28 bg-gray-100 rounded-lg"></div>
                </div>
              </div>
              <div className="h-4 w-16 bg-gray-100 rounded-lg hidden md:block"></div>
              <div className="h-4 w-16 bg-gray-100 rounded-lg hidden md:block"></div>
              <div className="h-8 w-24 bg-gray-50 border border-gray-100 rounded-xl"></div>
              <div className="h-6 w-20 bg-gray-200 rounded-xl"></div>
              <div className="h-6 w-24 bg-gray-100 rounded-xl hidden lg:block"></div>
              <div className="w-10 h-10 bg-gray-100 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SessionReportSkeleton;
