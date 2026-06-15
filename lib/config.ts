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

export function getPrivacyPolicyUrl(): string | null {
  const explicit = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL?.trim();
  if (explicit) return explicit;

  if (!isApiConfigured()) return null;
  return `${config.apiUrl.replace(/\/$/, "")}/privacy`;
}

export function getTermsOfUseUrl(): string | null {
  const explicit = process.env.EXPO_PUBLIC_TERMS_URL?.trim();
  if (explicit) return explicit;

  if (!isApiConfigured()) return null;
  return `${config.apiUrl.replace(/\/$/, "")}/terms`;
}

/** TEMP: bypass de auth só em desenvolvimento — remover antes do release */
export function isDevBypassAuthEnabled(): boolean {
  return __DEV__;
}

export function logSupabaseConfigDebug(source: string): void {
  if (!__DEV__) return;

  console.log(`[peek/config][${source}] isSupabaseConfigured:`, isSupabaseConfigured());
}
