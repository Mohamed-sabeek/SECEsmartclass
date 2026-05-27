import React from 'react';

const ProfileSkeleton = () => {
  return (
    <div className="max-w-6xl mx-auto animate-pulse">
      {/* Banner Skeleton */}
      <div className="bg-white rounded-[2.5rem] p-12 shadow-xl border border-gray-100 mb-10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-10">
          {/* Avatar Area */}
          <div className="relative transform rotate-2">
            <div className="w-48 h-48 rounded-[2.5rem] bg-gray-200 border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
            </div>
          </div>
          
          {/* Details Area */}
          <div className="flex-1 space-y-4 pb-2 w-full">
            <div className="h-6 w-32 bg-gray-200 rounded-full"></div>
            <div className="h-12 w-3/4 bg-gray-200 rounded-[1rem]"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Grid Content Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100">
          <div className="h-7 w-48 bg-gray-200 rounded-full mb-8"></div>
          <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 space-y-4">
            <div className="w-14 h-14 bg-gray-200 rounded-2xl"></div>
            <div className="space-y-2">
              <div className="h-3 w-24 bg-gray-200 rounded-full"></div>
              <div className="h-8 w-48 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100">
          <div className="h-7 w-48 bg-gray-200 rounded-full mb-8"></div>
          <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 space-y-4">
            <div className="w-14 h-14 bg-gray-200 rounded-2xl"></div>
            <div className="space-y-2">
              <div className="h-3 w-24 bg-gray-200 rounded-full"></div>
              <div className="h-8 w-48 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Skeleton */}
      <div className="bg-white rounded-[2.5rem] p-12 shadow-xl border border-gray-100">
        <div className="h-7 w-64 bg-gray-200 rounded-full mb-8"></div>
        <div className="space-y-6">
          <div className="h-12 w-full bg-gray-100 rounded-2xl"></div>
          <div className="h-12 w-full bg-gray-100 rounded-2xl"></div>
          <div className="h-12 w-full bg-gray-100 rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
