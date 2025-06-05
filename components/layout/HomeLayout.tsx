// components/HomeLayout.tsx
import React from 'react';
import PromotionSlider from '@/components/promotions/PromotionSlider';
import ListingSlider from '@/components/listings/ListingSlider';
import { Category, Listing, City } from '@/types';
import CategorySection from './CategorySection'; // Extracted category section from your homepage code

interface HomeLayoutProps {
  promotions: any[];
  latestListings: Listing[];
  categoriesWithListings: { category: Category; listings: Listing[] }[];
  cities: City[];
  currentCity: City | null;
}

export default function HomeLayout({
  promotions,
  latestListings,
  categoriesWithListings,
  cities,
  currentCity,
}: HomeLayoutProps) {
  return (
    <div className="flex flex-col">
      {/* Hero Banner */}
      <div className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 relative">
        {promotions.length > 0 && <PromotionSlider promotions={promotions} />}
      </div>

      {/* Latest Listings */}
      <ListingSlider
        listings={latestListings}
        title={`Latest Listings ${currentCity ? `in ${currentCity.name}` : ''}`}
        viewAllLink="/listings"
        compact={true}
      />

      {/* Category Sections */}
      <div className="w-full bg-gray-50">
        {categoriesWithListings.map(({ category, listings }) => (
          <CategorySection key={category.id} category={category} listings={listings} />
        ))}
      </div>

      {/* Cities Section */}
      {cities.length > 0 && (
        <div className="w-full py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Browse by City</h2>
              <p className="text-gray-600">Select a city to view its listings</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {cities.map(city => (
                <Link
                  key={city.id}
                  href={`/${city.slug}`}
                  className="bg-white border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all px-4 py-3 rounded-lg text-center text-gray-700 hover:text-purple-600 font-medium"
                >
                  {city.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
