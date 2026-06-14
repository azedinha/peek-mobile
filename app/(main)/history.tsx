import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { HistoryEntryCard } from "@/components/history/HistoryEntryCard";
import { Button } from "@/components/ui/Button";
import { LoadingView } from "@/components/ui/LoadingView";
import { getHistoryEntries, restoreHistoryEntry } from "@/lib/history";
import { theme } from "@/constants/theme";
import type { AnalysisHistoryEntry } from "@/types/peek";

export default function HistoryScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<AnalysisHistoryEntry[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        const data = await getHistoryEntries();
        if (active) setEntries(data);
      })();

      return () => {
        active = false;
      };
    }, [])
  );

  const handleOpen = async (id: string) => {
    const restored = await restoreHistoryEntry(id);
    if (!restored) return;
    router.push("/(main)/result");
  };

  if (entries === null) {
    return <LoadingView />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Voltar"
          style={styles.backButton}
          onPress={() => router.replace("/(main)/camera")}
        >
          <Text style={styles.backChevron}>‹</Text>
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Histórico</Text>
          <Text style={styles.title}>Consultas anteriores</Text>
        </View>
      </View>

      {entries.length > 0 ? (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <HistoryEntryCard entry={item} onOpen={() => handleOpen(item.id)} />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Nenhuma análise salva ainda. Fotografe um estabelecimento para
            começar seu histórico.
          </Text>
          <Button onPress={() => router.replace("/(main)/camera")}>
            Ir para câmera
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm + 4,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  backChevron: {
    fontSize: 26,
    lineHeight: 28,
    color: theme.colors.primary,
    marginTop: -2,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    ...theme.typography.caption,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.primary,
    lineHeight: 26,
  },
  listContent: {
    paddingHorizontal: theme.spacing.sm + 4,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  separator: {
    height: theme.spacing.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  emptyText: {
    ...theme.typography.caption,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },
});
