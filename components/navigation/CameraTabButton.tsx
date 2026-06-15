import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, View } from "react-native";
import { theme } from "@/constants/theme";

export function CameraTabButton({
  onPress,
  accessibilityState,
}: BottomTabBarButtonProps) {
  const focused = accessibilityState?.selected;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Câmera"
      accessibilityState={accessibilityState}
      onPress={onPress}
      style={styles.wrapper}
    >
      <View style={[styles.button, focused && styles.buttonFocused]}>
        <Ionicons name="camera" size={26} color={theme.colors.white} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    top: -18,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: theme.colors.background,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonFocused: {
    transform: [{ scale: 1.04 }],
  },
});
