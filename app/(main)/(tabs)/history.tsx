import { useCallback, useState } from "react";

import { FlatList, StyleSheet, Text, View } from "react-native";

import { useFocusEffect, useRouter } from "expo-router";

import { SafeAreaView } from "react-native-safe-area-context";

import { HistoryEntryCard } from "@/components/history/HistoryEntryCard";

import { ScreenHeader } from "@/components/ui/ScreenHeader";

import { Button } from "@/components/ui/Button";

import { LoadingView } from "@/components/ui/LoadingView";

import { getHistoryEntries, restoreHistoryEntry } from "@/lib/history";

import { CAMERA_ROUTE, RESULT_ROUTE, SEARCH_ROUTE } from "@/lib/routes";

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

    router.push(RESULT_ROUTE);

  };



  if (entries === null) {

    return <LoadingView />;

  }



  return (

    <SafeAreaView style={styles.safe} edges={["top"]}>

      <View style={styles.header}>

        <ScreenHeader

          eyebrow="Histórico"

          title="Consultas anteriores"

        />

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

            Nenhuma análise salva ainda. Fotografe um estabelecimento ou busque

            por nome para começar seu histórico.

          </Text>

          <Button onPress={() => router.navigate(CAMERA_ROUTE)}>

            Fotografar estabelecimento

          </Button>

          <Button

            variant="outline"

            onPress={() => router.navigate(SEARCH_ROUTE)}

          >

            Buscar por nome

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

    paddingHorizontal: theme.spacing.lg,

    paddingTop: theme.spacing.md,

    paddingBottom: theme.spacing.sm,

  },

  listContent: {

    paddingHorizontal: theme.spacing.lg,

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

    gap: theme.spacing.sm,

  },

  emptyText: {

    ...theme.typography.caption,

    textAlign: "center",

    lineHeight: 20,

    maxWidth: 280,

    marginBottom: theme.spacing.xs,

  },

});


