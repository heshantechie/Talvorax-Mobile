import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { env } from '../config/env';

/**
 * Supabase client configured for React Native.
 * Uses AsyncStorage instead of browser localStorage for session persistence.
 * detectSessionInUrl is disabled since there's no browser URL bar in mobile.
 */
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
