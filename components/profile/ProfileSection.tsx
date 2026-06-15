import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "@/constants/theme";

export function ProfileSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: theme.spacing.xs,
  },
  title: {
    ...theme.typography.caption,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: 4,
  },
  card: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
  },
});
