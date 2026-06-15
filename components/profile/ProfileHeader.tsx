import { Image, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { theme } from "@/constants/theme";

export function ProfileHeader({
  name,
  email,
  avatarUrl,
}: {
  name: string;
  email: string;
  avatarUrl: string | null;
}) {
  return (
    <View style={styles.header}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarFallback}>
          <Ionicons name="person" size={28} color={theme.colors.primary} />
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
        <Text style={styles.email} numberOfLines={1}>
          {email}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: "600",
    color: theme.colors.primary,
    lineHeight: 28,
  },
  email: {
    ...theme.typography.caption,
    fontSize: 14,
  },
});
