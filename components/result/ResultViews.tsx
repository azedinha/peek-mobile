import { StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { CommunityRatingSection } from "@/components/result/CommunityRatingSection";
import { theme } from "@/constants/theme";
import type { PeekAnalysisResult } from "@/types/peek";

function getSourceHint(
  result: PeekAnalysisResult,
  source: "google" | "reclameAqui" | "consumidorGov" | "news"
): string {
  switch (source) {
    case "google":
      if (!result.google.available) return "Dados não disponíveis";
      if (result.google.rating != null && result.google.totalReviews != null) {
        return `${result.google.rating.toFixed(1)}★ · ${result.google.totalReviews.toLocaleString("pt-BR")} avaliações`;
      }
      return "Dados encontrados";
    case "reclameAqui":
      if (result.reclameAqui.available) {
        return result.reclameAqui.score != null
          ? `Nota ${result.reclameAqui.score.toFixed(1)} / 10`
          : "Dados encontrados";
      }
      return result.reclameAqui.notFoundMessage ?? "Não encontrado";
    case "consumidorGov":
      if (result.consumidorGov.available) {
        return result.consumidorGov.resolvedPercent != null
          ? `Solução ${result.consumidorGov.resolvedPercent}%`
          : "Cadastrada";
      }
      return result.consumidorGov.notFoundMessage ?? "Não cadastrada";
    case "news":
      return result.news.available
        ? `${result.news.totalCount ?? 0} notícia${result.news.totalCount === 1 ? "" : "s"}`
        : "Nenhuma notícia encontrada";
  }
}

const SOURCE_ITEMS = [
  { key: "google" as const, label: "Google Reviews" },
  { key: "reclameAqui" as const, label: "Reclame Aqui" },
  { key: "consumidorGov" as const, label: "Consumidor.gov" },
  { key: "news" as const, label: "Notícias" },
];

export function EstablishmentCard({ result }: { result: PeekAnalysisResult }) {
  const { establishment } = result;

  return (
    <Card>
      <View style={styles.establishmentRow}>
        <Text style={styles.emoji} accessibilityElementsHidden>
          {establishment.emoji}
        </Text>
        <View style={styles.establishmentInfo}>
          <Text style={styles.establishmentName}>{establishment.name}</Text>
          {establishment.category ? (
            <Text style={styles.category}>{establishment.category.toUpperCase()}</Text>
          ) : null}
          <View style={styles.badges}>
            {establishment.isOpen === true && (
              <View style={styles.badgeOpen}>
                <Text style={styles.badgeOpenText}>Aberto agora</Text>
              </View>
            )}
            {establishment.isOpen === false && (
              <View style={styles.badgeClosed}>
                <Text style={styles.badgeClosedText}>Fechado agora</Text>
              </View>
            )}
            {result.identifiedAutomatically && (
              <View style={styles.badgeAuto}>
                <Text style={styles.badgeAutoText}>
                  Identificado automaticamente
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.address}>{establishment.address}</Text>
        </View>
      </View>
    </Card>
  );
}

export function PeekSummaryCard({
  summary,
  clampLines = false,
}: {
  summary: string;
  clampLines?: boolean;
}) {
  return (
    <Card>
      <Text style={styles.sectionTitle}>Resumo Peek</Text>
      <Text
        style={styles.summary}
        numberOfLines={clampLines ? 4 : undefined}
      >
        {summary}
      </Text>
    </Card>
  );
}

export function PopularityCard({ result }: { result: PeekAnalysisResult }) {
  return (
    <Card>
      <Text style={styles.sectionTitle}>Popularidade</Text>
      {result.google.available &&
      result.google.rating != null &&
      result.google.totalReviews != null ? (
        <View style={styles.popularityBody}>
          <Text style={styles.popularityScore}>
            {result.google.rating.toFixed(1)}
            <Text style={styles.popularityMax}> ★ / 5</Text>
          </Text>
          <Text style={styles.popularityMeta}>
            {result.google.totalReviews.toLocaleString("pt-BR")} avaliações no
            Google
          </Text>
        </View>
      ) : (
        <Text style={styles.unavailable}>
          Dados de popularidade não disponíveis para este estabelecimento.
        </Text>
      )}
    </Card>
  );
}

export function SourcesFoundCard({ result }: { result: PeekAnalysisResult }) {
  return (
    <Card>
      <Text style={styles.sectionTitle}>Fontes encontradas</Text>
      <View style={styles.sourcesList}>
        {SOURCE_ITEMS.map((item) => {
          const available =
            item.key === "google"
              ? result.google.available
              : item.key === "reclameAqui"
                ? result.reclameAqui.available
                : item.key === "consumidorGov"
                  ? result.consumidorGov.available
                  : result.news.available;

          return (
            <View key={item.key} style={styles.sourceRow}>
              <View style={styles.sourceRowLeft}>
                <View
                  style={[
                    styles.sourceDot,
                    available ? styles.sourceDotActive : styles.sourceDotInactive,
                  ]}
                />
                <Text style={styles.sourceRowLabel}>{item.label}</Text>
              </View>
              <Text style={styles.sourceRowHint}>
                {getSourceHint(result, item.key)}
              </Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

export function ResultSummaryView({ result }: { result: PeekAnalysisResult }) {
  return (
    <View style={styles.summaryStack}>
      <EstablishmentCard result={result} />
      <PopularityCard result={result} />
      <CommunityRatingSection result={result} />
      <SourcesFoundCard result={result} />
      {result.peekSummary ? (
        <PeekSummaryCard summary={result.peekSummary} clampLines />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  summaryStack: {
    gap: theme.spacing.sm + 4,
  },
  establishmentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
  },
  emoji: {
    fontSize: 40,
    lineHeight: 48,
  },
  establishmentInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  establishmentName: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.primary,
    lineHeight: 26,
  },
  category: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
    color: theme.colors.textSecondary,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  badgeOpen: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeOpenText: {
    fontSize: 12,
    fontWeight: "500",
    color: theme.colors.primary,
  },
  badgeClosed: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeClosedText: {
    fontSize: 12,
    fontWeight: "500",
    color: theme.colors.textSecondary,
  },
  badgeAuto: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeAutoText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  address: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  summary: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },
  popularityBody: {
    gap: 4,
  },
  popularityScore: {
    fontSize: 28,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  popularityMax: {
    fontSize: 16,
    fontWeight: "400",
    color: theme.colors.textSecondary,
  },
  popularityMeta: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  communityBody: {
    gap: theme.spacing.sm,
  },
  communityBlock: {
    gap: theme.spacing.xs,
  },
  communityLabel: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  communityLabelGood: {
    color: theme.colors.primary,
  },
  communityLabelCritical: {
    color: theme.colors.error,
  },
  communityItem: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.primary,
    paddingLeft: 12,
    borderLeftWidth: 2,
  },
  communityItemGood: {
    borderLeftColor: theme.colors.border,
  },
  communityItemCritical: {
    borderLeftColor: theme.colors.error,
  },
  communitySource: {
    ...theme.typography.caption,
  },
  sourcesList: {
    gap: theme.spacing.sm,
  },
  sourceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.sm,
  },
  sourceRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    flex: 1,
  },
  sourceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sourceDotActive: {
    backgroundColor: theme.colors.primary,
  },
  sourceDotInactive: {
    backgroundColor: theme.colors.border,
  },
  sourceRowLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.primary,
  },
  sourceRowHint: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: "right",
    flexShrink: 1,
    maxWidth: "55%",
  },
  unavailable: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
});
