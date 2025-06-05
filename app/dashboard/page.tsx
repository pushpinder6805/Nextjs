'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { getUserListings } from '@/lib/api/listings';
import { Listing } from '@/types';
import { protectRoute } from '@/lib/auth/protectRoute';

// Define status types and their colors
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-blue-100 text-blue-800'
};

// Function to get color based on status with fallback
const getStatusColor = (approvalStatus: string | undefined): string => {
  return approvalStatus && STATUS_COLORS[approvalStatus] 
    ? STATUS_COLORS[approvalStatus] 
    : STATUS_COLORS.pending;
};

// Function to format status text
const formatStatusText = (status: string | undefined): string => {
  if (!status) return 'Pending';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loadUser } = useAuthStore();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Protect this route - redirect if not authenticated
    protectRoute();
    
    // Load user data if not already loaded
    const initializeUser = async () => {
      if (!user) {
        await loadUser();
      }
    };
    
    initializeUser();
  }, [user, loadUser]);
  
  useEffect(() => {
    // Fetch user's listings once we have the user ID
    const fetchUserListings = async () => {
      if (user?.id) {
        setIsLoading(true);
        try {
          const response = await getUserListings(user.id);
          setListings(response.data);
          console.log(response.data);
          setError(null);
        } catch (err) {
          setError('Failed to load your listings. Please try again.');
          console.error('Error fetching user listings:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchUserListings();
  }, [user]);
  
  if (!isAuthenticated) {
    return null; // Will be redirected by protectRoute
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {user?.username}! Manage your listings and create new ones.
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Your Listings</h2>
            <p className="text-gray-600 mt-1">
              You have {listings.length} {listings.length === 1 ? 'listing' : 'listings'}
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/dashboard/create"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md inline-block"
            >
              Create New Listing
            </Link>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading your listings...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="text-sm text-red-700 underline mt-1"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium text-gray-700">No listings yet</h3>
          <p className="text-gray-500 mt-2 mb-6">
            You haven't created any listings yet. Create your first listing now!
          </p>
          <Link
            href="/dashboard/create"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md inline-block"
          >
            Create Your First Listing
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Status filter tabs */}
          <div className="flex border-b border-gray-200">
            <button className="px-4 py-2 border-b-2 border-purple-500 text-purple-600 font-medium">
              All Listings
            </button>
            <button className="px-4 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Pending
            </button>
            <button className="px-4 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Approved
            </button>
          </div>
          
          {/* Listings with status */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing: Listing) => (
              <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-48 bg-gray-200">
                  {listing.images && listing.images.length > 0 ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}${listing.images[0].url}`}
                      alt={listing.title}
                      className="object-cover"
                      fill
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                  
                  {/* Status badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getStatusColor(listing.approvalStatus)
                    }`}>
                      {formatStatusText(listing.approvalStatus)}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{listing.title}</h3>
                  
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <span className="truncate">{listing.category.name}</span>
                    <span className="mx-1">•</span>
                    <span>{listing.city.name}</span>
                  </div>
                  
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{listing.description}</p>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm">
                      <span className={`${
                        getStatusColor(listing.approvalStatus)
                      } px-2 py-1 rounded-full text-xs`}>
                        {formatStatusText(listing.approvalStatus)}
                      </span>
                      <span className="text-gray-500 ml-2">
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link
                        href={`/dashboard/edit/${listing.documentId}`}
                        className="text-purple-600 hover:text-purple-500"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/${listing.city.slug}/${listing.category.slug}/${listing.slug}`}
                        className="text-gray-600 hover:text-gray-500"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 