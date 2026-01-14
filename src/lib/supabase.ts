import { createClient, SupabaseClient } from '@supabase/supabase-js';

const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const fallbackUrl = 'https://tgncdltlavfzaacrildv.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnbmNkbHRsYXZmemFhY3JpbGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDMxMDUsImV4cCI6MjA4MzM3OTEwNX0.DPQvivVOnxK8hEY7yZONxeUHEaEKJKPGClBbTkucSCs';

const url = envUrl || fallbackUrl;
const key = envKey || fallbackKey;

console.log('Supabase URL:', envUrl ? 'Loaded from env' : 'Using fallback');
console.log('Supabase Key:', envKey ? 'Loaded from env' : 'Using fallback');

let client: SupabaseClient | null = null;
if (url && key) {
  client = createClient(url, key);
  console.log('Supabase client initialized successfully');
} else {
  console.error('Supabase client not initialized - missing URL or key');
}

export const supabase = client;
