import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = "https://eagmdsugaflbowqaihiq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhZ21kc3VnYWZsYm93cWFpaGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5OTgyNDYsImV4cCI6MjA0ODU3NDI0Nn0.0A1mMIVSlwRXDi3kkHjk-ljp1F0pXvmCIy6hM0Ezxh4";

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    detectSessionInUrl: false,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
  },
});

// Test connection and log result
console.log('Initializing Supabase client...');
supabase.from('Crypto_Ledger').select('*', { count: 'exact' }).then(
  ({ data, error, count }) => {
    if (error) {
      console.error('Error initializing Supabase client:', error);
    } else {
      console.log('Successfully connected to Supabase. Row count:', count);
      console.log('First few records:', data?.slice(0, 2));
    }
  }
);