import { StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { theme } from "@/constants/theme";

export function HomeInfoCard() {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name="scan-outline" size={22} color={theme.colors.primary} />
      </View>
      <Text style={styles.text}>
        Aponte para uma fachada ou pesquise pelo nome.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
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
  text: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
});
