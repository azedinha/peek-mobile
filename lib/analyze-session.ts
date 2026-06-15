import type { CaptureSession, PeekAnalysisResult } from "@/types/peek";
import { analyzeCapture, analyzePlace } from "@/lib/api";

export async function runAnalysisForSession(
  session: CaptureSession
): Promise<PeekAnalysisResult> {
  if (session.placeId) {
    return analyzePlace(session.placeId);
  }

  return analyzeCapture(session);
}
