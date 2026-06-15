import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { signOut as authSignOut } from "@/lib/auth";
import { clearPeekSession } from "@/lib/session";
import {
  isDevBypassAuthEnabled,
  isSupabaseConfigured,
  logSupabaseConfigDebug,
} from "@/lib/config";
import { getSupabase } from "@/lib/supabase";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  /** TEMP: true quando usuário autenticado ou bypass dev ativo */
  canAccessApp: boolean;
  /** TEMP: bypass ativo nesta sessão */
  devBypass: boolean;
  continueWithoutLogin: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [devBypass, setDevBypass] = useState(false);
  const [loading, setLoading] = useState(isSupabaseConfigured());
  const isConfigured = isSupabaseConfigured();
  const canAccessApp =
    user !== null || (isDevBypassAuthEnabled() && devBypass);

  useEffect(() => {
    logSupabaseConfigDebug("AuthProvider-mount");

    if (!isConfigured) {
      setLoading(false);
      return;
    }

    const supabase = getSupabase();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isConfigured]);

  const continueWithoutLogin = useCallback(() => {
    if (!isDevBypassAuthEnabled()) return;
    setDevBypass(true);
  }, []);

  const signOut = useCallback(async () => {
    setDevBypass(false);
    await clearPeekSession();

    if (isConfigured) {
      await authSignOut();
    }

    setUser(null);
  }, [isConfigured]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isConfigured,
      canAccessApp,
      devBypass,
      continueWithoutLogin,
      signOut,
    }),
    [
      user,
      loading,
      isConfigured,
      canAccessApp,
      devBypass,
      continueWithoutLogin,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }
  return context;
}
