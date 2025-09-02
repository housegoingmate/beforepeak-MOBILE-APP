import { supabase } from '../lib/supabase';

export type APIRestaurant = {
  id: string;
  name_en?: string;
  name_zh?: string;
  cuisine_type?: string;
  cuisine_type_en?: string;
  address_en?: string;
  address_zh?: string;
  territory?: string;
  average_rating?: number;
  total_reviews?: number;
  cover_photo_url?: string | null;
  restaurant_photos?: { url: string; alt_text?: string | null; category?: string | null; is_featured?: boolean | null }[];
  time_windows?: {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    discount_percentage: number;
    max_capacity: number;
    current_bookings: number;
  }[];
};

export async function listRestaurants(params?: { search?: string; sort?: 'rating'|'reviews'|'relevance'; page?: number; limit?: number }) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('restaurants')
    .select(`
      id, name_en, name_zh, cuisine_type, cuisine_type_en, address_en, address_zh, territory,
      average_rating, total_reviews, cover_photo_url,
      restaurant_photos(url, alt_text, category, is_featured),
      time_windows(id, date, start_time, end_time, discount_percentage, max_capacity, current_bookings)
    `)
    .eq('is_active', true)
    .eq('is_verified', true)
    .range(from, to);

  if (params?.search) {
    const s = params.search;
    query = query.or(`name_en.ilike.%${s}%,name_zh.ilike.%${s}%,description_en.ilike.%${s}%,description_zh.ilike.%${s}%`);
  }

  switch (params?.sort) {
    case 'rating':
      query = query.order('average_rating', { ascending: false });
      break;
    case 'reviews':
      query = query.order('total_reviews', { ascending: false });
      break;
    default:
      query = query.order('average_rating', { ascending: false }).order('total_reviews', { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as APIRestaurant[];
}

