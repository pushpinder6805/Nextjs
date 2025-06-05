import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getListings } from '@/lib/api/listings';
import { getCategories } from '@/lib/api/categories';
import { getCities } from '@/lib/api/cities';
import { getPromotions } from '@/lib/api/promotions';
import ListingGrid from '@/components/listings/ListingGrid';
import ListingSlider from '@/components/listings/ListingSlider';
import PromotionSlider from '@/components/promotions/PromotionSlider';
import { Listing, Category } from '@/types';

// Add ISR revalidation - revalidate every 60 seconds
export const revalidate = 60;

// Ensure this page is always dynamic for immediate updates
export const dynamic = 'force-dynamic';

// Helper function to build query strings
const buildQueryString = (params: Record<string, string | undefined>) => {
  const urlParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) urlParams.append(key, value);
  });
  
  const queryString = urlParams.toString();
  return queryString ? `?${queryString}` : '';
};

// Component for Category section
const CategorySection = ({ category, listings }: { category: Category; listings: Listing[] }) => {
  if (listings.length === 0) return null;
  
  // Sort listings: if categoryPosition is available, use it, otherwise oldest first
  const sortedListings = [...listings].sort((a, b) => {
    // If both have category positions, sort by position
    if (a.categoryPosition && b.categoryPosition) {
      return a.categoryPosition - b.categoryPosition;
    }
    // If only one has position, prioritize it
    if (a.categoryPosition && !b.categoryPosition) return -1;
    if (!a.categoryPosition && b.categoryPosition) return 1;
    // Otherwise sort by date (oldest first)
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
            <Link href={`/${listing.city.slug}/${listing.category.slug}/${listing.slug}`} key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-32 bg-gray-200">
                {listing.images && listing.images.length > 0 ? (
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

export default async function HomePage() {
  try {
    // First fetch cities and categories to get the first city
    const [
      categoriesResponse, 
      citiesResponse, 
      promotionsResponse
    ] = await Promise.all([
      getCategories(),
      getCities(),
      getPromotions('home')
    ]);

    const categories = categoriesResponse.data || [];
    const cities = citiesResponse.data || [];
    const promotions = promotionsResponse.data || [];

    // Get the last city for filtering latest listings (fixed array access)
    const firstCity = cities.length > 0 ? cities[cities.length - 1] : null;

    // Now fetch latest listings filtered by first city
    const latestListingsResponse = await getListings({ 
      page: 1, 
      pageSize: 10, 
      city: firstCity?.slug, // Filter by first city
      approvalStatus: "published" 
    }).catch(() => ({ data: [], meta: {} }));

    const latestListings = latestListingsResponse.data || [];

    // Fetch all listings for each category separately (no overflow logic)
    const categoryListings = await Promise.all(
      categories
        .filter(category => ['test', 'test2'].includes(category.slug)) // Include both test categories for proper testing
        .map(async (category) => {
          try {
            const response = await getListings({ 
              page: 1, 
              pageSize: 50, // Get more listings to show all in category
              category: category.slug,
              city: firstCity?.slug,
              approvalStatus: "published"
            });
            return { category, listings: response.data || [] };
          } catch (error) {
            console.error(`Error fetching listings for category ${category.slug}:`, error);
            return { category, listings: [] };
          }
        })
    );

    // Filter out categories with no listings
    const filteredCategoryListings = categoryListings.filter(({ listings }) => listings.length > 0);

    return (
      <div className="flex flex-col">
        {/* Hero Banner - Full Width */}
        <div className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 relative">
          {promotions.length > 0 && (
            <PromotionSlider promotions={promotions} />
          )}
        </div>

        {/* Latest Listings Section - Restored Horizontal Slider */}
        <ListingSlider 
          listings={latestListings} 
          title={`Latest Listings ${firstCity ? `in ${firstCity.name}` : ''}`}
          viewAllLink="/listings" 
          compact={true}
        />

        {/* Category Sections */}
        <div className="w-full bg-gray-50">
          {filteredCategoryListings.map(({ category, listings }) => (
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
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    
    return (
      <div className="flex flex-col">
        <div className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Welcome to Lust66</h1>
            <p className="text-xl">Your premier classified listings platform</p>
          </div>
        </div>
        
        <div className="w-full py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-lg font-medium text-gray-700">No listings available</h3>
            <p className="text-gray-500 mt-2">Check back later for new listings.</p>
          </div>
        </div>
      </div>
    );
  }
}
