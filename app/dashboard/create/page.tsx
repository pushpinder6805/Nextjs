'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { protectRoute } from '@/lib/auth/protectRoute';
import ListingForm from '@/components/listings/ListingForm';

export default function CreateListingPage() {
  useEffect(() => {
    // Protect this route - redirect if not authenticated
    protectRoute();
  }, []);
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Create New Listing</h1>
          <Link
            href="/dashboard"
            className="text-purple-600 hover:text-purple-500 font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
        <p className="mt-2 text-gray-600">
          Fill out the form below to create a new listing. Fields marked with * are required.
        </p>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <ListingForm />
      </div>
    </div>
  );
} 