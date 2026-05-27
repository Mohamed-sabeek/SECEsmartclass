import React from 'react';

const DashboardCardSkeleton = () => {
  return (
    <div className="w-full space-y-10 animate-pulse">
      {/* Welcome Banner Skeleton */}
      <div className="bg-gray-900 rounded-[2.5rem] p-12 relative overflow-hidden h-72 flex flex-col justify-center space-y-4">
        <div className="h-5 w-24 bg-gray-800 rounded-full"></div>
        <div className="h-10 w-96 bg-gray-800 rounded-xl"></div>
        <div className="h-5 w-3/4 bg-gray-800 rounded-lg"></div>
        <div className="flex gap-4">
          <div className="h-12 w-40 bg-gray-800 rounded-2xl"></div>
          <div className="h-12 w-36 bg-gray-800 rounded-2xl"></div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl flex flex-col justify-between h-48">
            <div className="flex justify-between items-center">
              <div className="w-14 h-14 bg-gray-200 rounded-2xl"></div>
              <div className="h-3 w-20 bg-gray-200 rounded-full"></div>
            </div>
            <div className="space-y-3">
              <div className="h-8 w-20 bg-gray-200 rounded-xl"></div>
              <div className="h-3 w-32 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardCardSkeleton;
