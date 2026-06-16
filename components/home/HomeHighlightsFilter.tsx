import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { HIGHLIGHT_FILTER_OPTIONS } from "@/lib/home-highlights";
import { theme } from "@/constants/theme";
import type { HighlightCategoryFilter } from "@/types/home";

export function HomeHighlightsFilter({
  value,
  onChange,
}: {
  value: HighlightCategoryFilter;
  onChange: (filter: HighlightCategoryFilter) => void;
}) {
  const [visible, setVisible] = useState(false);
  const activeLabel =
    HIGHLIGHT_FILTER_OPTIONS.find((option) => option.id === value)?.label ??
    "Todos";

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Filtrar destaques. Filtro atual: ${activeLabel}`}
        onPress={() => setVisible(true)}
        style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}
      >
        <Ionicons
          name="options-outline"
          size={18}
          color={theme.colors.primary}
        />
        <Text style={styles.triggerLabel}>{activeLabel}</Text>
      </Pressable>

      <Modal
        visible={visible}
        animationType="fade"
        transparent
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <SafeAreaView style={styles.sheetWrap} edges={["bottom"]}>
            <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Filtrar destaques</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Fechar filtros"
                  onPress={() => setVisible(false)}
                  hitSlop={8}
                >
                  <Ionicons
                    name="close"
                    size={22}
                    color={theme.colors.textSecondary}
                  />
                </Pressable>
              </View>

              <View style={styles.options}>
                {HIGHLIGHT_FILTER_OPTIONS.map((option) => {
                  const selected = option.id === value;
                  return (
                    <Pressable
                      key={option.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => {
                        onChange(option.id);
                        setVisible(false);
                      }}
                      style={({ pressed }) => [
                        styles.option,
                        selected && styles.optionSelected,
                        pressed && styles.optionPressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionLabel,
                          selected && styles.optionLabelSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                      {selected ? (
                        <Ionicons
                          name="checkmark"
                          size={18}
                          color={theme.colors.primary}
                        />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </Pressable>
          </SafeAreaView>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  triggerPressed: {
    opacity: 0.85,
  },
  triggerLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: theme.colors.primary,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    justifyContent: "flex-end",
  },
  sheetWrap: {
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.xs,
  },
  sheetTitle: {
    ...theme.typography.title,
    fontSize: 20,
    lineHeight: 26,
  },
  options: {
    gap: 4,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  optionSelected: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: -theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    borderBottomColor: "transparent",
  },
  optionPressed: {
    opacity: 0.88,
  },
  optionLabel: {
    fontSize: 16,
    color: theme.colors.primary,
  },
  optionLabelSelected: {
    fontWeight: "600",
  },
});
