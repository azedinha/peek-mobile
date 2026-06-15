import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { theme } from "@/constants/theme";

export function SearchRecentList({
  queries,
  onSelect,
}: {
  queries: string[];
  onSelect: (query: string) => void;
}) {
  if (queries.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.label}>Pesquisas recentes</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {queries.map((query) => (
          <Pressable
            key={query}
            onPress={() => onSelect(query)}
            style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
          >
            <Text style={styles.chipText} numberOfLines={1}>
              {query}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: theme.spacing.xs,
  },
  label: {
    ...theme.typography.caption,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: theme.spacing.lg,
  },
  row: {
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
  },
  chip: {
    maxWidth: 220,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 10,
  },
  chipPressed: {
    opacity: 0.88,
  },
  chipText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: "500",
  },
});
