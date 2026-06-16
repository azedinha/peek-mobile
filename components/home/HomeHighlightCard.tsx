import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { theme } from "@/constants/theme";
import type { HomeHighlight } from "@/types/home";

export const HIGHLIGHT_CARD_WIDTH = 272;

export function HomeHighlightCard({
  item,
  onPress,
}: {
  item: HomeHighlight;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.top}>
        {item.hasPeekBadge ? (
          <View style={styles.badge}>
            <Ionicons
              name="shield-checkmark"
              size={12}
              color={theme.colors.primary}
            />
            <Text style={styles.badgeText}>Selo Peek</Text>
          </View>
        ) : (
          <View style={styles.badgeSpacer} />
        )}
        <View style={styles.ratingPill}>
          <Ionicons name="star" size={12} color={theme.colors.primary} />
          <Text style={styles.rating}>
            {item.rating != null ? item.rating.toFixed(1) : "—"}
          </Text>
        </View>
      </View>

      <Text style={styles.name} numberOfLines={2}>
        {item.name}
      </Text>

      <Text style={styles.category}>{item.categoryLabel.toUpperCase()}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: HIGHLIGHT_CARD_WIDTH,
    minHeight: 148,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.sm + 4,
    gap: theme.spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.xs,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  badgeSpacer: {
    height: 26,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rating: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.primary,
    letterSpacing: -0.3,
    lineHeight: 24,
    flex: 1,
  },
  category: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.6,
    color: theme.colors.textSecondary,
  },
});
