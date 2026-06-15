import { StyleSheet, Text, View } from "react-native";
import { theme } from "@/constants/theme";

export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.header}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 4,
  },
  eyebrow: {
    ...theme.typography.caption,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: theme.colors.primary,
    lineHeight: 34,
  },
  subtitle: {
    ...theme.typography.caption,
    fontSize: 14,
  },
});
