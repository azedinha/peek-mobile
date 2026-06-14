import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { theme } from "@/constants/theme";

interface LoadingViewProps {
  message?: string;
}

export function LoadingView({ message = "Carregando..." }: LoadingViewProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={theme.colors.primary} size="small" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  message: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
});
