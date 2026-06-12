import { createBrowserClient } from "@supabase/ssr";
import { getRequiredSupabaseEnv } from "./env";

export function createClient() {
  const { url, anonKey } = getRequiredSupabaseEnv();

  return createBrowserClient(url, anonKey);
}
