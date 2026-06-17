export type HighlightCategoryFilter =

  | "todos"

  | "restaurantes"

  | "bares"

  | "eventos"

  | "hospitais"

  | "academias"

  | "lojas"

  | "oficinas"

  | "hoteis"

  | "outros";



export interface HighlightCategoryOption {

  id: HighlightCategoryFilter;

  label: string;

}



export interface HomeHighlightSignals {

  consultations: number;

  searches: number;

  detailsViews: number;

}



export interface HomeHighlight {

  id: string;

  placeId: string;

  name: string;

  category: Exclude<HighlightCategoryFilter, "todos">;

  categoryLabel: string;

  rating: number | null;

  hasPeekBadge: boolean;

  peekBadge: string | null;

  peekScore: number | null;

  relevance: number;

  lat: number;

  lng: number;

  signals: HomeHighlightSignals;

}



export interface HomeHighlightsResponse {

  highlights: HomeHighlight[];

  periodDays: number;

  generatedAt: string;

}


