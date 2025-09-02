import { supabase } from '../lib/supabase';

export type Booking = {
  id: string;
  restaurant_id: string;
  user_id: string;
  time_window_id: string;
  party_size: number;
  status: 'pending'|'confirmed'|'completed'|'cancelled';
  booking_fee?: number;
};

export async function myBookings(userId: string, status?: Booking['status'], page = 1, limit = 20) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let query = supabase
    .from('bookings')
    .select(`
      *,
      restaurants(name_en, name_zh, address_en, phone, cuisine_type, image_url),
      time_windows(date, start_time, end_time, discount_percentage)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw error;
  return data as Booking[];
}

export async function createBooking(input: { user_id: string; restaurant_id: string; time_window_id: string; party_size: number; booking_fee: number; special_requests?: string }) {
  // Expect RLS to allow only the current user; if needed we can swap to RPC/edge function.
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      user_id: input.user_id,
      restaurant_id: input.restaurant_id,
      time_window_id: input.time_window_id,
      party_size: input.party_size,
      booking_fee: input.booking_fee,
      special_requests: input.special_requests ?? null,
      status: 'pending'
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as Booking;
}

export async function cancelBooking(booking_id: string, user_id: string) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', booking_id)
    .eq('user_id', user_id)
    .select('*')
    .single();
  if (error) throw error;
  return data as Booking;
}

