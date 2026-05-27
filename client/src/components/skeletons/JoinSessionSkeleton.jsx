import React from 'react';

const JoinSessionSkeleton = () => {
  return (
    <div className="w-full max-w-4xl mx-auto py-6 animate-pulse">
      {/* Top Header Placeholder */}
      <div className="text-center mb-12 flex flex-col items-center">
        <div className="w-20 h-20 bg-gray-200 rounded-3xl mb-8"></div>
        <div className="h-8 w-64 bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-4 w-96 bg-gray-200 rounded-lg"></div>
      </div>

      {/* Main Large Card Placeholder */}
      <div className="bg-white rounded-[3rem] p-24 shadow-xl border border-gray-100 flex flex-col items-center justify-center space-y-6 mb-8">
        <div className="w-24 h-24 bg-gray-100 rounded-3xl"></div>
        <div className="h-6 w-48 bg-gray-200 rounded-md"></div>
        <div className="h-4 w-80 bg-gray-200 rounded-md"></div>
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      {/* Two Small Cards at the Bottom */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-60">
        <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 flex items-center space-x-4">
          <div className="w-10 h-10 bg-white rounded-xl"></div>
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 bg-gray-200 rounded-lg"></div>
            <div className="h-2.5 w-48 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
        <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 flex items-center space-x-4">
          <div className="w-10 h-10 bg-white rounded-xl"></div>
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 bg-gray-200 rounded-lg"></div>
            <div className="h-2.5 w-48 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinSessionSkeleton;
