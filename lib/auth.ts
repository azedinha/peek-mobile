import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import type { UserIdentity } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";
import {
  isPeekOAuthProvider,
  type PeekOAuthProvider,
} from "./auth-providers";

WebBrowser.maybeCompleteAuthSession();

function getOAuthRedirectUri(): string {
  const redirectTo = Linking.createURL("auth/callback");

  if (
    redirectTo.startsWith("http://localhost") ||
    redirectTo.startsWith("https://localhost")
  ) {
    return "peek://auth/callback";
  }

  return redirectTo;
}

function getOAuthProviderOptions(provider: PeekOAuthProvider) {
  return {
    redirectTo: getOAuthRedirectUri(),
    skipBrowserRedirect: true as const,
    ...(provider === "apple" ? { scopes: "email name" } : {}),
  };
}

async function createSessionFromUrl(url: string): Promise<void> {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) {
    const description = params.error_description ?? params.error ?? errorCode;
    throw new Error(`Provedor recusou o login: ${description}`);
  }

  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;

  if (!accessToken || !refreshToken) {
    throw new Error("Sessão inválida. Tente novamente.");
  }

  const { error } = await getSupabase().auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    throw error;
  }
}

async function runOAuthBrowserFlow(
  oauthUrl: string,
  redirectTo: string
): Promise<void> {
  const result = await WebBrowser.openAuthSessionAsync(oauthUrl, redirectTo);

  if (result.type === "success" && result.url) {
    await createSessionFromUrl(result.url);
    return;
  }

  if (result.type === "cancel") {
    throw new Error("Login cancelado.");
  }

  if (result.type === "dismiss") {
    throw new Error(
      "O navegador fechou antes de voltar ao app. Verifique se a URL de redirecionamento " +
        `("${redirectTo}") está nas Redirect URLs do Supabase.`
    );
  }

  throw new Error("Não foi possível concluir o login.");
}

export async function signInWithOAuth(
  provider: PeekOAuthProvider
): Promise<void> {
  const options = getOAuthProviderOptions(provider);

  const { data, error } = await getSupabase().auth.signInWithOAuth({
    provider,
    options,
  });

  if (error) {
    throw error;
  }

  if (!data.url) {
    throw new Error("URL de login não disponível.");
  }

  await runOAuthBrowserFlow(data.url, options.redirectTo);
}

export async function linkOAuthProvider(
  provider: PeekOAuthProvider
): Promise<void> {
  const options = getOAuthProviderOptions(provider);

  const { data, error } = await getSupabase().auth.linkIdentity({
    provider,
    options,
  });

  if (error) {
    throw mapIdentityError(error, "vincular");
  }

  if (!data.url) {
    throw new Error("URL de vinculação não disponível.");
  }

  await runOAuthBrowserFlow(data.url, options.redirectTo);
}

export async function unlinkOAuthProvider(
  identity: UserIdentity
): Promise<void> {
  if (!identity.identity_id) {
    throw new Error("Identidade inválida para desvincular.");
  }

  const { error } = await getSupabase().auth.unlinkIdentity(identity);

  if (error) {
    throw mapIdentityError(error, "desvincular");
  }
}

export async function getLinkedOAuthIdentities(): Promise<UserIdentity[]> {
  const { data, error } = await getSupabase().auth.getUserIdentities();

  if (error) {
    throw error;
  }

  return (data?.identities ?? []).filter((identity) =>
    isPeekOAuthProvider(identity.provider)
  );
}

function mapIdentityError(
  error: { message?: string },
  action: "vincular" | "desvincular"
): Error {
  const message = error.message?.toLowerCase() ?? "";

  if (message.includes("manual linking")) {
    return new Error(
      "Vinculação manual não está habilitada no Supabase. Ative em Authentication → Providers."
    );
  }

  if (message.includes("already linked") || message.includes("already exists")) {
    return new Error("Este método de login já está vinculado a uma conta.");
  }

  if (message.includes("at least 2 identities")) {
    return new Error("Mantenha pelo menos um método de login na conta.");
  }

  return new Error(
    `Não foi possível ${action} este método de login. Tente novamente.`
  );
}

export async function signOut(): Promise<void> {
  const { error } = await getSupabase().auth.signOut();
  if (error) {
    throw error;
  }
}
