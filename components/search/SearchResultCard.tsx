import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { theme } from "@/constants/theme";
import type { PlaceSearchResult } from "@/types/peek";

export function SearchResultCard({
  result,
  onPress,
}: {
  result: PlaceSearchResult;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="business-outline" size={20} color={theme.colors.primary} />
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {result.name}
        </Text>
        {result.category ? (
          <Text style={styles.category} numberOfLines={1}>
            {result.category.toUpperCase()}
          </Text>
        ) : null}
        <Text style={styles.address} numberOfLines={2}>
          {result.address}
        </Text>
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
    padding: theme.spacing.sm + 4,
  },
  cardPressed: {
    opacity: 0.88,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.primary,
    lineHeight: 21,
  },
  category: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.5,
    color: theme.colors.textSecondary,
  },
  address: {
    ...theme.typography.caption,
    marginTop: 2,
    lineHeight: 18,
  },
  chevron: {
    fontSize: 22,
    color: theme.colors.textSecondary,
    paddingTop: 2,
  },
});
