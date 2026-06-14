import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { theme } from "@/constants/theme";
import type {
  ConsumidorGovSource,
  GoogleReviewsSource,
  NewsSource,
  PeekAnalysisResult,
  ReclameAquiSource,
  SocialSource,
} from "@/types/peek";

function DetailBlock({
  title,
  source,
  children,
}: {
  title: string;
  source?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <View style={styles.blockHeader}>
        <Text style={styles.blockTitle}>{title}</Text>
        {source ? <Text style={styles.blockSource}>{source}</Text> : null}
      </View>
      {children}
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricTile}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function BulletList({ items }: { items: string[] }) {
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

function IndicatorList({
  items,
}: {
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <View style={styles.indicatorList}>
      {items.map((indicator) => (
        <View
          key={`${indicator.label}-${indicator.value}`}
          style={styles.indicatorRow}
        >
          <Text style={styles.indicatorLabel}>{indicator.label}</Text>
          <Text style={styles.indicatorValue}>{indicator.value}</Text>
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

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function identificationLabel(
  mode: NonNullable<PeekAnalysisResult["identificationMode"]>
): string {
  return mode === "proximity_hypothesis"
    ? "Hipótese por proximidade"
    : "Identificação confirmada";
}

function hasGoogleData(google: GoogleReviewsSource): boolean {
  return google.available;
}

function hasReclameAquiData(reclameAqui: ReclameAquiSource): boolean {
  return reclameAqui.available;
}

function hasConsumidorGovData(consumidorGov: ConsumidorGovSource): boolean {
  return consumidorGov.available;
}

function hasNewsData(news: NewsSource): boolean {
  return (
    news.available &&
    ((news.highlights?.length ?? 0) > 0 || (news.totalCount ?? 0) > 0)
  );
}

function hasSocialData(social: SocialSource): boolean {
  return social.available && (social.links?.length ?? 0) > 0;
}

function hasAdditionalInfoData(result: PeekAnalysisResult): boolean {
  const { establishment } = result;
  return Boolean(
    establishment.address ||
      establishment.isOpen !== null ||
      result.analyzedAt ||
      result.capturedAt ||
      result.identifiedAutomatically ||
      establishment.placeId
  );
}

function GoogleSection({ google }: { google: GoogleReviewsSource }) {
  return (
    <DetailBlock title="Google Reviews" source="Google">
      <View style={styles.sectionBody}>
        {(google.rating != null || google.totalReviews != null) && (
          <View style={styles.heroRow}>
            {google.rating != null && (
              <Text style={styles.heroScore}>
                {google.rating.toFixed(1)}
                <Text style={styles.heroStar}> ★</Text>
              </Text>
            )}
            {google.totalReviews != null && (
              <Text style={styles.heroMeta}>
                {google.totalReviews.toLocaleString("pt-BR")} avaliações
              </Text>
            )}
          </View>
        )}

        {(google.topPraises?.length ?? 0) > 0 && (
          <>
            <Text style={styles.subheading}>Principais elogios</Text>
            <BulletList items={google.topPraises!} />
          </>
        )}

        {(google.topCriticisms?.length ?? 0) > 0 && (
          <>
            <Text style={styles.subheading}>Principais críticas</Text>
            <BulletList items={google.topCriticisms!} />
          </>
        )}

        {google.profileUrl ? (
          <Button fullWidth onPress={() => Linking.openURL(google.profileUrl!)}>
            Abrir no Google
          </Button>
        ) : null}
      </View>
    </DetailBlock>
  );
}

function ReclameAquiSection({
  reclameAqui,
}: {
  reclameAqui: ReclameAquiSource;
}) {
  return (
    <DetailBlock title="Reclame Aqui" source="Reclame Aqui">
      <View style={styles.sectionBody}>
        {reclameAqui.name ? (
          <DetailRow label="Empresa" value={reclameAqui.name} />
        ) : null}

        <View style={styles.metricsRow}>
          {reclameAqui.score != null ? (
            <MetricTile
              label="Nota"
              value={`${reclameAqui.score.toFixed(1)} / 10`}
            />
          ) : null}
          {reclameAqui.totalComplaints != null ? (
            <MetricTile
              label="Reclamações"
              value={reclameAqui.totalComplaints.toLocaleString("pt-BR")}
            />
          ) : null}
        </View>

        {reclameAqui.respondedCount != null ? (
          <DetailRow
            label="Respondidas"
            value={reclameAqui.respondedCount.toLocaleString("pt-BR")}
          />
        ) : null}
        {reclameAqui.respondedPercent != null ? (
          <DetailRow
            label="Taxa de resposta"
            value={`${reclameAqui.respondedPercent}%`}
          />
        ) : null}
        {reclameAqui.solveRatePercent != null ? (
          <DetailRow
            label="Taxa de solução"
            value={`${reclameAqui.solveRatePercent}%`}
          />
        ) : null}
        {reclameAqui.reputationStatus ? (
          <DetailRow label="Reputação" value={reclameAqui.reputationStatus} />
        ) : null}

        {(reclameAqui.indicators?.length ?? 0) > 0 ? (
          <>
            <Text style={styles.subheading}>Indicadores</Text>
            <IndicatorList items={reclameAqui.indicators!} />
          </>
        ) : null}

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
    </DetailBlock>
  );
}

function ConsumidorGovSection({
  consumidorGov,
}: {
  consumidorGov: ConsumidorGovSource;
}) {
  const registeredLabel =
    consumidorGov.registered === true
      ? "Cadastrado"
      : consumidorGov.registered === false
        ? "Não cadastrado"
        : null;

  return (
    <DetailBlock title="Consumidor.gov" source="Consumidor.gov.br">
      <View style={styles.sectionBody}>
        {consumidorGov.name ? (
          <DetailRow label="Empresa" value={consumidorGov.name} />
        ) : null}

        <View style={styles.metricsRow}>
          {registeredLabel ? (
            <MetricTile label="Cadastro" value={registeredLabel} />
          ) : null}
          {consumidorGov.resolvedPercent != null ? (
            <MetricTile
              label="Solução"
              value={`${consumidorGov.resolvedPercent}%`}
            />
          ) : null}
        </View>

        {consumidorGov.totalComplaints != null ? (
          <DetailRow
            label="Reclamações"
            value={consumidorGov.totalComplaints.toLocaleString("pt-BR")}
          />
        ) : null}

        {(consumidorGov.indicators?.length ?? 0) > 0 ? (
          <>
            <Text style={styles.subheading}>Indicadores</Text>
            <IndicatorList items={consumidorGov.indicators!} />
          </>
        ) : null}

        {consumidorGov.profileUrl ? (
          <Button
            fullWidth
            variant="outline"
            onPress={() => Linking.openURL(consumidorGov.profileUrl!)}
          >
            Abrir no Consumidor.gov
          </Button>
        ) : null}
      </View>
    </DetailBlock>
  );
}

function NewsSection({ news }: { news: NewsSource }) {
  return (
    <DetailBlock title="Notícias" source="Imprensa">
      <View style={styles.sectionBody}>
        {news.totalCount != null ? (
          <Text style={styles.newsCount}>
            {news.totalCount} notícia{news.totalCount === 1 ? "" : "s"} encontrada
            {news.totalCount === 1 ? "" : "s"}
          </Text>
        ) : null}

        {news.highlights?.map((item) => {
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
    </DetailBlock>
  );
}

function SocialSection({ social }: { social: SocialSource }) {
  return (
    <DetailBlock title="Redes sociais" source="Perfis oficiais">
      <View style={styles.sectionBody}>
        {social.links!.map((link) => (
          <Pressable
            key={link.url}
            style={styles.socialLink}
            onPress={() => Linking.openURL(link.url)}
          >
            <Text style={styles.socialLabel}>{link.label}</Text>
            <Text style={styles.socialArrow}>↗</Text>
          </Pressable>
        ))}
      </View>
    </DetailBlock>
  );
}

function AdditionalInfoSection({ result }: { result: PeekAnalysisResult }) {
  const { establishment } = result;

  return (
    <DetailBlock title="Informações adicionais">
      <View style={styles.sectionBody}>
        {establishment.address ? (
          <DetailRow label="Endereço" value={establishment.address} />
        ) : null}
        {establishment.isOpen === true ? (
          <DetailRow label="Status" value="Aberto agora" />
        ) : null}
        {establishment.isOpen === false ? (
          <DetailRow label="Status" value="Fechado agora" />
        ) : null}
        {result.analyzedAt ? (
          <DetailRow
            label="Consulta realizada"
            value={formatDateTime(result.analyzedAt)}
          />
        ) : null}
        {result.identifiedAutomatically && result.identificationMode ? (
          <DetailRow
            label="Identificação"
            value={`${identificationLabel(result.identificationMode)} · ${Math.round(result.identificationConfidence ?? 0)}% de confiança`}
          />
        ) : null}
        {establishment.placeId ? (
          <DetailRow label="Referência Google" value={establishment.placeId} />
        ) : null}
      </View>
    </DetailBlock>
  );
}

export function DetailsSections({ result }: { result: PeekAnalysisResult }) {
  const sections = [
    hasGoogleData(result.google) ? (
      <GoogleSection key="google" google={result.google} />
    ) : null,
    hasReclameAquiData(result.reclameAqui) ? (
      <ReclameAquiSection key="ra" reclameAqui={result.reclameAqui} />
    ) : null,
    hasConsumidorGovData(result.consumidorGov) ? (
      <ConsumidorGovSection key="cg" consumidorGov={result.consumidorGov} />
    ) : null,
    hasNewsData(result.news) ? (
      <NewsSection key="news" news={result.news} />
    ) : null,
    hasSocialData(result.social) ? (
      <SocialSection key="social" social={result.social} />
    ) : null,
    hasAdditionalInfoData(result) ? (
      <AdditionalInfoSection key="additional" result={result} />
    ) : null,
  ].filter(Boolean);

  if (!sections.length) {
    return (
      <Text style={styles.emptyPage}>
        Nenhum detalhe adicional disponível para este estabelecimento.
      </Text>
    );
  }

  return <View style={styles.stack}>{sections}</View>;
}

const styles = StyleSheet.create({
  stack: {
    gap: theme.spacing.sm + 4,
  },
  blockHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  blockTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.primary,
    flex: 1,
  },
  blockSource: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    flexShrink: 1,
    textAlign: "right",
  },
  sectionBody: {
    gap: theme.spacing.sm,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: theme.spacing.sm,
    flexWrap: "wrap",
  },
  heroScore: {
    fontSize: 30,
    fontWeight: "600",
    color: theme.colors.primary,
    lineHeight: 34,
  },
  heroStar: {
    fontSize: 18,
    fontWeight: "400",
    color: theme.colors.textSecondary,
  },
  heroMeta: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    paddingBottom: 2,
  },
  metricsRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  metricTile: {
    flex: 1,
    gap: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.primary,
    lineHeight: 22,
  },
  detailRow: {
    gap: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 10,
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
  indicatorList: {
    gap: theme.spacing.xs,
  },
  indicatorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 10,
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
    textAlign: "right",
  },
  newsCount: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  newsItem: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background,
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
  socialLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  socialLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.primary,
    flex: 1,
  },
  socialArrow: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  emptyPage: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.xs,
  },
});
