function isPlaceholder(value: string) {
  return value.includes("<") || value.includes(">");
}

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey || isPlaceholder(url) || isPlaceholder(anonKey)) {
    return null;
  }

  return {
    url,
    anonKey,
  };
}

export function getRequiredSupabaseEnv() {
  const env = getSupabaseEnv();

  if (!env) {
    throw new Error(
      "Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local.",
    );
  }

  return env;
}

export function getServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key || isPlaceholder(key)) return null;
  return key;
}

export function getRequiredServiceRoleKey() {
  const key = getServiceRoleKey();
  if (!key) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY en .env.local. Es necesaria para crear usuarios desde el panel admin.",
    );
  }
  return key;
}
