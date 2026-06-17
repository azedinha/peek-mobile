import { useCallback, useState } from "react";

import {

  ActivityIndicator,

  FlatList,

  StyleSheet,

  Text,

  View,

} from "react-native";

import { useFocusEffect, useRouter } from "expo-router";

import {

  HIGHLIGHT_CARD_WIDTH,

  HomeHighlightCard,

} from "@/components/home/HomeHighlightCard";

import { HomeHighlightsFilter } from "@/components/home/HomeHighlightsFilter";

import { HomeSourceBadge } from "@/components/home/HomeSourceBadge";

import { openHomeHighlight } from "@/lib/open-highlight";

import {

  fetchHomeHighlights,

  filterHomeHighlights,

} from "@/lib/home-highlights";

import { theme } from "@/constants/theme";

import type { HighlightCategoryFilter, HomeHighlight } from "@/types/home";



const CARD_GAP = theme.spacing.sm;



export function HomeHighlightsSection() {

  const router = useRouter();

  const [filter, setFilter] = useState<HighlightCategoryFilter>("todos");

  const [openingId, setOpeningId] = useState<string | null>(null);

  const [highlights, setHighlights] = useState<HomeHighlight[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);



  useFocusEffect(

    useCallback(() => {

      let active = true;



      (async () => {

        setLoading(true);

        setError(null);



        try {

          const data = await fetchHomeHighlights();

          if (active) {

            setHighlights(data.highlights);

          }

        } catch {

          if (active) {

            setHighlights([]);

            setError("Não foi possível carregar os destaques da semana.");

          }

        } finally {

          if (active) {

            setLoading(false);

          }

        }

      })();



      return () => {

        active = false;

      };

    }, [])

  );



  const filteredHighlights = filterHomeHighlights(highlights, filter);



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

          <Text style={styles.subtitle}>

            Os locais mais pesquisados pela comunidade Peek.

          </Text>

          {!loading && highlights.length > 0 ? (

            <HomeSourceBadge variant="live" />

          ) : null}

        </View>

        <HomeHighlightsFilter value={filter} onChange={setFilter} />

      </View>



      {loading ? (

        <View style={styles.loading}>

          <ActivityIndicator color={theme.colors.primary} />

        </View>

      ) : error ? (

        <View style={styles.empty}>

          <Text style={styles.emptyText}>{error}</Text>

        </View>

      ) : filteredHighlights.length > 0 ? (

        <FlatList

          horizontal

          data={filteredHighlights}

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

            {highlights.length === 0

              ? "Ainda não há destaques esta semana. Consulte estabelecimentos para aparecer aqui."

              : "Nenhum destaque nesta categoria por enquanto."}

          </Text>

        </View>

      )}

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

  subtitle: {

    ...theme.typography.caption,

    lineHeight: 20,

    color: theme.colors.textSecondary,

  },

  loading: {

    paddingVertical: theme.spacing.xl,

    alignItems: "center",

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

  loadingOverlay: {

    ...StyleSheet.absoluteFillObject,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "rgba(255,255,255,0.72)",

    borderRadius: theme.radius.lg,

  },

});


