import AsyncStorage from "@react-native-async-storage/async-storage";

const SEARCH_HISTORY_KEY = "peek-search-history";
const MAX_SEARCH_HISTORY = 8;

export async function getRecentSearchQueries(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function addRecentSearchQuery(query: string): Promise<string[]> {
  const trimmed = query.trim();
  if (!trimmed) return getRecentSearchQueries();

  const current = await getRecentSearchQueries();
  const updated = [
    trimmed,
    ...current.filter(
      (item) => item.localeCompare(trimmed, "pt-BR", { sensitivity: "base" }) !== 0
    ),
  ].slice(0, MAX_SEARCH_HISTORY);

  await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  return updated;
}
