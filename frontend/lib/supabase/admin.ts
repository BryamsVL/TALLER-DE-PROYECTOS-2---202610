import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getRequiredServiceRoleKey, getRequiredSupabaseEnv } from "./env";

// Cliente con SERVICE_ROLE_KEY: bypassa RLS. Solo usar desde server actions
// que ya validan que el llamante es ADMIN/COORDINADOR. Nunca exponer al browser.
export function createAdminClient() {
  const { url } = getRequiredSupabaseEnv();
  const serviceKey = getRequiredServiceRoleKey();

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
