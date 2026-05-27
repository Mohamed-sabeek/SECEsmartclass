import React from 'react';

const StudentAttendanceSkeleton = () => {
  return (
    <div className="w-full space-y-10 animate-pulse">
      {/* 1. Header: Academic Metric */}
      <div className="space-y-3">
        <div className="h-9 w-64 bg-gray-200 rounded-2xl"></div>
        <div className="h-4 w-96 bg-gray-200 rounded-xl"></div>
      </div>

      {/* 2. Four Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl flex flex-col items-center space-y-4">
            <div className="w-10 h-10 bg-gray-100 rounded-full"></div>
            <div className="h-3 w-20 bg-gray-200 rounded-md"></div>
            <div className="h-7 w-12 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>

      {/* 3. Overall Participation Index banner card */}
      <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 space-y-6 w-full">
          <div className="h-6 w-56 bg-gray-200 rounded-lg"></div>
          {/* Progress bar placeholder */}
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="bg-gray-200 w-1/4 h-full rounded-full"></div>
          </div>
          <div className="h-3.5 w-3/4 bg-gray-200 rounded-md"></div>
        </div>
        {/* Large circular sync rate badge placeholder */}
        <div className="w-28 h-28 rounded-full border-4 border-gray-100 bg-gray-50 flex items-center justify-center shrink-0">
          <div className="w-16 h-16 rounded-full bg-gray-200"></div>
        </div>
      </div>

      {/* 4. Section: Attendance History Title & Filters */}
      <div className="space-y-6 pt-6">
        <div className="space-y-3">
          <div className="h-8 w-52 bg-gray-200 rounded-2xl"></div>
          <div className="h-4 w-80 bg-gray-200 rounded-xl"></div>
        </div>
        
        {/* Dropdown Filters placeholders */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="h-12 w-full sm:w-56 bg-gray-200 rounded-2xl"></div>
          <div className="h-12 w-full sm:w-56 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>

      {/* 5. Custom Student Roster Table */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
        {/* Table Column headers placeholders */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 grid grid-cols-5 gap-4">
          <div className="h-3.5 w-24 bg-gray-200 rounded"></div>
          <div className="h-3.5 w-16 bg-gray-200 rounded"></div>
          <div className="h-3.5 w-16 bg-gray-200 rounded"></div>
          <div className="h-3.5 w-20 bg-gray-200 rounded"></div>
          <div className="h-3.5 w-24 bg-gray-200 rounded text-right ml-auto"></div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-50">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="px-10 py-7 grid grid-cols-5 gap-4 items-center">
              {/* Module Name & Faculty info */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg shrink-0"></div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded-md"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded-md"></div>
                </div>
              </div>
              
              {/* Date */}
              <div>
                <div className="h-4 w-20 bg-gray-200 rounded-md"></div>
              </div>
              
              {/* Status badge */}
              <div>
                <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
              </div>
              
              {/* Window time */}
              <div>
                <div className="h-4 w-28 bg-gray-200 rounded-md"></div>
              </div>
              
              {/* Participation (%) */}
              <div className="space-y-2 text-right ml-auto">
                <div className="h-4 w-12 bg-gray-200 rounded-md ml-auto"></div>
                <div className="h-3.5 w-24 bg-gray-200 rounded-md ml-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentAttendanceSkeleton;
