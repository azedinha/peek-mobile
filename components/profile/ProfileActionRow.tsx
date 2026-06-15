import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { theme } from "@/constants/theme";

export function ProfileActionRow({
  label,
  value,
  destructive = false,
  showChevron = true,
  onPress,
}: {
  label: string;
  value?: string;
  destructive?: boolean;
  showChevron?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        onPress && pressed && styles.rowPressed,
      ]}
    >
      <View style={styles.content}>
        <Text
          style={[styles.label, destructive && styles.destructiveLabel]}
          numberOfLines={1}
        >
          {label}
        </Text>
        {value ? (
          <Text style={styles.value} numberOfLines={2}>
            {value}
          </Text>
        ) : null}
      </View>

      {showChevron && onPress ? (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={destructive ? theme.colors.error : theme.colors.textSecondary}
        />
      ) : null}
    </Pressable>
  );
}

export function ProfileDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  row: {
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  rowPressed: {
    opacity: 0.88,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: "500",
  },
  destructiveLabel: {
    color: theme.colors.error,
  },
  value: {
    ...theme.typography.caption,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: theme.spacing.md,
  },
});
