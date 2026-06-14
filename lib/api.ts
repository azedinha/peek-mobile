import type {
  AnalyzeRequest,
  CaptureSession,
  CommunityRatingSource,
  CommunityRatingValue,
  PeekAnalysisResult,
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

  constructor(message: string, status?: number, kind: AnalyzeErrorKind = "unknown") {
    super(message);
    this.name = "AnalyzeApiError";
    this.status = status;
    this.kind = kind;
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

function getAnalyzeUrl(): string {
  if (!isApiConfigured()) {
    throw new AnalyzeApiError(
      "API não configurada. Defina EXPO_PUBLIC_API_URL no arquivo .env.",
      undefined,
      "config"
    );
  }

  const base = config.apiUrl.replace(/\/$/, "");
  return `${base}/api/analyze`;
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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ANALYZE_TIMEOUT_MS);

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(getAnalyzeUrl(), {
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
    throw toAnalyzeError(error);
  } finally {
    clearTimeout(timeoutId);
  }
}

function getCommunityRatingUrl(establishmentKey?: string): string {
  if (!isApiConfigured()) {
    throw new AnalyzeApiError(
      "API não configurada. Defina EXPO_PUBLIC_API_URL no arquivo .env.",
      undefined,
      "config"
    );
  }

  const base = config.apiUrl.replace(/\/$/, "");
  if (establishmentKey) {
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
