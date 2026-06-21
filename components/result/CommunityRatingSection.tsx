import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Card } from "@/components/ui/Card";
import { theme } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchCommunityRating,
  submitCommunityRatingVote,
} from "@/lib/api";
import type {
  CommunityRatingSource,
  CommunityRatingValue,
  PeekAnalysisResult,
} from "@/types/peek";

const EMPTY_BREAKDOWN: CommunityRatingSource = {
  available: false,
  totalVotes: 0,
  userRating: null,
  breakdown: [
    { rating: "excelente", label: "Excelente", count: 0, percent: 0 },
    { rating: "boa", label: "Boa", count: 0, percent: 0 },
    { rating: "ruim", label: "Ruim", count: 0, percent: 0 },
    { rating: "pessima", label: "Péssima", count: 0, percent: 0 },
  ],
};

const BAR_COLORS: Record<CommunityRatingValue, string> = {
  excelente: theme.colors.primary,
  boa: "rgba(76, 68, 59, 0.55)",
  ruim: "#B5850A",
  pessima: theme.colors.error,
};

export function CommunityRatingSection({
  result,
}: {
  result: PeekAnalysisResult;
}) {
  const { user, isConfigured } = useAuth();
  const establishmentKey = result.establishment.placeId;
  const [stats, setStats] = useState<CommunityRatingSource>(
    result.communityRating ?? EMPTY_BREAKDOWN
  );
  const [submitting, setSubmitting] = useState<CommunityRatingValue | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!establishmentKey) return;

    fetchCommunityRating(establishmentKey).then((data) => {
      if (data) setStats(data);
    });
  }, [establishmentKey]);

  if (!establishmentKey || !stats.available) {
    return (
      <Card>
        <Text style={styles.sectionTitle}>Avaliação da comunidade</Text>
        <Text style={styles.unavailable}>
          Avaliações da comunidade Peek ainda não estão disponíveis para este
          estabelecimento.
        </Text>
      </Card>
    );
  }

  const handleVote = async (rating: CommunityRatingValue) => {
    if (!user) {
      setError("Faça login para avaliar este estabelecimento.");
      return;
    }

    setSubmitting(rating);
    setError(null);

    try {
      const updated = await submitCommunityRatingVote({
        establishmentKey,
        establishmentName: result.establishment.name,
        establishmentAddress: result.establishment.address,
        rating,
      });
      setStats(updated);
    } catch (voteError) {
      setError(
        voteError instanceof Error
          ? voteError.message
          : "Falha ao salvar avaliação."
      );
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <Card>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Avaliação da comunidade</Text>
        <Text style={styles.sourceLabel}>Peek</Text>
      </View>

      <Text style={styles.meta}>
        {stats.totalVotes === 0
          ? "Seja o primeiro a avaliar este estabelecimento."
          : `${stats.totalVotes.toLocaleString("pt-BR")} ${
              stats.totalVotes === 1 ? "avaliação" : "avaliações"
            } da comunidade Peek`}
      </Text>

      <View style={styles.chips}>
        {stats.breakdown.map((item) => {
          const isSelected = stats.userRating === item.rating;
          const isLoading = submitting === item.rating;

          return (
            <Pressable
              key={item.rating}
              disabled={!!submitting}
              onPress={() => handleVote(item.rating)}
              style={[
                styles.chip,
                isSelected && styles.chipSelected,
                !!submitting && styles.chipDisabled,
              ]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.bars}>
        {stats.breakdown.map((item) => (
          <View key={`bar-${item.rating}`} style={styles.barBlock}>
            <View style={styles.barHeader}>
              <Text style={styles.barLabel}>{item.label}</Text>
              <Text style={styles.barMeta}>
                {item.percent}% · {item.count}
              </Text>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${item.percent}%`,
                    backgroundColor: BAR_COLORS[item.rating],
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      {!user && isConfigured ? (
        <Text style={styles.hint}>
          Entre na sua conta para registrar sua avaliação.
        </Text>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.primary,
    flex: 1,
  },
  sourceLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  meta: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 84,
    alignItems: "center",
  },
  chipSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
  },
  chipDisabled: {
    opacity: 0.6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "500",
    color: theme.colors.textSecondary,
  },
  chipTextSelected: {
    color: theme.colors.primary,
  },
  bars: {
    gap: theme.spacing.sm,
  },
  barBlock: {
    gap: 6,
  },
  barHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  barLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.primary,
  },
  barMeta: {
    ...theme.typography.caption,
  },
  barTrack: {
    height: 8,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: theme.radius.full,
  },
  hint: {
    ...theme.typography.caption,
    marginTop: theme.spacing.sm,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginTop: theme.spacing.sm,
    lineHeight: 18,
  },
  unavailable: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
});
