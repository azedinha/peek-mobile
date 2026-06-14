export const config = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "",
};

export function isSupabaseConfigured(): boolean {
  return Boolean(config.supabaseUrl && config.supabaseAnonKey);
}

export function isApiConfigured(): boolean {
  return Boolean(config.apiUrl);
}

/** TEMP: bypass de auth só em desenvolvimento — remover antes do release */
export function isDevBypassAuthEnabled(): boolean {
  return __DEV__;
}

export function logSupabaseConfigDebug(source: string): void {
  if (!__DEV__) return;

  console.log(`[peek/config][${source}] isSupabaseConfigured:`, isSupabaseConfigured());
}
