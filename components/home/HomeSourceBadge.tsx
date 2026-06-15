import { StyleSheet, Text, View } from "react-native";
import { theme } from "@/constants/theme";

export function HomeSourceBadge({
  variant,
}: {
  variant: "live" | "mock";
}) {
  return (
    <View
      style={[
        styles.badge,
        variant === "live" ? styles.badgeLive : styles.badgeMock,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === "live" ? styles.labelLive : styles.labelMock,
        ]}
      >
        {variant === "live" ? "Dados ao vivo" : "Conteúdo demonstrativo"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: theme.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  badgeLive: {
    backgroundColor: "rgba(76, 68, 59, 0.06)",
    borderColor: theme.colors.border,
  },
  badgeMock: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  labelLive: {
    color: theme.colors.primary,
  },
  labelMock: {
    color: theme.colors.textSecondary,
  },
});
