import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use environment variables for better security and flexibility
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://yevdyhdifwwkbiulrzmk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldmR5aGRpZnd3a2JpdWxyem1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxODM0MzUsImV4cCI6MjA5Mjc1OTQzNX0.1vEBNzZFCc24oISfqY3tdTmJCiB11klEqHPc-wfkspQ";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Enhanced security
  },
  global: {
    headers: {
      'x-application-name': 'lish-platform',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // Rate limiting for realtime
    },
  },
});
