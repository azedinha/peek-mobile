import { Image, StyleSheet, View } from "react-native";

interface LogoProps {
  size?: "sm" | "md" | "lg";
}

/** Proporção do arquivo oficial (940 × 788 px). */
const LOGO_ASPECT = 788 / 940;

const sizeMap = {
  sm: 160,
  md: 220,
  lg: 280,
} as const;

export function Logo({ size = "lg" }: LogoProps) {
  const width = sizeMap[size];
  const height = Math.round(width * LOGO_ASPECT);

  return (
    <View
      style={[styles.container, { width, height }]}
      accessibilityLabel="Peek"
      accessibilityRole="image"
    >
      <Image
        source={require("../assets/logo-wordmark.png")}
        style={styles.image}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
