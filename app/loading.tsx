import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-medium text-gray-700">Loading...</h2>
        <p className="text-gray-500 mt-2">Please wait while we fetch the content.</p>
      </div>
    </div>
  );
} 