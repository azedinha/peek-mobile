import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Logo } from "@/components/Logo";
import { HomeGamificationCard } from "@/components/home/HomeGamificationCard";
import { HomeHighlightsSection } from "@/components/home/HomeHighlightsSection";
import { LoadingView } from "@/components/ui/LoadingView";
import { useAuth } from "@/hooks/useAuth";
import { fetchPlaceEvaluationStatus, fetchUserProgression } from "@/lib/api";
import {
  clearPendingEvaluation,
  getPendingEvaluation,
} from "@/lib/evaluation-pending";
import { DEFAULT_USER_PROGRESSION } from "@/lib/progression";
import { EVALUATION_ROUTE } from "@/lib/routes";
import { theme } from "@/constants/theme";
import type { UserProgression } from "@/types/peek";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [progression, setProgression] = useState<UserProgression | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        const progressionData = user
          ? (await fetchUserProgression()) ?? DEFAULT_USER_PROGRESSION
          : DEFAULT_USER_PROGRESSION;

        if (active) {
          setProgression(progressionData);
        }

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

  if (!progression) {
    return <LoadingView />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoHeader}>
          <Logo size="md" />
        </View>

        <HomeGamificationCard
          progression={progression}
          isLiveData={Boolean(user)}
        />

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
