'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Listing } from '@/types';
import ListingCard from './ListingCard';

interface ListingSliderProps {
  listings: Listing[];
  title: string;
  viewAllLink?: string;
  compact?: boolean;
  autoScroll?: boolean;
  scrollInterval?: number;
}

export default function ListingSlider({
  listings,
  title,
  viewAllLink,
  compact = true,
  autoScroll = true,
  scrollInterval = 5000
}: ListingSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const scrollAmount = sliderRef.current.clientWidth * 0.75;
    sliderRef.current.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    });
    
    // Update buttons after scroll animation completes
    setTimeout(checkScroll, 300);
  };

  // Auto-scroll functionality
  useEffect(() => {
    if (autoScroll && !isHovered && listings.length > 0) {
      intervalRef.current = setInterval(() => {
        if (sliderRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
          
          // If we're at the end, instantly jump to start without animation
          if (scrollLeft + clientWidth >= scrollWidth - 10) {
            sliderRef.current.scrollTo({ left: 0 });
            // Then immediately trigger the next scroll
            setTimeout(() => scroll('right'), 5);
          } else {
            scroll('right');
          }
        }
      }, scrollInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoScroll, isHovered, listings.length, scrollInterval]);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [listings]);

  if (!listings || listings.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          {viewAllLink && (
            <a href={viewAllLink} className="text-purple-600 hover:text-purple-500 font-medium">
              View All
            </a>
          )}
        </div>
        
        <div className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Scroll buttons */}
          {canScrollLeft && (
            <button 
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
              aria-label="Scroll left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          {canScrollRight && (
            <button 
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
              aria-label="Scroll right"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          
          {/* Slider content */}
          <div 
            ref={sliderRef}
            className="flex overflow-x-auto gap-4 pb-2 hide-scrollbar scroll-smooth"
            onScroll={checkScroll}
          >
            {/* Show the last few items at the start for smooth infinite scroll */}
            {listings.slice(-3).map(listing => (
              <div key={`${listing.id}-clone-start`} className="flex-none w-48 sm:w-56">
                <ListingCard listing={listing} compact={compact} />
              </div>
            ))}
            
            {/* Original listings */}
            {listings.map(listing => (
              <div key={listing.id} className="flex-none w-48 sm:w-56">
                <ListingCard listing={listing} compact={compact} />
              </div>
            ))}
            
            {/* Show the first few items at the end for smooth infinite scroll */}
            {listings.slice(0, 3).map(listing => (
              <div key={`${listing.id}-clone-end`} className="flex-none w-48 sm:w-56">
                <ListingCard listing={listing} compact={compact} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Add this CSS to globals.css
// .hide-scrollbar::-webkit-scrollbar {
//   display: none;
// }
// .hide-scrollbar {
//   -ms-overflow-style: none;
//   scrollbar-width: none;
// } 