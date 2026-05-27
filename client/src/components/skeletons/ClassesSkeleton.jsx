import React from 'react';

const ClassesSkeleton = () => {
  return (
    <div className="w-full space-y-10 animate-pulse">
      {/* Header Area Shimmer */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="h-9 w-64 bg-gray-200 rounded-2xl"></div>
          <div className="h-4 w-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>

      {/* Grid of Class Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="bg-white rounded-[2.5rem] shadow-xl border border-gray-50 overflow-hidden flex flex-col h-[460px]">
            {/* Top gold bar placeholder */}
            <div className="h-3 bg-gray-200"></div>
            
            <div className="p-8 flex-1 space-y-6">
              {/* Icon & Dept badge */}
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl"></div>
                <div className="h-8 w-16 bg-gray-50 rounded-xl border border-gray-100"></div>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-3">
                <div className="h-7 w-3/4 bg-gray-200 rounded-lg"></div>
                <div className="h-3.5 w-1/2 bg-gray-200 rounded-md"></div>
              </div>

              {/* Subjects tags */}
              <div className="space-y-2">
                <div className="h-3 w-24 bg-gray-100 rounded"></div>
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-gray-50 rounded-lg"></div>
                  <div className="h-5 w-20 bg-gray-50 rounded-lg"></div>
                </div>
              </div>

              {/* Extra details row */}
              <div className="pt-6 border-t border-gray-50 flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50"></div>
                <div className="h-4 w-40 bg-gray-100 rounded-md"></div>
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="space-y-0.5">
              <div className="h-14 bg-gray-200"></div>
              <div className="h-14 bg-gray-50 border-t border-gray-100"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassesSkeleton;
