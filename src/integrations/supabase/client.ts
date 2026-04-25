import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "https://tkntnxiqeefhtogpblwf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrbnRueGlxZWVmaHRvZ3BibHdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNzQ0NDgsImV4cCI6MjA5MjY1MDQ0OH0.zkKeIkmtUBVKhnUG0yhWF9r01gnJxrXIeZOvr_AZvDE";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
