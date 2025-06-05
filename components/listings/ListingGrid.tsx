import React from 'react';
import { Listing } from '@/types';
import ListingCard from './ListingCard';

interface ListingGridProps {
  listings: Listing[];
  compact?: boolean;
  columns?: 3 | 4 | 6 | 8;
  className?: string;
  fullWidth?: boolean;
}

export default function ListingGrid({ 
  listings, 
  compact = false, 
  columns = 3,
  className = "",
  fullWidth = false
}: ListingGridProps) {
  if (!listings || listings.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-xl font-medium text-gray-700">No listings found</h3>
        <p className="text-gray-500 mt-2">Try adjusting your filters or check back later.</p>
      </div>
    );
  }

  // Determine the grid columns based on the columns prop
  let gridClass = "grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4";
  
  if (columns === 6) {
    gridClass = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
  } else if (columns === 8) {
    gridClass = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8";
  } else if (columns === 4) {
    gridClass = "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
  }

  const containerClass = fullWidth ? "w-full bg-gray-50 py-8" : "";
  const innerClass = fullWidth ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" : "";

  return (
    <div className={containerClass}>
      <div className={innerClass}>
        <div className={`grid ${gridClass} gap-4 ${className}`}>
          {listings.map((listing) => (
            <ListingCard 
              key={listing.id}
              listing={listing} 
              compact={compact}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 