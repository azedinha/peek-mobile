import { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { LoadingView } from "@/components/ui/LoadingView";
import { useAuth } from "@/hooks/useAuth";
import { signInWithOAuth } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/config";
import { HOME_ROUTE } from "@/lib/routes";
import { theme } from "@/constants/theme";

export default function LoginScreen() {
  const router = useRouter();
  const { loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isConfigured = isSupabaseConfigured();

  const handleOAuth = async (provider: "google" | "apple") => {
    if (!isConfigured) return;

    setSubmitting(true);
    setError(null);

    try {
      await signInWithOAuth(provider);
      router.replace(HOME_ROUTE);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Não foi possível iniciar o login. Tente novamente.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingView />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Logo size="lg" />
          <Text style={styles.lead}>
            Identifique estabelecimentos com uma foto e veja a reputação em um
            só lugar.
          </Text>
        </View>

        {!isConfigured && (
          <Text style={styles.configHint}>
            Configure o Supabase no arquivo `.env` com EXPO_PUBLIC_SUPABASE_URL
            e EXPO_PUBLIC_SUPABASE_ANON_KEY para ativar o login.
          </Text>
        )}

        <View style={styles.actions}>
          <Button
            fullWidth
            loading={submitting}
            disabled={submitting || !isConfigured}
            onPress={() => handleOAuth("apple")}
          >
            Entrar com Apple
          </Button>
          <Button
            variant="outline"
            fullWidth
            loading={submitting}
            disabled={submitting || !isConfigured}
            onPress={() => handleOAuth("google")}
          >
            Entrar com Google
          </Button>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    justifyContent: "center",
    gap: theme.spacing.xl,
  },
  hero: {
    alignItems: "center",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  lead: {
    ...theme.typography.body,
    textAlign: "center",
    color: theme.colors.textSecondary,
    maxWidth: 320,
  },
  configHint: {
    ...theme.typography.caption,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: theme.spacing.sm,
  },
  actions: {
    gap: theme.spacing.sm,
  },
  error: {
    ...theme.typography.caption,
    color: theme.colors.error,
    textAlign: "center",
  },
});
