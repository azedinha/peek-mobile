import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { theme } from "@/constants/theme";
import type { PeekAnalysisResult } from "@/types/peek";

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function BulletList({
  items,
  emptyMessage,
}: {
  items?: string[];
  emptyMessage: string;
}) {
  if (!items?.length) {
    return <Text style={styles.emptyText}>{emptyMessage}</Text>;
  }

  return (
    <View style={styles.bulletList}>
      {items.map((item) => (
        <View key={item} style={styles.bulletItem}>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function formatNewsDate(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function DetailsSections({ result }: { result: PeekAnalysisResult }) {
  const { google, reclameAqui, consumidorGov, news } = result;

  const registeredLabel =
    consumidorGov.registered === true
      ? "Cadastrado"
      : consumidorGov.registered === false
        ? "Não cadastrado"
        : "Não verificado";

  return (
    <View style={styles.stack}>
      <Card>
        <SectionTitle>Google Reviews</SectionTitle>
        {google.available ? (
          <View style={styles.sectionBody}>
            <View style={styles.metricsRow}>
              <DetailRow
                label="Nota"
                value={
                  google.rating != null ? `${google.rating.toFixed(1)} / 5` : "—"
                }
              />
              <DetailRow
                label="Avaliações"
                value={
                  google.totalReviews != null
                    ? google.totalReviews.toLocaleString("pt-BR")
                    : "—"
                }
              />
            </View>

            <Text style={styles.subheading}>Principais elogios</Text>
            <BulletList
              items={google.topPraises}
              emptyMessage="Nenhum elogio destacado nas avaliações recentes."
            />

            <Text style={styles.subheading}>Principais críticas</Text>
            <BulletList
              items={google.topCriticisms}
              emptyMessage="Nenhuma crítica destacada nas avaliações recentes."
            />

            {google.profileUrl ? (
              <Button fullWidth onPress={() => Linking.openURL(google.profileUrl!)}>
                Abrir no Google
              </Button>
            ) : null}
          </View>
        ) : (
          <Text style={styles.emptyText}>
            Dados do Google Reviews não disponíveis para este estabelecimento.
          </Text>
        )}
      </Card>

      <Card>
        <SectionTitle>Reclame Aqui</SectionTitle>
        {reclameAqui.available ? (
          <View style={styles.sectionBody}>
            <View style={styles.metricsRow}>
              <DetailRow
                label="Nota"
                value={
                  reclameAqui.score != null
                    ? reclameAqui.score.toFixed(1)
                    : "—"
                }
              />
              <DetailRow
                label="Reclamações"
                value={
                  reclameAqui.totalComplaints != null
                    ? reclameAqui.totalComplaints.toLocaleString("pt-BR")
                    : "—"
                }
              />
            </View>
            <DetailRow
              label="Respondidas"
              value={
                reclameAqui.respondedCount != null
                  ? reclameAqui.respondedCount.toLocaleString("pt-BR")
                  : reclameAqui.solveRatePercent != null
                    ? `${reclameAqui.solveRatePercent}%`
                    : "—"
              }
            />
            {reclameAqui.profileUrl ? (
              <Button
                fullWidth
                variant="outline"
                onPress={() => Linking.openURL(reclameAqui.profileUrl!)}
              >
                Abrir Reclame Aqui
              </Button>
            ) : null}
          </View>
        ) : (
          <Text style={styles.emptyText}>
            Dados do Reclame Aqui ainda não coletados para este estabelecimento.
          </Text>
        )}
      </Card>

      <Card>
        <SectionTitle>Consumidor.gov</SectionTitle>
        {consumidorGov.available ? (
          <View style={styles.sectionBody}>
            <DetailRow label="Status cadastrado" value={registeredLabel} />
            <Text style={styles.subheading}>Indicadores encontrados</Text>
            {consumidorGov.indicators?.length ? (
              <View style={styles.indicatorList}>
                {consumidorGov.indicators.map((indicator) => (
                  <View
                    key={`${indicator.label}-${indicator.value}`}
                    style={styles.indicatorRow}
                  >
                    <Text style={styles.indicatorLabel}>{indicator.label}</Text>
                    <Text style={styles.indicatorValue}>{indicator.value}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>Nenhum indicador encontrado.</Text>
            )}
          </View>
        ) : (
          <View style={styles.sectionBody}>
            <DetailRow label="Status cadastrado" value={registeredLabel} />
            <Text style={styles.emptyText}>
              Dados do Consumidor.gov ainda não coletados para este
              estabelecimento.
            </Text>
          </View>
        )}
      </Card>

      <Card>
        <SectionTitle>Notícias</SectionTitle>
        {news.available && news.highlights?.length ? (
          <View style={styles.sectionBody}>
            {news.highlights.map((item) => {
              const formattedDate = formatNewsDate(item.publishedAt);
              return (
                <Pressable
                  key={item.url}
                  style={styles.newsItem}
                  onPress={() => Linking.openURL(item.url)}
                >
                  <Text style={styles.newsTitle}>{item.title}</Text>
                  <Text style={styles.newsMeta}>
                    {item.source}
                    {formattedDate ? ` · ${formattedDate}` : ""}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <Text style={styles.emptyText}>
            Nenhuma notícia relevante encontrada para este estabelecimento.
          </Text>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: theme.spacing.sm + 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  sectionBody: {
    gap: theme.spacing.sm,
  },
  metricsRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  detailRow: {
    flex: 1,
    gap: 2,
  },
  detailLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    color: theme.colors.primary,
    lineHeight: 20,
  },
  subheading: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: theme.spacing.xs,
  },
  bulletList: {
    gap: theme.spacing.xs,
  },
  bulletItem: {
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.border,
    paddingLeft: theme.spacing.sm,
  },
  bulletText: {
    fontSize: 14,
    color: theme.colors.primary,
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
  indicatorList: {
    gap: theme.spacing.xs,
  },
  indicatorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: theme.spacing.sm,
  },
  indicatorLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  indicatorValue: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.primary,
  },
  newsItem: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.primary,
    lineHeight: 20,
  },
  newsMeta: {
    ...theme.typography.caption,
    marginTop: theme.spacing.xs,
  },
});
