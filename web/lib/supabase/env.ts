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
