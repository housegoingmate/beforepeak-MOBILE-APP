import { supabase } from '../lib/supabase';

export type Review = {
  id: string;
  restaurant_id: string;
  user_id: string;
  rating: number;
  comment_en?: string;
  comment_zh?: string;
  food_rating?: number;
  service_rating?: number;
  ambiance_rating?: number;
  value_rating?: number;
  is_verified?: boolean;
};

export async function listReviews(params: { restaurant_id?: string; user_id?: string; page?: number; limit?: number }) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let query = supabase
    .from('reviews')
    .select(`
      *,
      users(first_name, last_name),
      restaurants(name_en, name_zh)
    `)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (params.restaurant_id) query = query.eq('restaurant_id', params.restaurant_id);
  if (params.user_id) query = query.eq('user_id', params.user_id);

  const { data, error } = await query;
  if (error) throw error;
  return data as Review[];
}

export async function createReview(input: Omit<Review, 'id'>) {
  const { data, error } = await supabase
    .from('reviews')
    .insert(input)
    .select('*')
    .single();
  if (error) throw error;
  return data as Review;
}

