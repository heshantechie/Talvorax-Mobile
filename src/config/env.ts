/**
 * Type-safe environment configuration.
 * Uses EXPO_PUBLIC_ prefix for client-safe variables.
 */

interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  API_URL: string;
}

function getEnv(): Env {
  const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL
    ?? 'https://lmyhsdfswkzsmrpmglcp.supabase.co';

  const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxteWhzZGZzd2t6c21ycG1nbGNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMDMzMjYsImV4cCI6MjA4ODg3OTMyNn0.Nu_a8EwkmMB43BLCR5iSBnFE8PY75ZTMzdVyMluEMC0';

  const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'talvorax.up.railway.app';

  return { SUPABASE_URL, SUPABASE_ANON_KEY, API_URL };
}

export const env = getEnv();
