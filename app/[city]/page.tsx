import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getListings } from '@/lib/api/listings';
import { getCategories } from '@/lib/api/categories';
import { getCities, getCityBySlug } from '@/lib/api/cities';
import { getPromotions } from '@/lib/api/promotions';
import ListingGrid from '@/components/listings/ListingGrid';
import ListingSlider from '@/components/listings/ListingSlider';
import PromotionSlider from '@/components/promotions/PromotionSlider';
import { Listing } from '@/types';

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

// Mock forum data - replace with actual API calls when available
const getForumTopics = async () => {
  // This would be replaced with an actual API call to Discourse
  return [
    { id: 1, title: "Where to find best massage in NYC?", replies: 142, author: "JohnDoe" },
    { id: 2, title: "Rate your recent experience", replies: 89, author: "JaneSmith" },
    { id: 3, title: "New to the forum, need recommendations", replies: 67, author: "NewUser22" },
    { id: 4, title: "Best places in Chicago?", replies: 58, author: "ChiTown" },
    { id: 5, title: "Looking for recommendations in LA", replies: 45, author: "LALover" },
  ];
};

const getTopPosters = async () => {
  // This would be replaced with an actual API call to Discourse
  return [
    { rank: 1, username: "JohnDoe", posts: 346 },
    { rank: 2, username: "SuperUser", posts: 289 },
    { rank: 3, username: "ActivePoster", posts: 234 },
    { rank: 4, username: "RegularGuy", posts: 187 },
    { rank: 5, username: "TopContributor", posts: 156 },
  ];
};

const getTopPointEarners = async () => {
  // This would be replaced with an actual API call to Discourse
  return [
    { rank: 1, username: "ExpertUser", points: 4890 },
    { rank: 2, username: "JohnDoe", points: 3560 },
    { rank: 3, username: "HelpfulGuy", points: 2780 },
    { rank: 4, username: "TopHelper", points: 2340 },
    { rank: 5, username: "CommunityFan", points: 2120 },
  ];
};

interface CityPageProps {
  params: Promise<{
    city: string;
  }>;
}

export default async function CityPage({ params }: CityPageProps) {
  const { city: citySlug } = await params;
  
  // First, verify the city exists
  try {
    const cityResponse = await getCityBySlug(citySlug);
    const cityApiData = cityResponse.data;
    const cityData = Array.isArray(cityApiData) && cityApiData.length > 0 ? cityApiData[0] : cityApiData;
    
    if (!cityData) {
      notFound();
    }

    // Fetch data in parallel
    const [
      featuredListingsResponse, 
      latestListingsResponse, 
      categoriesResponse, 
      citiesResponse, 
      promotionsResponse,
      forumTopics,
      topPosters,
      topPointEarners
    ] = await Promise.all([
      getListings({ page: 1, pageSize: 24, featured: true, city: citySlug }),
      getListings({ page: 1, pageSize: 24, city: citySlug }),
      getCategories(),
      getCities(),
      getPromotions('home'),
      getForumTopics(),
      getTopPosters(),
      getTopPointEarners()
    ]);

    const featuredListings = featuredListingsResponse.data;
    const latestListings = latestListingsResponse.data;
    const categories = categoriesResponse.data;
    const cities = citiesResponse.data;
    const promotions = promotionsResponse.data;

    return (
      <div className="flex flex-col">
        {/* Hero Banner - Full Width */}
        <div className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 relative">
         
       {promotions.length > 0 && (
         <PromotionSlider promotions={promotions} />
       )}
         
       </div>

        {/* Latest Listings Section - Full Width with Slider */}
        <ListingSlider 
          listings={latestListings} 
          title={`Latest Listings in ${cityData.name}`} 
          viewAllLink={`/listings?city=${citySlug}`} 
          compact={true}
        />

        {/* Categories Section */}
        {categories.length > 0 && (
          <div className="w-full py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Browse by Category in {cityData.name}</h2>
                <p className="text-gray-600">Find exactly what you're looking for</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map(category => (
                  <Link
                    key={category.id}
                    href={`/${citySlug}/${category.slug}`}
                    className="bg-white border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all p-6 rounded-lg text-center group"
                  >
                    <div className="text-gray-700 group-hover:text-purple-600 font-medium">
                      {category.name}
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-8">
                <Link
                  href={`/all`}
                  className="text-purple-600 hover:text-purple-500 font-medium"
                >
                  View all categories across all cities →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Featured Listings Section - Full Width */}
        <div className="w-full bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Featured Listings in {cityData.name}</h2>
              <Link href={`/listings${buildQueryString({ city: citySlug, featured: 'true' })}`} className="text-purple-600 hover:text-purple-500 font-medium">
                View All
              </Link>
            </div>
            <ListingGrid 
              listings={featuredListings} 
              compact={true} 
              columns={6}
            />
          </div>
        </div>

        {/* Other Cities Section */}
        {cities.length > 1 && (
          <div className="w-full py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Explore Other Cities</h2>
                <p className="text-gray-600">Browse listings in other available cities</p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {cities.filter(city => city.slug !== citySlug).map(city => (
                  <Link
                    key={city.id}
                    href={`/${city.slug}`}
                    className="bg-white border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all px-6 py-3 rounded-lg text-gray-700 hover:text-purple-600 font-medium"
                  >
                    {city.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Forum Activity Section */}
        
      </div>
    );
  } catch (error) {
    console.error('Error fetching city data:', error);
    notFound();
  }
} 