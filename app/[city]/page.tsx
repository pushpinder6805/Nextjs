import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getListings } from '@/lib/api/listings';
import { getCategories } from '@/lib/api/categories';
import CategorySection from '@/components/CategorySection';
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
  return [
    { id: 1, title: "Where to find best massage in NYC?", replies: 142, author: "JohnDoe" },
    { id: 2, title: "Rate your recent experience", replies: 89, author: "JaneSmith" },
    { id: 3, title: "New to the forum, need recommendations", replies: 67, author: "NewUser22" },
    { id: 4, title: "Best places in Chicago?", replies: 58, author: "ChiTown" },
    { id: 5, title: "Looking for recommendations in LA", replies: 45, author: "LALover" },
  ];
};

const getTopPosters = async () => {
  return [
    { rank: 1, username: "JohnDoe", posts: 346 },
    { rank: 2, username: "SuperUser", posts: 289 },
    { rank: 3, username: "ActivePoster", posts: 234 },
    { rank: 4, username: "RegularGuy", posts: 187 },
    { rank: 5, username: "TopContributor", posts: 156 },
  ];
};

const getTopPointEarners = async () => {
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

  try {
    const cityResponse = await getCityBySlug(citySlug);
    const cityApiData = cityResponse.data;
    const cityData = Array.isArray(cityApiData) && cityApiData.length > 0 ? cityApiData[0] : cityApiData;

    if (!cityData) {
      notFound();
    }

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
      getListings({ page: 1, pageSize: 10, city: citySlug }),
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

    // ⬇️ Build categoryListings dynamically after fetching categories
    const categoryListings = await Promise.all(
      categories.map(async (category) => {
        try {
          const response = await getListings({
            page: 1, // ✅ This is required
            category: category.slug,
            city: citySlug,
            pageSize: 50,
            approvalStatus: 'published'
          });
          return { category, listings: response.data || [] };
        } catch {
          return { category, listings: [] };
        }
      })
    );

    const filteredCategoryListings = categoryListings.filter(({ listings }) => listings.length > 0);

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

        
        {/* Category Section (Dynamic) */}
        <div className="w-full bg-gray-50">
          {filteredCategoryListings.map(({ category, listings }) => (
            <CategorySection key={category.id} category={category} listings={listings} />
          ))}
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

        

        {/* Forum Activity Section (Optional to implement later) */}
      </div>
    );
  } catch (error) {
    console.error('Error fetching city data:', error);
    notFound();
  }
}
