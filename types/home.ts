export type HighlightCategoryFilter =
  | "todos"
  | "restaurantes"
  | "bares"
  | "eventos"
  | "hospitais"
  | "academias"
  | "lojas"
  | "oficinas"
  | "hoteis";

export interface HighlightCategoryOption {
  id: HighlightCategoryFilter;
  label: string;
}

export interface HomeHighlight {
  id: string;
  placeId: string;
  name: string;
  category: Exclude<HighlightCategoryFilter, "todos">;
  categoryLabel: string;
  rating: number;
  hasPeekBadge: boolean;
  relevance: number;
  lat: number;
  lng: number;
}
