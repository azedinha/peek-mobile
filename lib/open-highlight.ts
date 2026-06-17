import { clearAnalysisResult, saveCaptureSession } from "@/lib/session";
import { SEARCH_PLACEHOLDER_PHOTO } from "@/lib/search";
import { RESULT_ROUTE } from "@/lib/routes";
import type { HomeHighlight } from "@/types/home";
import type { RadarPlaceRef } from "@/types/radar";
import type { Router } from "expo-router";

export async function openRadarPlace(
  router: Router,
  item: RadarPlaceRef
): Promise<void> {
  await openHomeHighlight(router, {
    id: item.placeId,
    placeId: item.placeId,
    name: item.name,
    category: "outros",
    categoryLabel: "Estabelecimento",
    rating: null,
    hasPeekBadge: false,
    peekBadge: null,
    peekScore: null,
    relevance: 0,
    lat: item.lat,
    lng: item.lng,
    signals: { consultations: 0, searches: 0, detailsViews: 0 },
  });
}

export async function openHomeHighlight(
  router: Router,
  item: HomeHighlight
): Promise<void> {
  const capturedAt = new Date().toISOString();

  await clearAnalysisResult();
  await saveCaptureSession({
    photo: SEARCH_PLACEHOLDER_PHOTO,
    lat: item.lat,
    lng: item.lng,
    capturedAt,
    placeId: item.placeId,
    searchQuery: item.name,
    consultationSource: "search",
    eligibleForEvaluation: false,
  });

  router.push(RESULT_ROUTE);
}
