import { useEffect, useState } from "react";
import { Text, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { LoadingView } from "@/components/ui/LoadingView";
import {
  EstablishmentCard,
  PeekSummaryCard,
  SourceDetailSections,
} from "@/components/result/ResultViews";
import { theme } from "@/constants/theme";
import { getAnalysisResult } from "@/lib/session";
import type { PeekAnalysisResult } from "@/types/peek";

export default function DetailsScreen() {
  const router = useRouter();
  const [result, setResult] = useState<PeekAnalysisResult | null>(null);

  useEffect(() => {
    (async () => {
      const stored = await getAnalysisResult();
      if (!stored) {
        router.replace("/(main)/camera");
        return;
      }
      setResult(stored);
    })();
  }, [router]);

  if (!result) {
    return <LoadingView />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>Detalhes completos</Text>

        <EstablishmentCard result={result} />

        {result.peekSummary ? (
          <PeekSummaryCard summary={result.peekSummary} />
        ) : null}

        <SourceDetailSections result={result} />

        <Button fullWidth onPress={() => router.replace("/(main)/camera")}>
          Nova consulta
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
});
