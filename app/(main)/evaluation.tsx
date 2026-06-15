import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { PlaceEvaluationFlow } from "@/components/evaluation/PlaceEvaluationFlow";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { LoadingView } from "@/components/ui/LoadingView";
import { useAuth } from "@/hooks/useAuth";
import { fetchPlaceEvaluationStatus } from "@/lib/api";
import {
  clearPendingEvaluation,
  getPendingEvaluation,
  type PendingEvaluation,
} from "@/lib/evaluation-pending";
import { HOME_ROUTE } from "@/lib/routes";
import { theme } from "@/constants/theme";

export default function EvaluationScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [pending, setPending] = useState<PendingEvaluation | null>(null);
  const [loading, setLoading] = useState(true);

  const exitToHome = useCallback(() => {
    router.replace(HOME_ROUTE);
  }, [router]);

  const handleDismiss = useCallback(async () => {
    await clearPendingEvaluation();
    exitToHome();
  }, [exitToHome]);

  const handleComplete = useCallback(async () => {
    await clearPendingEvaluation();
    exitToHome();
  }, [exitToHome]);

  useEffect(() => {
    let active = true;

    (async () => {
      const stored = await getPendingEvaluation();

      if (!stored?.detailsCompleted || !user) {
        if (active) {
          setLoading(false);
          exitToHome();
        }
        return;
      }

      const status = await fetchPlaceEvaluationStatus(stored.placeId);
      if (!active) return;

      if (status?.alreadyRated) {
        await clearPendingEvaluation();
        exitToHome();
        return;
      }

      setPending(stored);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [exitToHome, user]);

  if (loading) {
    return <LoadingView />;
  }

  if (!pending) {
    return <LoadingView />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <ScreenHeader eyebrow="Avaliação" title="Conte sua experiência" />
        <PlaceEvaluationFlow
          placeId={pending.placeId}
          establishmentName={pending.establishmentName}
          consultationSource={pending.consultationSource}
          onComplete={handleComplete}
          onDismiss={handleDismiss}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
});
