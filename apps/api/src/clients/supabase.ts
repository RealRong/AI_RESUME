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

function getSupabaseServiceRoleKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    ""
  );
}

export function getSupabaseAdminClient() {
  if (cachedClient) {
    return cachedClient;
  }

  cachedClient = createClient<any>(
    getRequiredEnv("SUPABASE_URL"),
    getSupabaseServiceRoleKey() ||
      (() => {
        throw new Error(
          "Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY"
        );
      })(),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );

  return cachedClient;
}
