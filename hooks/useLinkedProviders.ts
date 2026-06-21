import { useCallback, useEffect, useState } from "react";
import type { UserIdentity } from "@supabase/supabase-js";
import {
  getLinkedOAuthIdentities,
  linkOAuthProvider,
  unlinkOAuthProvider,
} from "@/lib/auth";
import {
  findIdentityForProvider,
  type PeekOAuthProvider,
} from "@/lib/auth-providers";
import { getSupabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/config";

export function useLinkedProviders() {
  const [identities, setIdentities] = useState<UserIdentity[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured());
  const [busyProvider, setBusyProvider] = useState<PeekOAuthProvider | null>(
    null
  );

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setIdentities([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const linked = await getLinkedOAuthIdentities();
      setIdentities(linked);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();

    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = getSupabase();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT" ||
        event === "USER_UPDATED" ||
        event === "TOKEN_REFRESHED"
      ) {
        void refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [refresh]);

  const linkProvider = useCallback(async (provider: PeekOAuthProvider) => {
    setBusyProvider(provider);

    try {
      await linkOAuthProvider(provider);
      await refresh();
    } finally {
      setBusyProvider(null);
    }
  }, [refresh]);

  const unlinkProvider = useCallback(
    async (provider: PeekOAuthProvider) => {
      const identity = findIdentityForProvider(identities, provider);

      if (!identity) {
        throw new Error("Este método de login não está vinculado.");
      }

      if (identities.length < 2) {
        throw new Error("Mantenha pelo menos um método de login na conta.");
      }

      setBusyProvider(provider);

      try {
        await unlinkOAuthProvider(identity);
        await refresh();
      } finally {
        setBusyProvider(null);
      }
    },
    [identities, refresh]
  );

  const isProviderLinked = useCallback(
    (provider: PeekOAuthProvider) =>
      Boolean(findIdentityForProvider(identities, provider)),
    [identities]
  );

  return {
    identities,
    loading,
    busyProvider,
    canUnlink: identities.length >= 2,
    refresh,
    linkProvider,
    unlinkProvider,
    isProviderLinked,
  };
}
