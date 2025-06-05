import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getListings } from '@/lib/api/listings';
import { getCityBySlug, getCities } from '@/lib/api/cities';
import { getCategoryBySlug } from '@/lib/api/categories';
import ListingGrid from '@/components/listings/ListingGrid';
import { Metadata } from 'next';

// Add ISR revalidation - revalidate every 60 seconds
export const revalidate = 60;

// Ensure this page is always dynamic for immediate updates
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{
    city: string;
    category: string;
  }>;
  searchParams: Promise<{ 
    page?: string;
    sort?: string;
    [key: string]: string | string[] | undefined;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug, category: categorySlug } = await params;
  
  try {
    const isAllCities = citySlug === 'all';
    
    const [categoryResponse, cityResponse] = await Promise.all([
      getCategoryBySlug(categorySlug),
      isAllCities ? Promise.resolve({ data: { name: 'All Cities', slug: 'all' } }) : getCityBySlug(citySlug)
    ]);
    
    const categoryData = Array.isArray(categoryResponse.data) && categoryResponse.data.length > 0 
      ? categoryResponse.data[0] 
      : categoryResponse.data;
    
    const cityData = isAllCities 
      ? { name: 'All Cities', slug: 'all' }
      : Array.isArray(cityResponse.data) && cityResponse.data.length > 0 
        ? cityResponse.data[0] 
        : cityResponse.data;
    
    if (!categoryData || (!isAllCities && !cityData)) {
      return {
        title: 'Category Not Found',
        description: 'The requested category could not be found.'
      };
    }
    
    const title = isAllCities 
      ? `${categoryData.name} - All Cities | Lust66`
      : `${categoryData.name} in ${cityData.name} | Lust66`;
    
    const description = isAllCities
      ? `Browse ${categoryData.name} listings from all cities on Lust66`
      : `Browse ${categoryData.name} listings in ${cityData.name} on Lust66`;
    
    return {
      title,
      description,
      openGraph: {
        title,
        description,
      },
    };
  } catch (error) {
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be found.'
    };
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { city: citySlug, category: categorySlug } = await params;
  const { page: pageSlug, sort: sortSlug} = await searchParams;
  
  const page = parseInt(pageSlug || '1', 10);
  const sort = sortSlug || 'createdAt:desc';
  const isAllCities = citySlug === 'all';
  
  try {
    // Fetch category data (required)
    const categoryResponse = await getCategoryBySlug(categorySlug);
    const categoryData = Array.isArray(categoryResponse.data) && categoryResponse.data.length > 0 
      ? categoryResponse.data[0] 
      : categoryResponse.data;
    
    if (!categoryData) {
      notFound();
    }
    
    // Fetch city data (only if not "all")
    let cityData = null;
    if (!isAllCities) {
      const cityResponse = await getCityBySlug(citySlug);
      cityData = Array.isArray(cityResponse.data) && cityResponse.data.length > 0 
        ? cityResponse.data[0] 
        : cityResponse.data;
      
      if (!cityData) {
        notFound();
      }
    }
    
    // Fetch listings with appropriate filters
    const listingsParams: any = {
      page,
      pageSize: 24,
      category: categorySlug,
      sort: [sort]
    };
    
    // Only add city filter if not showing all cities
    if (!isAllCities) {
      listingsParams.city = citySlug;
    }
    
    const [listingsResponse, allCitiesResponse] = await Promise.all([
      getListings(listingsParams),
      getCities()
    ]);
    
    const listings = listingsResponse.data;
    const totalListings = listingsResponse.meta?.pagination?.total || 0;
    const totalPages = listingsResponse.meta?.pagination?.pageCount || 1;
    const allCities = allCitiesResponse.data || [];
    
    const pageTitle = isAllCities 
      ? `${categoryData.name} - All Cities`
      : `${categoryData.name} in ${cityData.name}`;
    
    const breadcrumbCityName = isAllCities ? 'All Cities' : cityData.name;
    
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm">
          <ol className="flex space-x-2">
            <li>
              <Link href="/" className="text-purple-600 hover:text-purple-500">
                Home
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            {!isAllCities ? (
              <>
                <li>
                  <Link href={`/${citySlug}`} className="text-purple-600 hover:text-purple-500">
                    {cityData.name}
                  </Link>
                </li>
                <li className="text-gray-500">/</li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/listings" className="text-purple-600 hover:text-purple-500">
                    All Cities
                  </Link>
                </li>
                <li className="text-gray-500">/</li>
              </>
            )}
            <li className="text-gray-500">{categoryData.name}</li>
          </ol>
        </nav>
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{pageTitle}</h1>
          <p className="text-gray-600">
            {totalListings} {totalListings === 1 ? 'listing' : 'listings'} found
          </p>
        </div>
        
        {/* City Filter (when showing all cities) */}
        {isAllCities && allCities.length > 0 && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Filter by City:</h3>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/all/${categorySlug}`}
                className="bg-purple-600 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                All Cities
              </Link>
              {allCities.map(city => (
                <Link
                  key={city.id}
                  href={`/${city.slug}/${categorySlug}`}
                  className="bg-white border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all px-3 py-2 rounded-md text-sm text-gray-700 hover:text-purple-600 font-medium"
                >
                  {city.name}
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Other Categories (when showing specific city) */}
        {!isAllCities && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Other Categories in {cityData.name}:</h3>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/${citySlug}`}
                className="bg-white border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all px-3 py-2 rounded-md text-sm text-gray-700 hover:text-purple-600 font-medium"
              >
                All Categories
              </Link>
              <Link
                href={`/all/${categorySlug}`}
                className="bg-purple-100 text-purple-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-200"
              >
                {categoryData.name} (All Cities)
              </Link>
            </div>
          </div>
        )}
        
        {/* Sort Options */}
        <div className="mb-6 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Link
              href={`/${citySlug}/${categorySlug}?sort=createdAt:desc`}
              className={`px-3 py-2 text-sm rounded-md ${
                sort === 'createdAt:desc' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Newest
            </Link>
            <Link
              href={`/${citySlug}/${categorySlug}?sort=createdAt:asc`}
              className={`px-3 py-2 text-sm rounded-md ${
                sort === 'createdAt:asc' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Oldest
            </Link>
            <Link
              href={`/${citySlug}/${categorySlug}?sort=title:asc`}
              className={`px-3 py-2 text-sm rounded-md ${
                sort === 'title:asc' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              A-Z
            </Link>
          </div>
        </div>
        
        {/* Listings Grid */}
        {listings.length > 0 ? (
          <ListingGrid listings={listings} columns={4} />
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
            <p className="text-gray-500 mb-6">
              There are no {categoryData.name} listings {isAllCities ? 'available' : `in ${cityData.name}`} at the moment.
            </p>
            <div className="flex justify-center gap-4">
              {!isAllCities && (
                <Link
                  href={`/${citySlug}`}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Browse All Categories in {cityData.name}
                </Link>
              )}
              <Link
                href="/listings"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium"
              >
                Browse All Listings
              </Link>
            </div>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex space-x-2">
              {page > 1 && (
                <Link
                  href={`/${citySlug}/${categorySlug}?page=${page - 1}${sort !== 'createdAt:desc' ? `&sort=${sort}` : ''}`}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Previous
                </Link>
              )}
              
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = Math.max(1, Math.min(page - 2 + i, totalPages - 4 + i));
                if (pageNum > totalPages) return null;
                
                return (
                  <Link
                    key={pageNum}
                    href={`/${citySlug}/${categorySlug}?page=${pageNum}${sort !== 'createdAt:desc' ? `&sort=${sort}` : ''}`}
                    className={`px-3 py-2 text-sm rounded-md ${
                      pageNum === page
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              })}
              
              {page < totalPages && (
                <Link
                  href={`/${citySlug}/${categorySlug}?page=${page + 1}${sort !== 'createdAt:desc' ? `&sort=${sort}` : ''}`}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Next
                </Link>
              )}
            </nav>
          </div>
        )}
        
        {/* Back Navigation */}
        <div className="mt-8 flex justify-center">
          {isAllCities ? (
            <Link
              href="/listings"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-md font-medium"
            >
              ← Back to All Listings
            </Link>
          ) : (
            <Link
              href={`/${citySlug}`}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-md font-medium"
            >
              ← Back to {cityData.name}
            </Link>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching category page data:', error);
    notFound();
  }
} 