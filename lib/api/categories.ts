import apiClient from './client';
import { ApiResponse, Category } from '@/types';

export async function getCategories(): Promise<ApiResponse<Category[]>> {
  const { data } = await apiClient.get('/api/categories', {
    params: {
      populate: ['icon'],
      sort: ['order:asc', 'name:asc']
    }
  });
  return data;
}

export async function getCategoryBySlug(slug: string): Promise<ApiResponse<Category>> {
  const { data } = await apiClient.get(`/api/categories`, {
    params: {
      filters: { slug: { $eq: slug } },
      populate: ['icon']
    }
  });
  return data;
} 