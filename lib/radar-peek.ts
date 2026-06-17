import { config, isApiConfigured } from "@/lib/config";
import type { RadarPeekResponse } from "@/types/radar";

export async function fetchRadarPeek(): Promise<RadarPeekResponse> {
  if (!isApiConfigured()) {
    return {
      mode: "ranking",
      city: "Brasília",
      periodDays: 7,
      generatedAt: new Date().toISOString(),
      rankingTitle: "📈 Ranking Peek Brasília",
      pickTitle: "🏆 Peek da Semana",
      pickDescription:
        "Escolhido pela comunidade Peek como o destaque da semana.",
      ranking: [],
      pickOfWeek: null,
    };
  }

  const baseUrl = config.apiUrl.replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/api/home/radar`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("Não foi possível carregar o Radar Peek.");
  }

  return (await response.json()) as RadarPeekResponse;
}
