import apiClient from './client';
import { ApiResponse, City } from '@/types';

export async function getCities(): Promise<ApiResponse<City[]>> {
  const { data } = await apiClient.get('/api/cities', {
    params: {
      filters: { active: { $eq: 'true' } },
      sort: ['name:asc']
    }
  });
  return data;
}

export async function getCityBySlug(slug: string): Promise<ApiResponse<City>> {
  const { data } = await apiClient.get(`/api/cities`, {
    params: {
      filters: { slug: { $eq: slug } }
    }
  });
  return data;
} 