import { useEffect, useState } from "react";
import { Text, StyleSheet, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { LoadingView } from "@/components/ui/LoadingView";
import { DetailsSections } from "@/components/details/DetailsSections";
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
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Detalhes</Text>
          <Text style={styles.title}>{result.establishment.name}</Text>
          {result.establishment.category ? (
            <Text style={styles.category}>
              {result.establishment.category.toUpperCase()}
            </Text>
          ) : null}
        </View>

        <DetailsSections result={result} />
      </ScrollView>

      <View style={styles.footer}>
        <Button fullWidth onPress={() => router.replace("/(main)/camera")}>
          Nova consulta
        </Button>
      </View>
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
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.sm + 4,
  },
  header: {
    paddingHorizontal: theme.spacing.xs,
    paddingTop: theme.spacing.sm,
    gap: 4,
  },
  eyebrow: {
    ...theme.typography.caption,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    ...theme.typography.title,
    lineHeight: 28,
  },
  category: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
    color: theme.colors.textSecondary,
  },
  footer: {
    paddingHorizontal: theme.spacing.sm + 4,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
});
