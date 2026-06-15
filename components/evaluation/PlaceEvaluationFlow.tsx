import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button } from "@/components/ui/Button";
import { submitPlaceEvaluation } from "@/lib/api";
import {
  EXPERIENCE_RATING_OPTIONS,
  WOULD_RETURN_OPTIONS,
} from "@/lib/place-evaluation";
import { theme } from "@/constants/theme";
import type { CommunityRatingValue } from "@/types/peek";
import type { ConsultationSource } from "@/lib/evaluation-pending";

type Step = "visited" | "experience" | "would_return";

export function PlaceEvaluationFlow({
  placeId,
  establishmentName,
  consultationSource,
  onComplete,
  onDismiss,
}: {
  placeId: string;
  establishmentName: string;
  consultationSource: ConsultationSource;
  onComplete: () => void;
  onDismiss: () => void;
}) {
  const [step, setStep] = useState<Step>(
    consultationSource === "search" ? "visited" : "experience"
  );
  const [experienceRating, setExperienceRating] =
    useState<CommunityRatingValue | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleVisitedAnswer = useCallback(
    (visited: boolean) => {
      if (!visited) {
        onDismiss();
        return;
      }
      setStep("experience");
    },
    [onDismiss]
  );

  const handleExperienceSelect = useCallback((rating: CommunityRatingValue) => {
    setExperienceRating(rating);
    setStep("would_return");
  }, []);

  const handleWouldReturnSelect = useCallback(
    async (wouldReturn: boolean) => {
      if (!experienceRating || submitting) return;

      setSubmitting(true);

      try {
        await submitPlaceEvaluation({
          placeId,
          visitedPlace: true,
          experienceRating,
          wouldReturn,
          consultationSource,
        });
        onComplete();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Não foi possível salvar sua avaliação.";
        Alert.alert("Avaliação", message);
      } finally {
        setSubmitting(false);
      }
    },
    [experienceRating, onComplete, placeId, consultationSource, submitting]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.establishmentName} numberOfLines={2}>
        {establishmentName}
      </Text>

      {step === "visited" ? (
        <View style={styles.block}>
          <Text style={styles.question}>Você já visitou este local?</Text>
          <View style={styles.choiceRow}>
            {WOULD_RETURN_OPTIONS.map((option) => (
              <Pressable
                key={option.label}
                accessibilityRole="button"
                onPress={() => handleVisitedAnswer(option.value)}
                style={({ pressed }) => [
                  styles.choiceButton,
                  pressed && styles.choicePressed,
                ]}
              >
                <Text style={styles.choiceLabel}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {step === "experience" ? (
        <View style={styles.block}>
          <Text style={styles.question}>Como foi sua experiência?</Text>
          <View style={styles.optionsGrid}>
            {EXPERIENCE_RATING_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                onPress={() => handleExperienceSelect(option.value)}
                style={({ pressed }) => [
                  styles.optionButton,
                  pressed && styles.choicePressed,
                ]}
              >
                <Text style={styles.optionLabel}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {step === "would_return" ? (
        <View style={styles.block}>
          <Text style={styles.question}>Você visitaria novamente?</Text>
          {submitting ? (
            <ActivityIndicator
              color={theme.colors.primary}
              style={styles.loader}
            />
          ) : (
            <View style={styles.choiceRow}>
              {WOULD_RETURN_OPTIONS.map((option) => (
                <Pressable
                  key={option.label}
                  accessibilityRole="button"
                  onPress={() => handleWouldReturnSelect(option.value)}
                  style={({ pressed }) => [
                    styles.choiceButton,
                    pressed && styles.choicePressed,
                  ]}
                >
                  <Text style={styles.choiceLabel}>{option.label}</Text>
                </Pressable>
              ))}
            </View>
          )}
          <Button
            variant="ghost"
            onPress={() => setStep("experience")}
            disabled={submitting}
          >
            Voltar
          </Button>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
  },
  establishmentName: {
    ...theme.typography.title,
    textAlign: "center",
    lineHeight: 28,
  },
  block: {
    gap: theme.spacing.md,
  },
  question: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.primary,
    textAlign: "center",
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  optionsGrid: {
    gap: theme.spacing.sm,
  },
  optionButton: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.md,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.primary,
  },
  choiceRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  choiceButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  choiceLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  choicePressed: {
    opacity: 0.88,
    backgroundColor: theme.colors.background,
  },
  loader: {
    marginVertical: theme.spacing.md,
  },
});
