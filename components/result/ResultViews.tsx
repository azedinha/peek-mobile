import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { theme } from "@/constants/theme";
import type { PeekAnalysisResult } from "@/types/peek";

function SourceHeader({ title, source }: { title: string; source: string }) {
  return (
    <View style={styles.sourceHeader}>
      <Text style={styles.sourceTitle}>{title}</Text>
      <Text style={styles.sourceLabel}>Fonte: {source}</Text>
    </View>
  );
}

function UnavailableSource({ message }: { message: string }) {
  return <Text style={styles.unavailable}>{message}</Text>;
}

function ExternalLink({ label, url }: { label: string; url: string }) {
  return (
    <Pressable onPress={() => Linking.openURL(url)}>
      <Text style={styles.link}>{label} ↗</Text>
    </Pressable>
  );
}

export function SourceDetailSections({ result }: { result: PeekAnalysisResult }) {
  return (
    <>
      <Card>
        <SourceHeader title="Google Reviews" source="Google" />
        {result.google.available ? (
          <View style={styles.sourceBody}>
            <Text style={styles.rating}>
              {result.google.rating?.toFixed(1)}★
              <Text style={styles.ratingMeta}>
                {" "}
                {result.google.totalReviews?.toLocaleString("pt-BR")} avaliações
              </Text>
            </Text>
            {result.google.profileUrl && (
              <ExternalLink
                label="Abrir no Google"
                url={result.google.profileUrl}
              />
            )}
          </View>
        ) : (
          <UnavailableSource message="Dados do Google Reviews não disponíveis para este estabelecimento." />
        )}
      </Card>

      <Card>
        <SourceHeader title="Reclame Aqui" source="Reclame Aqui" />
        {result.reclameAqui.available ? (
          <View style={styles.sourceBody}>
            {result.reclameAqui.score != null && (
              <Text style={styles.sourceLine}>
                Nota: {result.reclameAqui.score.toFixed(1)}
              </Text>
            )}
            {result.reclameAqui.solveRatePercent != null && (
              <Text style={styles.sourceLine}>
                Taxa de solução: {result.reclameAqui.solveRatePercent}%
              </Text>
            )}
            {result.reclameAqui.totalComplaints != null && (
              <Text style={styles.sourceLine}>
                Reclamações:{" "}
                {result.reclameAqui.totalComplaints.toLocaleString("pt-BR")}
              </Text>
            )}
            {result.reclameAqui.profileUrl && (
              <ExternalLink
                label="Ver perfil"
                url={result.reclameAqui.profileUrl}
              />
            )}
          </View>
        ) : (
          <UnavailableSource message="Dados do Reclame Aqui ainda não coletados para este estabelecimento." />
        )}
      </Card>

      <Card>
        <SourceHeader title="Consumidor.gov" source="Consumidor.gov.br" />
        {result.consumidorGov.available ? (
          <View style={styles.sourceBody}>
            {result.consumidorGov.totalComplaints != null && (
              <Text style={styles.sourceLine}>
                Reclamações:{" "}
                {result.consumidorGov.totalComplaints.toLocaleString("pt-BR")}
              </Text>
            )}
            {result.consumidorGov.resolvedPercent != null && (
              <Text style={styles.sourceLine}>
                Resolvidas: {result.consumidorGov.resolvedPercent}%
              </Text>
            )}
            {result.consumidorGov.profileUrl && (
              <ExternalLink
                label="Ver no Consumidor.gov"
                url={result.consumidorGov.profileUrl}
              />
            )}
          </View>
        ) : (
          <UnavailableSource message="Dados do Consumidor.gov ainda não coletados para este estabelecimento." />
        )}
      </Card>

      <Card>
        <SourceHeader title="Notícias" source="imprensa" />
        {result.news.available ? (
          <View style={styles.sourceBody}>
            {result.news.totalCount != null && (
              <Text style={styles.sourceLine}>
                {result.news.totalCount} notícia
                {result.news.totalCount === 1 ? "" : "s"} encontrada
                {result.news.totalCount === 1 ? "" : "s"}
              </Text>
            )}
            {result.news.highlights?.map((item) => (
              <Pressable
                key={item.url}
                style={styles.newsItem}
                onPress={() => Linking.openURL(item.url)}
              >
                <Text style={styles.newsTitle}>{item.title}</Text>
                <Text style={styles.newsSource}>{item.source}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <UnavailableSource message="Nenhuma notícia relevante encontrada para este estabelecimento." />
        )}
      </Card>

      <Card>
        <SourceHeader title="Redes sociais" source="perfis oficiais" />
        {result.social.available && result.social.links?.length ? (
          <View style={styles.sourceBody}>
            {result.social.links.map((link) => (
              <ExternalLink key={link.url} label={link.label} url={link.url} />
            ))}
          </View>
        ) : (
          <UnavailableSource message="Nenhum perfil oficial encontrado para este estabelecimento." />
        )}
      </Card>
    </>
  );
}

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
            <Text style={styles.category}>{establishment.category}</Text>
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
            <Text style={styles.popularityMax}> / 5</Text>
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
      {result.peekSummary ? (
        <PeekSummaryCard summary={result.peekSummary} clampLines />
      ) : null}
      <PopularityCard result={result} />
      <SourcesFoundCard result={result} />
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
    fontSize: 14,
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
  sourceHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  sourceTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  sourceLabel: {
    ...theme.typography.caption,
    flexShrink: 1,
    textAlign: "right",
  },
  unavailable: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
  sourceBody: {
    gap: theme.spacing.xs,
  },
  sourceLine: {
    fontSize: 14,
    color: theme.colors.primary,
  },
  rating: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  ratingMeta: {
    fontSize: 14,
    fontWeight: "400",
    color: theme.colors.textSecondary,
  },
  link: {
    fontSize: 14,
    color: theme.colors.primary,
    textDecorationLine: "underline",
    marginTop: 4,
  },
  newsItem: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.primary,
    lineHeight: 20,
  },
  newsSource: {
    ...theme.typography.caption,
    marginTop: 4,
  },
});
