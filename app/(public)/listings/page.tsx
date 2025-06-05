'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { getListings } from '@/lib/api/listings';
import { getCities } from '@/lib/api/cities';
import { getCategories } from '@/lib/api/categories';
import ListingGrid from '@/components/listings/ListingGrid';
import { City, Category, Listing } from '@/types';

interface Pagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

// Build query string helper function
const buildQueryString = (params: Record<string, string | undefined>) => {
  const urlParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) urlParams.append(key, value);
  });
  
  const queryString = urlParams.toString();
  return queryString ? `?${queryString}` : '';
};

export default function ListingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isLoading, setIsLoading] = useState(true);
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  
  // Get query params
  const citySlug = searchParams.get('city') || undefined;
  const categorySlug = searchParams.get('category') || undefined;
  const slug = searchParams.get('slug') || undefined;
  const pageParam = searchParams.get('page');
  const featured = searchParams.get('featured') === 'true';
  const page = Number(pageParam) || 1;
  
  // Handle navigation
  const handleNavigation = (href: string) => {
    router.push(href);
  };
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [citiesResponse, categoriesResponse, listingsResponse] = await Promise.all([
          getCities(),
          getCategories(),
          getListings({
            page,
            pageSize: 12,
            city: citySlug,
            category: categorySlug,
            featured: featured || undefined
          })
        ]);
        
        setCities(citiesResponse.data);
        setCategories(categoriesResponse.data);
        setListings(listingsResponse.data);
        
        // Handle pagination with type safety
        if (listingsResponse.meta?.pagination) {
          setPagination(listingsResponse.meta.pagination as Pagination);
        } else {
          setPagination(null);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [citySlug, categorySlug, page, featured, slug]);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          All Listings
        </h1>
        <p className="text-gray-600">
          Browse {pagination?.total || 0} listings
          {categorySlug && ' in selected category'}
          {citySlug && ' in selected city'}
        </p>
      </div>
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      )}
      
      {!isLoading && (
        <>
          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-lg font-semibold mb-4">Filter Listings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* City Filter */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={buildQueryString({
                      category: categorySlug,
                      featured: featured ? 'true' : undefined
                    })}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation(buildQueryString({
                        category: categorySlug,
                        featured: featured ? 'true' : undefined
                      }));
                    }}
                    className={`px-3 py-1 rounded-full text-sm ${
                      !citySlug 
                        ? 'bg-purple-100 text-purple-800 font-medium' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Cities
                  </Link>
                  {cities.map(city => (
                    <Link
                      key={city.id}
                      href={buildQueryString({
                        city: city.slug,
                        category: categorySlug,
                        featured: featured ? 'true' : undefined
                      })}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavigation(buildQueryString({
                          city: city.slug,
                          category: categorySlug,
                          featured: featured ? 'true' : undefined
                        }));
                      }}
                      className={`px-3 py-1 rounded-full text-sm ${
                        citySlug === city.slug
                          ? 'bg-purple-100 text-purple-800 font-medium' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {city.name}
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Category Filter */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={buildQueryString({
                      city: citySlug,
                      featured: featured ? 'true' : undefined
                    })}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation(buildQueryString({
                        city: citySlug,
                        featured: featured ? 'true' : undefined
                      }));
                    }}
                    className={`px-3 py-1 rounded-full text-sm ${
                      !categorySlug 
                        ? 'bg-purple-100 text-purple-800 font-medium' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Categories
                  </Link>
                  {categories.map(category => (
                    <Link
                      key={category.id}
                      href={buildQueryString({
                        city: citySlug,
                        category: category.slug,
                        featured: featured ? 'true' : undefined
                      })}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavigation(buildQueryString({
                          city: citySlug,
                          category: category.slug,
                          featured: featured ? 'true' : undefined
                        }));
                      }}
                      className={`px-3 py-1 rounded-full text-sm ${
                        categorySlug === category.slug
                          ? 'bg-purple-100 text-purple-800 font-medium' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Featured Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured
                </label>
                <div className="flex gap-2">
                  <Link
                    href={buildQueryString({
                      city: citySlug,
                      category: categorySlug,
                      featured: 'true'
                    })}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation(buildQueryString({
                        city: citySlug,
                        category: categorySlug,
                        featured: 'true'
                      }));
                    }}
                    className={`px-3 py-1 rounded-full text-sm ${
                      featured 
                        ? 'bg-purple-100 text-purple-800 font-medium' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Featured Only
                  </Link>
                  {featured && (
                    <Link
                      href={buildQueryString({
                        city: citySlug,
                        category: categorySlug
                      })}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavigation(buildQueryString({
                          city: citySlug,
                          category: categorySlug
                        }));
                      }}
                      className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      Clear
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Listings Grid */}
          {listings.length > 0 ? (
            <ListingGrid listings={listings} columns={6} />
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your filters or check back later.
              </p>
              <Link
                href="/"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md font-medium"
              >
                Return Home
              </Link>
            </div>
          )}
          
          {/* Pagination */}
          {pagination && pagination.pageCount > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-2">
                {page > 1 && (
                  <Link
                    href={buildQueryString({
                      city: citySlug,
                      category: categorySlug,
                      page: String(page - 1),
                      featured: featured ? 'true' : undefined
                    })}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation(buildQueryString({
                        city: citySlug,
                        category: categorySlug,
                        page: String(page - 1),
                        featured: featured ? 'true' : undefined
                      }));
                    }}
                    className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Previous
                  </Link>
                )}
                
                <span className="px-3 py-1 rounded-md bg-purple-100 text-purple-800 font-medium">
                  {page}
                </span>
                
                {page < pagination.pageCount && (
                  <Link
                    href={buildQueryString({
                      city: citySlug,
                      category: categorySlug,
                      page: String(page + 1),
                      featured: featured ? 'true' : undefined
                    })}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation(buildQueryString({
                        city: citySlug,
                        category: categorySlug,
                        page: String(page + 1),
                        featured: featured ? 'true' : undefined
                      }));
                    }}
                    className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Next
                  </Link>
                )}
                
                <span className="text-gray-500 text-sm ml-2">
                  Page {page} of {pagination.pageCount}
                </span>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
} 