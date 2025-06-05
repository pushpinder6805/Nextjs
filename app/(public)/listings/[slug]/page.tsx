import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { getListingBySlug } from '@/lib/api/listings';
import { Listing, Tag } from '@/types';
import { Metadata } from 'next';

interface ListingDetailPageProps {
  params: Promise<{
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
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  
  try {
    const response = await getListingBySlug(slug);
    const listing = Array.isArray(response.data) ? response.data[0] : response.data;
    
    if (!listing) {
      notFound();
    }
    
    // Redirect to the new URL structure: /city/category/slug
    const newUrl = `/${listing.city.slug}/${listing.category.slug}/${listing.slug}`;
    redirect(newUrl);
    
  } catch (error) {
    console.error('Error fetching listing data:', error);
    notFound();
  }
} 