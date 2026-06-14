import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { getSupabase } from "./supabase";

WebBrowser.maybeCompleteAuthSession();

function getOAuthRedirectUri(): string {
  // Expo Go: exp://<ip>:8081/--/auth/callback
  // Build nativo: peek://auth/callback (scheme em app.json)
  const redirectTo = Linking.createURL("auth/callback");

  if (
    redirectTo.startsWith("http://localhost") ||
    redirectTo.startsWith("https://localhost")
  ) {
    return "peek://auth/callback";
  }

  return redirectTo;
}

async function createSessionFromUrl(url: string): Promise<void> {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) {
    throw new Error(errorCode);
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

export async function signInWithOAuth(
  provider: "google" | "apple"
): Promise<void> {
  const redirectTo = getOAuthRedirectUri();

  const { data, error } = await getSupabase().auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    throw error;
  }

  if (!data.url) {
    throw new Error("URL de login não disponível.");
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type === "success" && result.url) {
    await createSessionFromUrl(result.url);
    return;
  }

  if (result.type === "cancel") {
    throw new Error("Login cancelado.");
  }

  throw new Error("Não foi possível concluir o login.");
}

export async function signOut(): Promise<void> {
  const { error } = await getSupabase().auth.signOut();
  if (error) {
    throw error;
  }
}
