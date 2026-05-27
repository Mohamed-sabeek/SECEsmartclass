import React from 'react';

const SessionSkeleton = () => {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Session Title and Description Placeholders */}
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
        <div className="space-y-2">
          <div className="h-5 w-48 bg-gray-200 rounded-lg"></div>
          <div className="h-3 w-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      {/* Dynamic Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md space-y-4">
            <div className="h-5 w-24 bg-gray-200 rounded-lg"></div>
            <div className="space-y-2">
              <div className="h-6 w-3/4 bg-gray-200 rounded-md"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded-md"></div>
            </div>
            <div className="h-10 w-full bg-gray-100 rounded-xl"></div>
            <div className="h-10 w-full bg-gray-200 rounded-xl"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionSkeleton;
