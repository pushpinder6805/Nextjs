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

interface Props {
  params: { city: string };
}

export const revalidate = 60;
export const dynamic = 'force-dynamic';

export default async function CityPage({ params }: Props) {
  const { city } = params;

  const [categoriesRes, citiesRes, promotionsRes] = await Promise.all([
    getCategories(),
    getCities(),
    getPromotions(city),
  ]);

  const categories = categoriesRes.data || [];
  const cities = citiesRes.data || [];
  const promotions = promotionsRes.data || [];

  const currentCity = cities.find((c) => c.slug === city) || null;

  const latestListingsRes = await getListings({
    page: 1,
    pageSize: 10,
    city,
    approvalStatus: 'published',
  });

  const latestListings = latestListingsRes.data || [];

  const categoriesWithListings = await Promise.all(
    categories.map(async (category) => {
      const res = await getListings({
        page: 1,
        pageSize: 50,
        category: category.slug,
        city,
        approvalStatus: 'published',
      });
      return { category, listings: res.data || [] };
    })
  );

  return (
    <HomeLayout
      promotions={promotions}
      latestListings={latestListings}
      categoriesWithListings={categoriesWithListings}
      cities={cities}
      currentCityName={currentCity?.name}
    />
  );
}
