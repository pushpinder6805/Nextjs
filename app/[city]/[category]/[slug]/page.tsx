import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getListingBySlug } from '@/lib/api/listings';
import { getCityBySlug } from '@/lib/api/cities';
import { getCategoryBySlug } from '@/lib/api/categories';
import { Listing, Tag } from '@/types';
import { Metadata } from 'next';

// Add ISR revalidation - revalidate every 60 seconds
export const revalidate = 60;

// Ensure this page is always dynamic for immediate updates
export const dynamic = 'force-dynamic';

interface ListingDetailPageProps {
  params: Promise<{
    city: string;
    category: string;
    slug: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: ListingDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const response = await getListingBySlug(slug);
    const listing = Array.isArray(response.data) ? response.data[0] : response.data;
    
    if (!listing) {
      return {
        title: 'Listing Not Found',
        description: 'The requested listing could not be found.'
      };
    }
    
    return {
      title: `${listing.title} | Lust66`,
      description: listing.description.substring(0, 160),
      openGraph: {
        title: listing.title,
        description: listing.description.substring(0, 160),
        images: listing.images && listing.images.length > 0 
          ? [`${process.env.NEXT_PUBLIC_API_URL}${listing.images[0].url}`] 
          : [],
      },
    };
  } catch (error) {
    return {
      title: 'Listing Not Found',
      description: 'The requested listing could not be found.'
    };
  }
}

export default async function ListingDetailPage({ params, searchParams }: ListingDetailPageProps) {
  const [{ city: citySlug, category: categorySlug, slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  
  try {
    // Verify the URL parameters match the listing data
    const [listingResponse, cityResponse, categoryResponse] = await Promise.all([
      getListingBySlug(slug),
      getCityBySlug(citySlug),
      getCategoryBySlug(categorySlug)
    ]);
    
    const listing = Array.isArray(listingResponse.data) ? listingResponse.data[0] : listingResponse.data;
    const cityData = Array.isArray(cityResponse.data) && cityResponse.data.length > 0 ? cityResponse.data[0] : cityResponse.data;
    const categoryData = Array.isArray(categoryResponse.data) && categoryResponse.data.length > 0 ? categoryResponse.data[0] : categoryResponse.data;
    
    if (!listing || !cityData || !categoryData) {
      notFound();
    }
    
    // Verify that the listing belongs to the correct city and category
    if (listing.city.slug !== citySlug || listing.category.slug !== categorySlug) {
      notFound();
    }
    
    const { 
      title,
      subtitle,
      description, 
      phone,
      email,
      price,
      address,
      images, 
      category, 
      city,
      tags,
      featured,
      createdAt,
      websiteUrl,
      bbsThreadUrl,
    } = listing;
    
    // Format description text with paragraphs
    const formattedDescription = description.split('\n').map((paragraph: string, i: number) => (
      <p key={i} className="mb-4 last:mb-0">{paragraph}</p>
    ));

    // Format date
    const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm">
          <ol className="flex flex-wrap gap-2 items-center">
            <li>
              <Link href="/" className="text-purple-600 hover:text-purple-500">
                Home
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link href={`/${citySlug}`} className="text-purple-600 hover:text-purple-500">
                {city.name}
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link href={`/${citySlug}/${categorySlug}`} className="text-purple-600 hover:text-purple-500">
                {category.name}
              </Link>
            </li>
          </ol>
        </nav>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          {/* Main Image */}
          {images && images.length > 0 && (
            <div className="relative h-[400px] bg-gray-100">
              <Image
                src={`${process.env.NEXT_PUBLIC_API_URL}${images[0].url}`}
                alt={title}
                className="object-cover"
                fill
                priority
              />
            </div>
          )}
          
          {/* Thumbnail Gallery */}
          {images && images.length > 1 && (
            <div className="grid grid-cols-6 gap-2 p-2 bg-gray-50 border-t border-gray-100">
              {images.slice(1).map((image: any, index: number) => (
                <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL}${image.url}`}
                    alt={`${title} - Image ${index + 2}`}
                    className="object-cover hover:opacity-90 transition-opacity"
                    fill
                  />
                </div>
              ))}
            </div>
          )}
          
          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-1 rounded-full">
                  {category.name}
                </span>
                <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded-full">
                  {city.name}
                </span>
                {featured && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-1 rounded-full">
                    Featured
                  </span>
                )}
                <span className="text-gray-400 text-xs ml-auto">
                  Posted {formattedDate}
                </span>
              </div>
              
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{title}</h1>
                {subtitle && (
                  <p className="text-lg text-gray-600">{subtitle}</p>
                )}
                {price && (
                  <div className="mt-2 text-xl font-bold text-purple-600">
                    ${price.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
            
            {/* Description */}
            <div className="prose max-w-none text-gray-600">
              {formattedDescription}
            </div>
            
            {/* Contact Information */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {phone && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 mb-1">Phone</dt>
                    <dd>
                      <a href={`tel:${phone}`} className="text-purple-600 hover:text-purple-500">
                        {phone}
                      </a>
                    </dd>
                  </div>
                )}
                {email && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 mb-1">Email</dt>
                    <dd>
                      <a href={`mailto:${email}`} className="text-purple-600 hover:text-purple-500">
                        {email}
                      </a>
                    </dd>
                  </div>
                )}
                {address && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500 mb-1">Address</dt>
                    <dd className="text-gray-900">{address}</dd>
                  </div>
                )}
              </div>
            </div>
            
            {/* External Links */}
            {(websiteUrl || bbsThreadUrl) && (
              <div className="flex flex-wrap gap-3">
                {websiteUrl && (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 bg-white border border-gray-200 hover:border-purple-300 text-gray-600 hover:text-purple-600 px-4 py-2 rounded-lg transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Visit Website
                  </a>
                )}
                {bbsThreadUrl && (
                  <a
                    href={bbsThreadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 bg-white border border-gray-200 hover:border-purple-300 text-gray-600 hover:text-purple-600 px-4 py-2 rounded-lg transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                    View BBS Thread
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching listing data:', error);
    notFound();
  }
} 