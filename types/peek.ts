export type SourceId =
  | "google"
  | "reclame_aqui"
  | "consumidor_gov"
  | "news"
  | "social";

export interface GoogleReviewsSource {
  available: boolean;
  rating?: number;
  totalReviews?: number;
  profileUrl?: string;
  topPraises?: string[];
  topCriticisms?: string[];
}

export interface ReclameAquiIndicator {
  label: string;
  value: string;
}

export interface ReclameAquiSource {
  available: boolean;
  name?: string;
  score?: number;
  solveRatePercent?: number;
  totalComplaints?: number;
  respondedCount?: number;
  respondedPercent?: number;
  reputationStatus?: string;
  indicators?: ReclameAquiIndicator[];
  profileUrl?: string;
  notFoundMessage?: string;
}

export interface ConsumidorGovIndicator {
  label: string;
  value: string;
}

export interface ConsumidorGovSource {
  available: boolean;
  name?: string;
  registered?: boolean | null;
  totalComplaints?: number;
  resolvedPercent?: number;
  indicators?: ConsumidorGovIndicator[];
  profileUrl?: string;
  notFoundMessage?: string;
}

export interface NewsHighlight {
  title: string;
  url: string;
  source: string;
  publishedAt?: string;
}

export interface NewsSource {
  available: boolean;
  totalCount?: number;
  highlights?: NewsHighlight[];
}

export interface SocialLink {
  platform: string;
  label: string;
  url: string;
}

export interface SocialSource {
  available: boolean;
  links?: SocialLink[];
}

export type IdentificationMode = "confirmed" | "proximity_hypothesis";

export interface PeekAnalysisResult {
  establishment: {
    name: string;
    emoji: string;
    category?: string | null;
    address: string;
    isOpen: boolean | null;
    placeId?: string;
  };
  google: GoogleReviewsSource;
  reclameAqui: ReclameAquiSource;
  consumidorGov: ConsumidorGovSource;
  news: NewsSource;
  social: SocialSource;
  peekSummary: string | null;
  analyzedAt: string;
  capturedAt: string;
  identifiedAutomatically: boolean;
  identificationMode?: IdentificationMode;
  identificationConfidence?: number;
}

export interface CaptureSession {
  photo: string;
  lat: number;
  lng: number;
  accuracy?: number;
  capturedAt: string;
}

export interface AnalysisHistoryEntry {
  id: string;
  photo: string;
  lat: number;
  lng: number;
  accuracy?: number;
  capturedAt: string;
  result: PeekAnalysisResult;
  savedAt: string;
}

export interface AnalyzeRequest {
  photo: string;
  lat: number;
  lng: number;
  accuracy?: number;
  capturedAt: string;
}
