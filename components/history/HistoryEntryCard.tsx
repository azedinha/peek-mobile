import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/constants/theme";

import type { AnalysisHistoryEntry } from "@/types/peek";



function formatHistoryDate(value: string): string {

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



export function HistoryEntryCard({

  entry,

  onOpen,

}: {

  entry: AnalysisHistoryEntry;

  onOpen: () => void;

}) {

  const { establishment } = entry.result;

  const displayDate = entry.result.analyzedAt || entry.savedAt;



  return (

    <Pressable

      onPress={onOpen}

      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}

    >

      <Image source={{ uri: entry.photo }} style={styles.photo} />

      <View style={styles.info}>

        <Text style={styles.name} numberOfLines={1}>

          {establishment.name}

        </Text>

        {establishment.category ? (

          <Text style={styles.category} numberOfLines={1}>

            {establishment.category.toUpperCase()}

          </Text>

        ) : null}

        <Text style={styles.date}>{formatHistoryDate(displayDate)}</Text>

      </View>

      <Text style={styles.chevron} accessibilityElementsHidden>

        ›

      </Text>

    </Pressable>

  );

}



const styles = StyleSheet.create({

  card: {

    flexDirection: "row",

    alignItems: "center",

    gap: theme.spacing.sm,

    borderWidth: 1,

    borderColor: theme.colors.border,

    borderRadius: theme.radius.lg,

    backgroundColor: theme.colors.surface,

    padding: theme.spacing.sm,

  },

  cardPressed: {

    opacity: 0.88,

  },

  photo: {

    width: 64,

    height: 64,

    borderRadius: theme.radius.sm,

    borderWidth: 1,

    borderColor: theme.colors.border,

    backgroundColor: theme.colors.background,

  },

  info: {

    flex: 1,

    gap: 2,

    minWidth: 0,

  },

  name: {

    fontSize: 15,

    fontWeight: "600",

    color: theme.colors.primary,

    lineHeight: 20,

  },

  category: {

    fontSize: 11,

    fontWeight: "500",

    letterSpacing: 0.5,

    color: theme.colors.textSecondary,

  },

  date: {

    ...theme.typography.caption,

    marginTop: 2,

  },

  chevron: {

    fontSize: 22,

    color: theme.colors.textSecondary,

    paddingTop: 2,

  },

});


