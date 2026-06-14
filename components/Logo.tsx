import { View, Text, StyleSheet } from "react-native";
import { theme } from "@/constants/theme";

interface LogoProps {
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: 28,
  md: 36,
  lg: 44,
};

export function Logo({ size = "lg" }: LogoProps) {
  const fontSize = sizeMap[size];

  return (
    <View style={styles.container} accessibilityLabel="Peek" accessibilityRole="image">
      <View style={styles.eyes}>
        <View style={styles.eye}>
          <View style={styles.pupil} />
        </View>
        <View style={styles.eye}>
          <View style={styles.pupil} />
        </View>
      </View>
      <Text style={[styles.wordmark, { fontSize }]}>Peek</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  eyes: {
    flexDirection: "row",
    gap: 20,
  },
  eye: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  pupil: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  wordmark: {
    color: theme.colors.primary,
    fontWeight: "600",
    letterSpacing: -0.5,
    fontFamily: "Georgia",
  },
});
