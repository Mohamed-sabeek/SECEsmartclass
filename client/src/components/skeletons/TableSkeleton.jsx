import React from 'react';

const TableSkeleton = () => {
  return (
    <div className="w-full space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-3">
          <div className="h-9 w-64 bg-gray-200 rounded-2xl"></div>
          <div className="h-4 w-96 bg-gray-200 rounded-xl"></div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="h-12 w-full sm:w-72 bg-gray-200 rounded-2xl"></div>
          <div className="h-12 w-full sm:w-64 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl flex items-center">
            <div className="w-14 h-14 bg-gray-200 rounded-2xl mr-6"></div>
            <div className="space-y-2">
              <div className="h-3 w-20 bg-gray-200 rounded-lg"></div>
              <div className="h-8 w-16 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between">
          <div className="h-4 w-32 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-24 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="divide-y divide-gray-50">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="px-10 py-6 flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                <div className="space-y-2">
                  <div className="h-4 w-36 bg-gray-200 rounded-lg"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
              <div className="h-4 w-12 bg-gray-200 rounded-lg flex-1 hidden md:block text-center mx-auto"></div>
              <div className="h-6 w-16 bg-gray-200 rounded-xl flex-1 text-center mx-auto"></div>
              <div className="h-4 w-28 bg-gray-200 rounded-full flex-1 hidden lg:block mx-auto"></div>
              <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableSkeleton;
