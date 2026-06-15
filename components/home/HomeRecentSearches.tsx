import { StyleSheet, Text, View } from "react-native";
import { HistoryEntryCard } from "@/components/history/HistoryEntryCard";
import { theme } from "@/constants/theme";
import type { AnalysisHistoryEntry } from "@/types/peek";

interface HomeRecentSearchesProps {
  entries: AnalysisHistoryEntry[];
  onOpenEntry: (id: string) => void;
}

export function HomeRecentSearches({
  entries,
  onOpenEntry,
}: HomeRecentSearchesProps) {
  if (entries.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          Suas últimas pesquisas aparecerão aqui.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {entries.map((entry, index) => (
        <View key={entry.id}>
          <HistoryEntryCard entry={entry} onOpen={() => onOpenEntry(entry.id)} />
          {index < entries.length - 1 ? <View style={styles.separator} /> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 0,
  },
  separator: {
    height: theme.spacing.sm,
  },
  empty: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
  },
  emptyText: {
    ...theme.typography.caption,
    textAlign: "center",
    lineHeight: 20,
  },
});
