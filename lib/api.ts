import type {
  AnalyzeRequest,
  CaptureSession,
  CommunityRatingSource,
  CommunityRatingValue,
  PeekAnalysisResult,
  PlaceEvaluationResponse,
  PlaceEvaluationStatus,
  PlaceSearchResponse,
} from "@/types/peek";
import { config, isApiConfigured, isSupabaseConfigured } from "./config";
import { getSupabase } from "./supabase";

const ANALYZE_TIMEOUT_MS = 90_000;

export type AnalyzeErrorKind =
  | "config"
  | "validation"
  | "analysis"
  | "network"
  | "timeout"
  | "unknown";

export class AnalyzeApiError extends Error {
  readonly status?: number;
  readonly kind: AnalyzeErrorKind;
  /** Erro bruto antes do mapeamento — diagnóstico temporário. */
  rawErrorDetail?: string;

  constructor(message: string, status?: number, kind: AnalyzeErrorKind = "unknown") {
    super(message);
    this.name = "AnalyzeApiError";
    this.status = status;
    this.kind = kind;
  }
}

/** Diagnóstico temporário da configuração de API (tela de erro). */
export function getAnalyzeApiDiagnostics(): {
  apiUrl: string;
  isApiConfigured: boolean;
  analyzeUrl: string;
} {
  const apiUrl = config.apiUrl;
  const configured = isApiConfigured();
  const baseUrl = configured ? apiUrl.replace(/\/$/, "") : apiUrl;
  const analyzeUrl = configured ? `${baseUrl}/api/analyze` : "(indisponível — API não configurada)";

  return {
    apiUrl: apiUrl || "(vazio)",
    isApiConfigured: configured,
    analyzeUrl,
  };
}

function formatAnalyzeRawError(error: unknown): string {
  if (error instanceof AnalyzeApiError) {
    return `[AnalyzeApiError] kind=${error.kind} status=${error.status ?? "n/a"} message=${error.message}`;
  }

  if (error instanceof Error) {
    const stack = error.stack ? `\n${error.stack}` : "";
    return `[${error.name}] ${error.message}${stack}`;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function normalizeRequest(session: CaptureSession): AnalyzeRequest {
  const lat = Number(session.lat);
  const lng = Number(session.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new AnalyzeApiError(
      "Localização inválida. Tente capturar a foto novamente.",
      undefined,
      "validation"
    );
  }

  const accuracy =
    session.accuracy != null && Number.isFinite(Number(session.accuracy))
      ? Number(session.accuracy)
      : undefined;

  return {
    photo: session.photo,
    lat,
    lng,
    accuracy,
    capturedAt: session.capturedAt,
  };
}

function getApiBaseUrl(): string {
  if (!isApiConfigured()) {
    throw new AnalyzeApiError(
      "API não configurada. Defina EXPO_PUBLIC_API_URL no arquivo .env.",
      undefined,
      "config"
    );
  }

  return config.apiUrl.replace(/\/$/, "");
}

function getAnalyzeUrl(): string {
  return `${getApiBaseUrl()}/api/analyze`;
}

function getAnalyzePlaceUrl(): string {
  return `${getApiBaseUrl()}/api/analyze/place`;
}

function getPlacesSearchUrl(query: string, lat?: number, lng?: number): string {
  const url = new URL(`${getApiBaseUrl()}/api/places/search`);
  url.searchParams.set("q", query);
  if (lat != null && Number.isFinite(lat)) {
    url.searchParams.set("lat", String(lat));
  }
  if (lng != null && Number.isFinite(lng)) {
    url.searchParams.set("lng", String(lng));
  }
  return url.toString();
}
function parseErrorMessage(data: unknown, status: number): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as { error: unknown }).error === "string"
  ) {
    return (data as { error: string }).error;
  }

  if (status === 400) {
    return "Dados da captura inválidos. Tente fotografar novamente.";
  }

  return "Falha na análise. Tente novamente.";
}

function toAnalyzeError(error: unknown): AnalyzeApiError {
  if (error instanceof AnalyzeApiError) {
    return error;
  }

  if (error instanceof Error) {
    if (error.name === "AbortError") {
      return new AnalyzeApiError(
        "A análise demorou mais que o esperado. Verifique sua conexão e tente novamente.",
        undefined,
        "timeout"
      );
    }

    if (
      error.message.includes("Network request failed") ||
      error.message.includes("Failed to fetch") ||
      error.message.includes("network")
    ) {
      return new AnalyzeApiError(
        "Sem conexão com o servidor. Verifique a internet e a URL da API.",
        undefined,
        "network"
      );
    }
  }

  return new AnalyzeApiError(
    "Não foi possível conectar ao servidor. Tente novamente.",
    undefined,
    "network"
  );
}

export async function analyzeCapture(
  session: CaptureSession
): Promise<PeekAnalysisResult> {
  const body = normalizeRequest(session);
  return postAnalyzeRequest(getAnalyzeUrl(), body);
}

export async function analyzePlace(placeId: string): Promise<PeekAnalysisResult> {
  const trimmedPlaceId = placeId.trim();
  if (!trimmedPlaceId) {
    throw new AnalyzeApiError(
      "Estabelecimento inválido.",
      undefined,
      "validation"
    );
  }

  return postAnalyzeRequest(getAnalyzePlaceUrl(), { placeId: trimmedPlaceId });
}

