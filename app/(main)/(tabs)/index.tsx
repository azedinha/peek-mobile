import { useCallback } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Logo } from "@/components/Logo";
import { RadarPeekSection } from "@/components/home/RadarPeekSection";
import { HomeHighlightsSection } from "@/components/home/HomeHighlightsSection";
import { useAuth } from "@/hooks/useAuth";
import { fetchPlaceEvaluationStatus } from "@/lib/api";
import {
  clearPendingEvaluation,
  getPendingEvaluation,
} from "@/lib/evaluation-pending";
import { EVALUATION_ROUTE } from "@/lib/routes";
import { theme } from "@/constants/theme";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        if (!user) return;

        const pending = await getPendingEvaluation();
        if (!active || !pending?.detailsCompleted) return;

        const status = await fetchPlaceEvaluationStatus(pending.placeId);
        if (!active) return;

        if (status?.alreadyRated) {
          await clearPendingEvaluation();
          return;
        }

        router.push(EVALUATION_ROUTE);
      })();

      return () => {
        active = false;
      };
    }, [router, user])
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoHeader}>
          <Logo size="md" />
        </View>

        <RadarPeekSection />

        <HomeHighlightsSection />
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
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  logoHeader: {
    alignItems: "center",
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.sm,
  },
});
