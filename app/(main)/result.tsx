import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { LoadingView } from "@/components/ui/LoadingView";
import { ResultSummaryView } from "@/components/result/ResultViews";
import { analyzeCapture } from "@/lib/api";
import { theme } from "@/constants/theme";
import { getCaptureSession, saveAnalysisResult } from "@/lib/session";
import type { PeekAnalysisResult } from "@/types/peek";

type PageState = "loading" | "error" | "ready";

const DETAILS_ROUTE = "/(main)/details" as Href;

export default function ResultScreen() {
  const router = useRouter();
  const [state, setState] = useState<PageState>("loading");
  const [result, setResult] = useState<PeekAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    (async () => {
      const session = await getCaptureSession();
      if (!session) {
        router.replace("/(main)/camera");
        return;
      }

      try {
        const data = await analyzeCapture(session);
        await saveAnalysisResult(data);
        setResult(data);
        setState("ready");
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Falha na análise. Tente novamente.";
        setError(message);
        setState("error");
      }
    })();
  }, [router]);

  if (state === "loading") {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContent}>
          <Logo size="md" />
          <Text style={styles.loadingText}>
            Identificando estabelecimento...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (state === "error") {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
          <Button fullWidth onPress={() => router.replace("/(main)/camera")}>
            Tentar novamente
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (!result) {
    return <LoadingView />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>Resumo</Text>
        <ResultSummaryView result={result} />
        <Button fullWidth onPress={() => router.push(DETAILS_ROUTE)}>
          Ver detalhes completos
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  loadingText: {
    ...theme.typography.caption,
    textAlign: "center",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.sm + 4,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.sm + 4,
  },
  eyebrow: {
    ...theme.typography.caption,
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: theme.spacing.xs,
    paddingTop: theme.spacing.sm,
  },
  errorText: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.error,
    textAlign: "center",
  },
});