export async function searchPlaces(
  query: string,
  options?: { lat?: number; lng?: number }
): Promise<PlaceSearchResponse> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    throw new AnalyzeApiError(
      "Digite o nome do estabelecimento.",
      undefined,
      "validation"
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15_000);

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      getPlacesSearchUrl(trimmedQuery, options?.lat, options?.lng),
      {
        method: "GET",
        headers,
        signal: controller.signal,
      }
    );

    let data: unknown;

    try {
      data = await response.json();
    } catch {
      throw new AnalyzeApiError(
        "Resposta inválida do servidor.",
        response.status,
        "unknown"
      );
    }

    if (!response.ok) {
      const message = parseErrorMessage(data, response.status);
      throw new AnalyzeApiError(message, response.status, "analysis");
    }

    return data as PlaceSearchResponse;
  } catch (error) {
    throw toAnalyzeError(error);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function postAnalyzeRequest(
  url: string,
  body: AnalyzeRequest | { placeId: string }
): Promise<PeekAnalysisResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ANALYZE_TIMEOUT_MS);

  if ("photo" in body) {
    const diagnostics = getAnalyzeApiDiagnostics();
    console.log("[peek/analyze] pre-fetch", {
      baseUrl: diagnostics.isApiConfigured
        ? config.apiUrl.replace(/\/$/, "")
        : config.apiUrl || "(vazio)",
      endpoint: url,
      photoSizeChars: body.photo.length,
    });
  }

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    let data: unknown;

    try {
      data = await response.json();
    } catch {
      throw new AnalyzeApiError(
        "Resposta inválida do servidor.",
        response.status,
        "unknown"
      );
    }

    if (!response.ok) {
      const message = parseErrorMessage(data, response.status);
      const kind: AnalyzeErrorKind =
        response.status === 400 ? "validation" : "analysis";

      throw new AnalyzeApiError(message, response.status, kind);
    }

    return data as PeekAnalysisResult;
  } catch (error) {
    const rawErrorDetail = formatAnalyzeRawError(error);
    console.log("[peek/analyze] raw error before mapping:", rawErrorDetail, error);
    const mapped = toAnalyzeError(error);
    if (!(error instanceof AnalyzeApiError)) {
      mapped.rawErrorDetail = rawErrorDetail;
    }
    throw mapped;
  } finally {
    clearTimeout(timeoutId);
  }
}
function getCommunityRatingUrl(establishmentKey?: string): string {
  const base = getApiBaseUrl();  if (establishmentKey) {
    return `${base}/api/community-rating?establishmentKey=${encodeURIComponent(establishmentKey)}`;
  }
  return `${base}/api/community-rating`;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!isSupabaseConfigured()) {
    return headers;
  }

  const {
    data: { session },
  } = await getSupabase().auth.getSession();

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  return headers;
}

export async function fetchCommunityRating(
  establishmentKey: string
): Promise<CommunityRatingSource | null> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(getCommunityRatingUrl(establishmentKey), {
      headers,
    });

    if (!response.ok) return null;
    return (await response.json()) as CommunityRatingSource;
  } catch {
    return null;
  }
}

export async function submitCommunityRatingVote(input: {
  establishmentKey: string;
  establishmentName: string;
  establishmentAddress?: string;
  rating: CommunityRatingValue;
}): Promise<CommunityRatingSource> {
  const headers = await getAuthHeaders();
  const response = await fetch(getCommunityRatingUrl(), {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new AnalyzeApiError(
      typeof data?.error === "string"
        ? data.error
        : "Falha ao salvar avaliação.",
      response.status,
      response.status === 401 ? "validation" : "unknown"
    );
  }

  return data as CommunityRatingSource;
}

function getPlaceEvaluationUrl(placeId?: string): string {
  const base = getApiBaseUrl();
  if (placeId) {
    return `${base}/api/place-evaluation?placeId=${encodeURIComponent(placeId)}`;
  }
  return `${base}/api/place-evaluation`;
}

export async function fetchPlaceEvaluationStatus(
  placeId: string
): Promise<PlaceEvaluationStatus | null> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(getPlaceEvaluationUrl(placeId), { headers });

    if (!response.ok) return null;
    return (await response.json()) as PlaceEvaluationStatus;
  } catch {
    return null;
  }
}

export async function submitPlaceEvaluation(input: {
  placeId: string;
  visitedPlace: boolean;
  experienceRating: CommunityRatingValue;
  wouldReturn: boolean;
  consultationSource: "photo" | "search";
}): Promise<PlaceEvaluationResponse> {
  const headers = await getAuthHeaders();
  const response = await fetch(getPlaceEvaluationUrl(), {
    method: "POST",
    headers,
    body: JSON.stringify({
      place_id: input.placeId,
      visited_place: input.visitedPlace,
      experience_rating: input.experienceRating,
      would_return: input.wouldReturn,
      consultation_source: input.consultationSource,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new AnalyzeApiError(
      typeof data?.error === "string"
        ? data.error
        : "Falha ao salvar avaliação.",
      response.status,
      response.status === 401 ? "validation" : "unknown"
    );
  }

  return data as PlaceEvaluationResponse;
}
