import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useRouter } from "expo-router";
import { fetchRadarPeek } from "@/lib/radar-peek";
import { openRadarPlace } from "@/lib/open-highlight";
import { theme } from "@/constants/theme";
import type { RadarPeekResponse, RadarPlaceRef } from "@/types/radar";

export function RadarPeekSection() {
  const router = useRouter();
  const [data, setData] = useState<RadarPeekResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        setLoading(true);
        setError(null);

        try {
          const payload = await fetchRadarPeek();
          if (active) setData(payload);
        } catch {
          if (active) {
            setData(null);
            setError("Não foi possível carregar o Radar Peek.");
          }
        } finally {
          if (active) setLoading(false);
        }
      })();

      return () => {
        active = false;
      };
    }, [])
  );

  const handleOpen = useCallback(
    async (place: RadarPlaceRef) => {
      if (openingId) return;
      setOpeningId(place.placeId);
      try {
        await openRadarPlace(router, place);
      } finally {
        setOpeningId(null);
      }
    },
    [openingId, router]
  );

  if (loading) {
    return (
      <View style={styles.card}>
        <View style={styles.loading}>
          <ActivityIndicator color={theme.colors.white} />
        </View>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardEyebrow}>Radar Peek</Text>
        <Text style={styles.emptyText}>
          {error ?? "O Radar Peek ainda não está disponível."}
        </Text>
      </View>
    );
  }

  const showPick = data.mode === "pick_of_week" && data.pickOfWeek;
  const showRanking = data.mode === "ranking" && data.ranking.length > 0;

  return (
    <View style={styles.card}>
      <Text style={styles.cardEyebrow}>Radar Peek</Text>

      {showPick ? (
        <PickOfWeekView
          title={data.pickTitle}
          description={data.pickDescription}
          pick={data.pickOfWeek!}
          opening={openingId === data.pickOfWeek!.placeId}
          onPress={() => handleOpen(data.pickOfWeek!)}
        />
      ) : showRanking ? (
        <RankingView
          title={data.rankingTitle}
          ranking={data.ranking}
          openingId={openingId}
          onOpen={(entry) =>
            handleOpen({
              placeId: entry.placeId,
              name: entry.name,
              lat: entry.lat,
              lng: entry.lng,
            })
          }
        />
      ) : (
        <View style={styles.emptyBlock}>
          <Text style={styles.sectionTitle}>
            {data.mode === "pick_of_week" ? data.pickTitle : data.rankingTitle}
          </Text>
          <Text style={styles.emptyText}>
            Ainda não há movimento suficiente da comunidade esta semana em{" "}
            {data.city}. Consulte e avalie estabelecimentos para alimentar o
            radar.
          </Text>
        </View>
      )}
    </View>
  );
}

function RankingView({
  title,
  ranking,
  openingId,
  onOpen,
}: {
  title: string;
  ranking: RadarPeekResponse["ranking"];
  openingId: string | null;
  onOpen: (entry: RadarPeekResponse["ranking"][number]) => void;
}) {
  return (
    <View style={styles.content}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.rankingList}>
        {ranking.map((entry) => (
          <Pressable
            key={entry.placeId}
            accessibilityRole="button"
            onPress={() => onOpen(entry)}
            style={({ pressed }) => [
              styles.rankingRow,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.rankLabel}>{entry.rankLabel}</Text>
            <Text style={styles.rankName} numberOfLines={1}>
              {entry.name}
            </Text>
            {openingId === entry.placeId ? (
              <ActivityIndicator color={theme.colors.white} size="small" />
            ) : (
              <Ionicons
                name="chevron-forward"
                size={16}
                color="rgba(255,255,255,0.72)"
              />
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function PickOfWeekView({
  title,
  description,
  pick,
  opening,
  onPress,
}: {
  title: string;
  description: string;
  pick: NonNullable<RadarPeekResponse["pickOfWeek"]>;
  opening: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.content, pressed && styles.pressed]}
    >
      <Text style={styles.sectionTitle}>{title}</Text>

      <View style={styles.pickMedia}>
        {pick.photoUrl ? (
          <Image source={{ uri: pick.photoUrl }} style={styles.pickImage} />
        ) : (
          <View style={styles.pickPlaceholder}>
            <Ionicons
              name="storefront-outline"
              size={28}
              color="rgba(255,255,255,0.72)"
            />
          </View>
        )}
      </View>

      <Text style={styles.pickName}>{pick.name}</Text>
      <Text style={styles.pickCategory}>{pick.categoryLabel.toUpperCase()}</Text>
      <Text style={styles.pickDescription}>{description}</Text>

      {opening ? (
        <ActivityIndicator color={theme.colors.white} style={styles.pickLoader} />
      ) : null}
    </Pressable>
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
  cardEyebrow: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "rgba(255, 255, 255, 0.72)",
  },
  content: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: theme.colors.white,
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  rankingList: {
    gap: 10,
  },
  rankingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  rankLabel: {
    width: 34,
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.white,
  },
  rankName: {
    flex: 1,
    fontSize: 17,
    fontWeight: "500",
    color: theme.colors.white,
  },
  pickMedia: {
    borderRadius: theme.radius.md,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  pickImage: {
    width: "100%",
    height: 180,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  pickPlaceholder: {
    width: "100%",
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  pickName: {
    fontSize: 24,
    fontWeight: "600",
    color: theme.colors.white,
    letterSpacing: -0.3,
  },
  pickCategory: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
    color: "rgba(255, 255, 255, 0.72)",
  },
  pickDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255, 255, 255, 0.82)",
  },
  pickLoader: {
    marginTop: 4,
  },
  emptyBlock: {
    gap: theme.spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255, 255, 255, 0.82)",
  },
  loading: {
    paddingVertical: theme.spacing.lg,
    alignItems: "center",
  },
  pressed: {
    opacity: 0.9,
  },
});
