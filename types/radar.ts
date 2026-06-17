export type RadarPeekMode = "ranking" | "pick_of_week";

export interface RadarRankingEntry {
  rank: number;
  placeId: string;
  name: string;
  rankLabel: string;
  lat: number;
  lng: number;
}

export interface RadarPickOfWeek {
  placeId: string;
  name: string;
  categoryLabel: string;
  photoUrl: string | null;
  lat: number;
  lng: number;
}

export interface RadarPeekResponse {
  mode: RadarPeekMode;
  city: string;
  periodDays: number;
  generatedAt: string;
  rankingTitle: string;
  pickTitle: string;
  pickDescription: string;
  ranking: RadarRankingEntry[];
  pickOfWeek: RadarPickOfWeek | null;
}

export interface RadarPlaceRef {
  placeId: string;
  name: string;
  lat: number;
  lng: number;
}
