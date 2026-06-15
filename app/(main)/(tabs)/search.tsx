import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Location from "expo-location";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SearchRecentList } from "@/components/search/SearchRecentList";
import { SearchResultCard } from "@/components/search/SearchResultCard";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { AnalyzeApiError, searchPlaces } from "@/lib/api";
import { addRecentSearchQuery, getRecentSearchQueries } from "@/lib/search-history";
import { SEARCH_PLACEHOLDER_PHOTO } from "@/lib/search";
import { clearAnalysisResult, saveCaptureSession } from "@/lib/session";
import { RESULT_ROUTE } from "@/lib/routes";
import { theme } from "@/constants/theme";
import type { PlaceSearchResult } from "@/types/peek";

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const [results, setResults] = useState<PlaceSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        const queries = await getRecentSearchQueries();
        if (active) setRecentQueries(queries);
      })();

      return () => {
        active = false;
      };
    }, [])
  );

  const runSearch = useCallback(async (rawQuery: string) => {
    const trimmed = rawQuery.trim();
    if (!trimmed) return;

    Keyboard.dismiss();
    setQuery(trimmed);
    setIsSearching(true);
    setError(null);
    setHasSearched(true);

    try {
      let coords: { lat?: number; lng?: number } = {};
      const permission = await Location.getForegroundPermissionsAsync();
      if (permission.granted) {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
      }

      const response = await searchPlaces(trimmed, coords);
      setResults(response.results);
      const updated = await addRecentSearchQuery(trimmed);
      setRecentQueries(updated);
    } catch (err) {
      const message =
        err instanceof AnalyzeApiError
          ? err.message
          : "Não foi possível buscar estabelecimentos.";
      setResults([]);
      setError(message);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSelectResult = useCallback(
    async (result: PlaceSearchResult) => {
      const capturedAt = new Date().toISOString();

      await clearAnalysisResult();
      await saveCaptureSession({
        photo: SEARCH_PLACEHOLDER_PHOTO,
        lat: result.lat,
        lng: result.lng,
        capturedAt,
        placeId: result.placeId,
        searchQuery: query.trim() || result.name,
        eligibleForEvaluation: true,
        consultationSource: "search",
      });

      router.push(RESULT_ROUTE);
    },
    [query, router]
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <ScreenHeader title="Peek a Review" />
      </View>

      <View style={styles.searchBar}>
        <Ionicons
          name="search-outline"
          size={18}
          color={theme.colors.textSecondary}
        />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Pesquisar"
          placeholderTextColor={theme.colors.textSecondary}
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={() => runSearch(query)}
          autoCapitalize="words"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        {isSearching ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : null}
      </View>

      <SearchRecentList
        queries={recentQueries}
        onSelect={(value) => {
          setQuery(value);
          runSearch(value);
        }}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={results}
        keyExtractor={(item) => item.placeId}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isSearching && hasSearched && !error ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Nenhum estabelecimento encontrado para esta busca.
              </Text>
            </View>
          ) : !hasSearched ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Digite o nome e pressione buscar para ver resultados.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <SearchResultCard
            result={item}
            onPress={() => handleSelectResult(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.primary,
    paddingVertical: 10,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
    flexGrow: 1,
  },
  separator: {
    height: theme.spacing.sm,
  },
  emptyState: {
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  emptyText: {
    ...theme.typography.caption,
    textAlign: "center",
    lineHeight: 20,
  },
  error: {
    ...theme.typography.caption,
    color: theme.colors.error,
    textAlign: "center",
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
  },
});
