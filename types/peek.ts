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
}

export interface ReclameAquiSource {
  available: boolean;
  score?: number;
  solveRatePercent?: number;
  totalComplaints?: number;
  profileUrl?: string;
}

export interface ConsumidorGovSource {
  available: boolean;
  totalComplaints?: number;
  resolvedPercent?: number;
  profileUrl?: string;
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

export interface AnalyzeRequest {
  photo: string;
  lat: number;
  lng: number;
  accuracy?: number;
  capturedAt: string;
}
