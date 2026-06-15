import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { theme } from "@/constants/theme";

export function StackScreenChrome({
  onBack,
  backLabel = "Voltar",
}: {
  onBack: () => void;
  backLabel?: string;
}) {
  return (
    <View style={styles.bar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={backLabel}
        onPress={onBack}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Ionicons name="chevron-back" size={22} color={theme.colors.primary} />
        <Text style={styles.backLabel}>{backLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 2,
    minHeight: 40,
    paddingRight: theme.spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  backLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.primary,
  },
});
