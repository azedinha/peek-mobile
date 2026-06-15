export const PROGRESSION_LEVEL_THRESHOLDS = [
  { label: "Visitante", points: 0 },
  { label: "Explorador", points: 25 },
  { label: "Colaborador", points: 45 },
  { label: "Especialista", points: 80 },
  { label: "Embaixador", points: 170 },
  { label: "Avaliador Peek", points: 350 },
  { label: "Guia Peek", points: 630 },
] as const;

export const POINTS_GUIDE = [
  { label: "Pesquisa por foto validada", points: 2 },
  { label: "Pesquisa por nome com visita confirmada", points: 2 },
  { label: "Avaliação da experiência", points: 10 },
  { label: 'Resposta "Visitaria novamente"', points: 20 },
] as const;

export const DAILY_UNIQUE_ESTABLISHMENT_LIMIT = 5;
export const PHOTO_SEARCH_COOLDOWN_DAYS = 30;
