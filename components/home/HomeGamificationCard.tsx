import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  DEFAULT_USER_PROGRESSION,
  getProgressionProgressRatio,
} from "@/lib/progression";
import { HomeProgressInfoModal } from "@/components/home/HomeProgressInfoModal";
import { HomeSourceBadge } from "@/components/home/HomeSourceBadge";
import { theme } from "@/constants/theme";
import type { UserProgression } from "@/types/peek";

export function HomeGamificationCard({
  progression = DEFAULT_USER_PROGRESSION,
  isLiveData = false,
}: {
  progression?: UserProgression;
  isLiveData?: boolean;
}) {
  const [infoVisible, setInfoVisible] = useState(false);
  const progress = getProgressionProgressRatio(progression);
  const progressPercent = Math.round(progress * 100);
  const pointsToNext = progression.points_to_next_level ?? 0;

  return (
    <>
      <View style={styles.card}>
        <View style={styles.topRow}>
          <HomeSourceBadge variant={isLiveData ? "live" : "mock"} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Como funciona a progressão"
            onPress={() => setInfoVisible(true)}
            hitSlop={8}
            style={({ pressed }) => [styles.infoButton, pressed && styles.pressed]}
          >
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="rgba(255,255,255,0.88)"
            />
          </Pressable>
        </View>

        <View style={styles.levelBadge}>
          <Text style={styles.levelNumber}>
            Nível {progression.level_number}
          </Text>
        </View>

        <Text style={styles.levelLabel}>{progression.level_label}</Text>

        <View style={styles.pointsRow}>
          <Text style={styles.pointsValue}>
            {progression.total_points.toLocaleString("pt-BR")}
          </Text>
          <Text style={styles.pointsLabel}>pontos</Text>
        </View>

        <Text style={styles.reviewsCaption}>
          {progression.total_reviews.toLocaleString("pt-BR")}{" "}
          {progression.total_reviews === 1
            ? "avaliação realizada"
            : "avaliações realizadas"}
        </Text>

        <View style={styles.progressBlock}>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${progressPercent}%` }]}
            />
          </View>
          <Text style={styles.progressCaption}>
            {pointsToNext > 0
              ? `Faltam ${pointsToNext.toLocaleString("pt-BR")} pts para o próximo nível`
              : "Nível máximo alcançado"}
          </Text>
        </View>
      </View>

      <HomeProgressInfoModal
        visible={infoVisible}
        onClose={() => setInfoVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 4,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  pressed: {
    opacity: 0.85,
  },
  levelBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderRadius: theme.radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  levelNumber: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.white,
    letterSpacing: 0.3,
  },
  levelLabel: {
    fontSize: 26,
    fontWeight: "600",
    color: theme.colors.white,
    letterSpacing: -0.4,
    lineHeight: 32,
  },
  pointsRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  pointsValue: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.white,
    letterSpacing: -0.3,
  },
  pointsLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.72)",
    fontWeight: "400",
  },
  reviewsCaption: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.72)",
    marginTop: -4,
  },
  progressBlock: {
    gap: 8,
    marginTop: 4,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: theme.colors.white,
  },
  progressCaption: {
    fontSize: 12,
    lineHeight: 16,
    color: "rgba(255, 255, 255, 0.72)",
  },
});
