import { supabase } from '../lib/supabase';

export type Referral = {
  id: string;
  user_id: string;
  referred_user_id?: string | null;
  code: string;
  reward_status?: 'pending'|'granted'|'expired';
};

export async function getMyReferral(user_id: string) {
  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('user_id', user_id)
    .single();
  if (error) throw error;
  return data as Referral;
}

export async function createMyReferral(user_id: string) {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  const { data, error } = await supabase
    .from('referrals')
    .insert({ user_id, code })
    .select('*')
    .single();
  if (error) throw error;
  return data as Referral;
}

