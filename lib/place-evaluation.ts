import type { CommunityRatingValue } from "@/types/peek";

export const EXPERIENCE_RATING_OPTIONS: Array<{
  value: CommunityRatingValue;
  label: string;
}> = [
  { value: "pessima", label: "Péssima" },
  { value: "ruim", label: "Ruim" },
  { value: "boa", label: "Boa" },
  { value: "excelente", label: "Excelente" },
];

export const WOULD_RETURN_OPTIONS = [
  { value: true, label: "Sim" },
  { value: false, label: "Não" },
] as const;
