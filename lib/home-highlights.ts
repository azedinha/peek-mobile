import { config, isApiConfigured } from "@/lib/config";
import type {
  HighlightCategoryFilter,
  HighlightCategoryOption,
  HomeHighlight,
  HomeHighlightsResponse,
} from "@/types/home";

export const HIGHLIGHT_FILTER_OPTIONS: HighlightCategoryOption[] = [
  { id: "todos", label: "Todos" },
  { id: "restaurantes", label: "Restaurantes" },
  { id: "bares", label: "Bares" },
  { id: "eventos", label: "Eventos" },
  { id: "hospitais", label: "Hospitais" },
  { id: "academias", label: "Academias" },
  { id: "lojas", label: "Lojas" },
  { id: "oficinas", label: "Oficinas" },
  { id: "hoteis", label: "Hotéis" },
  { id: "outros", label: "Outros" },
];

export function sortHomeHighlights(
  highlights: HomeHighlight[]
): HomeHighlight[] {
  return [...highlights].sort((a, b) => {
    if (a.hasPeekBadge !== b.hasPeekBadge) {
      return a.hasPeekBadge ? -1 : 1;
    }
    if ((b.rating ?? 0) !== (a.rating ?? 0)) {
      return (b.rating ?? 0) - (a.rating ?? 0);
    }
    return b.relevance - a.relevance;
  });
}

export function filterHomeHighlights(
  highlights: HomeHighlight[],
  filter: HighlightCategoryFilter
): HomeHighlight[] {
  const sorted = sortHomeHighlights(highlights);
  if (filter === "todos") return sorted;
  return sorted.filter((item) => item.category === filter);
}

export async function fetchHomeHighlights(): Promise<HomeHighlightsResponse> {
  if (!isApiConfigured()) {
    return {
      highlights: [],
      periodDays: 7,
      generatedAt: new Date().toISOString(),
    };
  }

  const baseUrl = config.apiUrl.replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/api/home/highlights`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("Não foi possível carregar os destaques da semana.");
  }

  return (await response.json()) as HomeHighlightsResponse;
}
