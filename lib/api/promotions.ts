import apiClient from './client';
import { ApiResponse, Promotion } from '@/types';

export async function getPromotions(placement: string): Promise<ApiResponse<Promotion[]>> {
  const now = new Date().toISOString();
  
  const { data } = await apiClient.get('/api/promotions', {
    params: {
      filters: {
        placement: { $eq: placement },
        active: { $eq: true },
        $and: [
          {
            $or: [
              { startDate: { $lte: now } },
              { startDate: { $null: true } }
            ]
          },
          {
            $or: [
              { endDate: { $gte: now } },
              { endDate: { $null: true } }
            ]
          }
        ]
      },
      populate: ['image']
    }
  });
  
  return data;
} 