import { createClient } from "@supabase/supabase-js";

const isMockIsolatedReview = process.env.REACT_APP_REVIEW_DATA_MODE === "mock-isolated";
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
  || (isMockIsolatedReview ? "http://127.0.0.1:54321" : null);
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY
  || (isMockIsolatedReview ? "mock-isolated-review-key" : null);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
