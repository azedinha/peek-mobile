import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import {
  HIGHLIGHT_CARD_WIDTH,
  HomeHighlightCard,
} from "@/components/home/HomeHighlightCard";
import { HomeHighlightsFilter } from "@/components/home/HomeHighlightsFilter";
import { HomeSourceBadge } from "@/components/home/HomeSourceBadge";
import { openHomeHighlight } from "@/lib/open-highlight";
import {
  filterHomeHighlights,
  MOCK_HOME_HIGHLIGHTS,
} from "@/lib/home-mock";
import { theme } from "@/constants/theme";
import type { HighlightCategoryFilter, HomeHighlight } from "@/types/home";

const CARD_GAP = theme.spacing.sm;

export function HomeHighlightsSection() {
  const router = useRouter();
  const [filter, setFilter] = useState<HighlightCategoryFilter>("todos");
  const [openingId, setOpeningId] = useState<string | null>(null);

  const highlights = useMemo(
    () => filterHomeHighlights(MOCK_HOME_HIGHLIGHTS, filter),
    [filter]
  );

  const handleOpen = useCallback(
    async (item: HomeHighlight) => {
      if (openingId) return;

      setOpeningId(item.id);
      try {
        await openHomeHighlight(router, item);
      } finally {
        setOpeningId(null);
      }
    },
    [openingId, router]
  );

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Destaques Peek</Text>
          <HomeSourceBadge variant="mock" />
        </View>
        <HomeHighlightsFilter value={filter} onChange={setFilter} />
      </View>

      {highlights.length > 0 ? (
        <FlatList
          horizontal
          data={highlights}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={HIGHLIGHT_CARD_WIDTH + CARD_GAP}
          snapToAlignment="start"
          contentContainerStyle={styles.carouselContent}
          ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
          renderItem={({ item }) => (
            <View>
              <HomeHighlightCard item={item} onPress={() => handleOpen(item)} />
              {openingId === item.id ? (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator color={theme.colors.primary} />
                </View>
              ) : null}
            </View>
          )}
        />
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Nenhum destaque nesta categoria por enquanto.
          </Text>
        </View>
      )}

      <Text style={styles.hint}>
        Toque em um destaque para abrir o resultado e os detalhes do
        estabelecimento. A análise usa a API real; a curadoria da lista ainda é
        demonstrativa.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: theme.spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
  headerText: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: theme.colors.primary,
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  carouselContent: {
    paddingVertical: theme.spacing.xs,
    paddingRight: theme.spacing.lg,
  },
  empty: {
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  emptyText: {
    ...theme.typography.caption,
    textAlign: "center",
    lineHeight: 20,
  },
  hint: {
    ...theme.typography.caption,
    fontSize: 12,
    lineHeight: 18,
    color: theme.colors.textSecondary,
    paddingTop: theme.spacing.xs,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: theme.radius.lg,
  },
});
