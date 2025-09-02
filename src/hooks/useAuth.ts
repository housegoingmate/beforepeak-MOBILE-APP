import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [authId, setAuthId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null); // users.id (app user id)
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const { data } = await supabase.auth.getUser();
    const auth_id = data.user?.id ?? null;
    setAuthId(auth_id);
    if (auth_id) {
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', auth_id)
        .single();
      setUserId(profile?.id ?? null);
    } else {
      setUserId(null);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      await loadUser();
      if (mounted) setLoading(false);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_event) => {
      if (!mounted) return;
      loadUser();
    });
    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  return { authId, userId, loading };
}

