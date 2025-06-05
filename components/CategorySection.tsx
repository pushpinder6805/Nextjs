'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Listing, Category } from '@/types';

const CategorySection = ({ category, listings }: { category: Category; listings: Listing[] }) => {
  if (listings.length === 0) return null;

  const sortedListings = [...listings].sort((a, b) => {
    if (a.categoryPosition && b.categoryPosition) {
      return a.categoryPosition - b.categoryPosition;
    }
    if (a.categoryPosition && !b.categoryPosition) return -1;
    if (!a.categoryPosition && b.categoryPosition) return 1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return (
    <div className="w-full py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{category.name}</h2>
          <Link 
            href={`/all/${category.slug}`} 
            className="text-purple-600 hover:text-purple-500 font-medium"
          >
            View All in {category.name}
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {sortedListings.map((listing) => (
            <Link 
              href={`/${listing.city.slug}/${listing.category.slug}/${listing.slug}`} 
              key={listing.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-32 bg-gray-200">
                {listing.images?.length > 0 ? (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL}${listing.images[0].url}`}
                    alt={listing.title}
                    className="object-cover"
                    fill
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No image</span>
                  </div>
                )}
                {listing.featured && (
                  <div className="absolute top-1 right-1">
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-1 py-0.5 rounded font-medium">
                      Featured
                    </span>
                  </div>
                )}
              </div>

              <div className="p-3">
                <h3 className="text-xs font-semibold text-gray-900 truncate hover:text-purple-600 transition-colors">
                  {listing.title}
                </h3>
                {listing.phone && (
                  <div className="mt-2 text-xs text-gray-700">
                    {listing.phone}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {sortedListings.length >= 6 && (
          <div className="text-center mt-4">
            <Link 
              href={`/all/${category.slug}`}
              className="text-purple-600 hover:text-purple-500 text-sm font-medium"
            >
              View all {category.name} listings →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategorySection;
