import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = "https://eagmdsugaflbowqaihiq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhZ21kc3VnYWZsYm93cWFpaGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5OTgyNDYsImV4cCI6MjA0ODU3NDI0Nn0.0A1mMIVSlwRXDi3kkHjk-ljp1F0pXvmCIy6hM0Ezxh4";

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Test connection and log result
console.log('Initializing Supabase client with URL:', supabaseUrl);

// Using Promise.resolve() to ensure we get a proper Promise chain
Promise.resolve(
  supabase.from('Crypto_Ledger')
    .select('*', { count: 'exact' })
    .limit(1)
).then(({ data, error, count }) => {
  if (error) {
    console.error('Error connecting to Supabase:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
  } else {
    console.log('Successfully connected to Supabase');
    console.log('Sample data available:', !!data);
    console.log('Row count:', count);
    if (data && data.length > 0) {
      console.log('First record:', data[0]);
    }
  }
}).catch(err => {
  console.error('Critical error initializing Supabase:', err);
  console.error('Error details:', {
    message: err.message,
    name: err.name,
    stack: err.stack
  });
});