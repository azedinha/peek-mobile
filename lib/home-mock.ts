import type {
  HighlightCategoryFilter,
  HighlightCategoryOption,
  HomeHighlight,
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
];

/** MOCK — substituir por GET /api/home/highlights */
export const MOCK_HOME_HIGHLIGHTS: HomeHighlight[] = [
  {
    id: "1",
    placeId: "ChIJh1bCR0rYW5MR8vQI8xqF5ZQ",
    name: "Hospital Brasiliense",
    category: "hospitais",
    categoryLabel: "Hospital",
    rating: 4.7,
    hasPeekBadge: true,
    relevance: 98,
    lat: -15.7942,
    lng: -47.8822,
  },
  {
    id: "2",
    placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
    name: "Restaurante Fasano",
    category: "restaurantes",
    categoryLabel: "Restaurante",
    rating: 4.9,
    hasPeekBadge: true,
    relevance: 95,
    lat: -15.805,
    lng: -47.925,
  },
  {
    id: "3",
    placeId: "ChIJrTLr-GyuEmsRBfy61i-nzMg",
    name: "BlueFit Asa Sul",
    category: "academias",
    categoryLabel: "Academia",
    rating: 4.5,
    hasPeekBadge: true,
    relevance: 88,
    lat: -15.8267,
    lng: -47.9218,
  },
  {
    id: "4",
    placeId: "ChIJ2eUgeAKuEmsR0jRIOh5uKw0",
    name: "Bar do Mineiro",
    category: "bares",
    categoryLabel: "Bar",
    rating: 4.6,
    hasPeekBadge: false,
    relevance: 82,
    lat: -15.8711,
    lng: -47.9186,
  },
  {
    id: "5",
    placeId: "ChIJ3S-JXmauEmsRUsoyG83frY4",
    name: "Festival Gastronômico JK",
    category: "eventos",
    categoryLabel: "Evento",
    rating: 4.4,
    hasPeekBadge: false,
    relevance: 79,
    lat: -15.8,
    lng: -47.89,
  },
  {
    id: "6",
    placeId: "ChIJ4zGFAZpYwokRGUGph3Mf37k",
    name: "Zara ParkShopping",
    category: "lojas",
    categoryLabel: "Loja",
    rating: 4.2,
    hasPeekBadge: false,
    relevance: 74,
    lat: -15.7833,
    lng: -47.8986,
  },
  {
    id: "7",
    placeId: "ChIJ5R6qJzq3EmsR18e-MPHTjc0",
    name: "Oficina Premium Motors",
    category: "oficinas",
    categoryLabel: "Oficina",
    rating: 4.8,
    hasPeekBadge: true,
    relevance: 71,
    lat: -15.75,
    lng: -47.91,
  },
  {
    id: "8",
    placeId: "ChIJ6y0HZy4zjk0RQ5DqXe7d3Bk",
    name: "Hotel Unique",
    category: "hoteis",
    categoryLabel: "Hotel",
    rating: 4.9,
    hasPeekBadge: true,
    relevance: 92,
    lat: -15.812,
    lng: -47.905,
  },
  {
    id: "9",
    placeId: "ChIJ7Q6xu0T2wokRY5DqXe7d3Bk",
    name: "Outback Steakhouse",
    category: "restaurantes",
    categoryLabel: "Restaurante",
    rating: 4.3,
    hasPeekBadge: false,
    relevance: 68,
    lat: -15.838,
    lng: -47.942,
  },
  {
    id: "10",
    placeId: "ChIJ8R7yv1U3wokRZ5DqXe7d3Bk",
    name: "Hospital Sírio-Libanês",
    category: "hospitais",
    categoryLabel: "Hospital",
    rating: 4.8,
    hasPeekBadge: true,
    relevance: 90,
    lat: -23.589,
    lng: -46.655,
  },
];

export function sortHomeHighlights(
  highlights: HomeHighlight[]
): HomeHighlight[] {
  return [...highlights].sort((a, b) => {
    if (a.hasPeekBadge !== b.hasPeekBadge) {
      return a.hasPeekBadge ? -1 : 1;
    }
    if (b.rating !== a.rating) {
      return b.rating - a.rating;
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
