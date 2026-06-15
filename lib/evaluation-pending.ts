import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CaptureSession, PeekAnalysisResult } from "@/types/peek";

const PENDING_EVALUATION_KEY = "peek-pending-evaluation";

export type ConsultationSource = "photo" | "search";

export interface PendingEvaluation {
  placeId: string;
  establishmentName: string;
  consultationSource: ConsultationSource;
  capturedAt: string;
  detailsCompleted: boolean;
}

export async function getPendingEvaluation(): Promise<PendingEvaluation | null> {
  const raw = await AsyncStorage.getItem(PENDING_EVALUATION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PendingEvaluation;
  } catch {
    return null;
  }
}

export async function setPendingEvaluation(
  evaluation: PendingEvaluation
): Promise<void> {
  await AsyncStorage.setItem(PENDING_EVALUATION_KEY, JSON.stringify(evaluation));
}

export async function clearPendingEvaluation(): Promise<void> {
  await AsyncStorage.removeItem(PENDING_EVALUATION_KEY);
}

export async function markDetailsCompletedForEvaluation(): Promise<void> {
  const pending = await getPendingEvaluation();
  if (!pending) return;

  if (pending.detailsCompleted) return;

  await setPendingEvaluation({
    ...pending,
    detailsCompleted: true,
  });
}

export async function registerPendingEvaluationIfEligible(
  session: CaptureSession,
  result: PeekAnalysisResult
): Promise<void> {
  if (!session.eligibleForEvaluation) return;

  const placeId = result.establishment.placeId?.trim();
  if (!placeId) return;

  const consultationSource =
    session.consultationSource ??
    (session.searchQuery || session.placeId ? "search" : "photo");

  await setPendingEvaluation({
    placeId,
    establishmentName: result.establishment.name,
    consultationSource,
    capturedAt: result.capturedAt,
    detailsCompleted: false,
  });
}
