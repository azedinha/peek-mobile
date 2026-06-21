import type { UserIdentity } from "@supabase/supabase-js";

export type PeekOAuthProvider = "google" | "apple";

export const PEEK_OAUTH_PROVIDERS: PeekOAuthProvider[] = ["google", "apple"];

export const PROVIDER_LABELS: Record<PeekOAuthProvider, string> = {
  google: "Google",
  apple: "Apple",
};

export function isPeekOAuthProvider(
  provider: string
): provider is PeekOAuthProvider {
  return PEEK_OAUTH_PROVIDERS.includes(provider as PeekOAuthProvider);
}

export function findIdentityForProvider(
  identities: UserIdentity[],
  provider: PeekOAuthProvider
): UserIdentity | undefined {
  return identities.find((identity) => identity.provider === provider);
}

export function getIdentityEmailLabel(identity: UserIdentity): string | null {
  const email = identity.identity_data?.email;
  if (typeof email === "string" && email.trim()) {
    return email.trim();
  }
  return null;
}
