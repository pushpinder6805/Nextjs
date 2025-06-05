'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { protectRoute } from '@/lib/auth/protectRoute';
import ListingForm from '@/components/listings/ListingForm';
import { getListingById } from '@/lib/api/listings';
import { Listing } from '@/types';

  export default function EditListingPage({ params }: any) {
  const router = useRouter();
  const { id } = params;
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Protect this route - redirect if not authenticated
    protectRoute();
    
    // Fetch the listing data
    const fetchListing = async () => {
      setIsLoading(true);
      try {
        const response = await getListingById(id);
        setListing(response.data);
      } catch (err) {
        setError('Failed to load listing. Please try again.');
        console.error('Error fetching listing:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchListing();
  }, [id]);
  
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading listing data...</p>
        </div>
      </div>
    );
  }
  
  if (error || !listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || 'Listing not found'}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <Link
            href="/dashboard"
            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-md"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Edit Listing</h1>
          <Link
            href="/dashboard"
            className="text-purple-600 hover:text-purple-500 font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
        <p className="mt-2 text-gray-600">
          Update your listing information below. Fields marked with * are required.
        </p>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <ListingForm initialData={listing} isEditing={true} />
      </div>
    </div>
  );
} 