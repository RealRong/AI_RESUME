import {
  createClient,
  type SupabaseClient
} from "@supabase/supabase-js";

type SupabaseAdminClient = SupabaseClient<any, "public", any>;

let cachedClient: SupabaseAdminClient | null = null;

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getSupabaseAdminClient() {
  if (cachedClient) {
    return cachedClient;
  }

  cachedClient = createClient<any>(
    getRequiredEnv("SUPABASE_URL"),
    getRequiredEnv("SUPABASE_SECRET_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );

  return cachedClient;
}
