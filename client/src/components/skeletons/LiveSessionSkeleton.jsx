import React from 'react';

const LiveSessionSkeleton = () => {
  return (
    <div className="w-full space-y-10 animate-pulse">
      {/* Title Header area */}
      <div className="mb-10 space-y-3">
        <div className="h-9 w-72 bg-gray-200 rounded-2xl"></div>
        <div className="h-4 w-[400px] bg-gray-200 rounded-xl"></div>
      </div>

      {/* Stacked Card 1: Initialize Broadcast (Full Width) */}
      <div className="bg-white rounded-[2.5rem] p-12 border border-gray-100 shadow-xl space-y-10 relative">
        <div className="max-w-4xl space-y-8">
          {/* Icon, Title & Subtitle */}
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl"></div>
            <div className="h-7 w-64 bg-gray-200 rounded-lg"></div>
            <div className="h-3.5 w-96 bg-gray-200 rounded-md"></div>
          </div>

          {/* Form Fields: 3 Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3.5 w-24 bg-gray-150 rounded"></div>
                <div className="h-14 w-full bg-gray-50 rounded-2xl"></div>
              </div>
            ))}
          </div>

          {/* Big Full Width CTA Button */}
          <div className="h-16 w-full bg-gray-200 rounded-2xl"></div>
        </div>
      </div>

      {/* Stacked Card 2: Schedule Academic Session (Full Width) */}
      <div className="bg-white rounded-[2.5rem] p-12 border border-gray-100 shadow-xl space-y-10 relative">
        <div className="max-w-4xl space-y-8">
          {/* Icon, Title & Subtitle */}
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl"></div>
            <div className="h-7 w-72 bg-gray-200 rounded-lg"></div>
            <div className="h-3.5 w-[450px] bg-gray-200 rounded-md"></div>
          </div>

          {/* Inputs Row 1: 3 Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3.5 w-24 bg-gray-150 rounded"></div>
                <div className="h-14 w-full bg-gray-50 rounded-2xl"></div>
              </div>
            ))}
          </div>

          {/* Inputs Row 2: Date & Time Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3.5 w-24 bg-gray-150 rounded"></div>
                <div className="h-14 w-full bg-gray-50 rounded-2xl"></div>
              </div>
            ))}
          </div>

          {/* Big Full Width CTA Button */}
          <div className="h-16 w-full bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
};

export default LiveSessionSkeleton;
