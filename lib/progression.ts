import type { UserProgression } from "@/types/peek";

export const DEFAULT_USER_PROGRESSION: UserProgression = {
  user_id: "",
  total_points: 0,
  total_reviews: 0,
  level: "visitante",
  level_label: "Visitante",
  level_number: 1,
  previous_level_points: 0,
  next_level_points: 25,
  points_to_next_level: 25,
  progress_percent: 0,
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
};

export function getProgressionProgressRatio(progression: UserProgression): number {
  if (progression.next_level_points == null) {
    return 1;
  }

  const span = progression.next_level_points - progression.previous_level_points;
  if (span <= 0) return 0;

  const current = progression.total_points - progression.previous_level_points;
  return Math.min(1, Math.max(0, current / span));
}
