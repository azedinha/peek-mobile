import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CaptureSession, PeekAnalysisResult } from "@/types/peek";

const CAPTURE_SESSION_KEY = "peek-capture-session";
const ANALYSIS_RESULT_KEY = "peek-analysis-result";

export async function saveCaptureSession(
  session: CaptureSession
): Promise<void> {
  await AsyncStorage.setItem(CAPTURE_SESSION_KEY, JSON.stringify(session));
}

export async function getCaptureSession(): Promise<CaptureSession | null> {
  const raw = await AsyncStorage.getItem(CAPTURE_SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as CaptureSession;
  } catch {
    return null;
  }
}

export async function clearCaptureSession(): Promise<void> {
  await AsyncStorage.removeItem(CAPTURE_SESSION_KEY);
}

export async function saveAnalysisResult(
  result: PeekAnalysisResult
): Promise<void> {
  await AsyncStorage.setItem(ANALYSIS_RESULT_KEY, JSON.stringify(result));
}

export async function getAnalysisResult(): Promise<PeekAnalysisResult | null> {
  const raw = await AsyncStorage.getItem(ANALYSIS_RESULT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PeekAnalysisResult;
  } catch {
    return null;
  }
}

export async function clearAnalysisResult(): Promise<void> {
  await AsyncStorage.removeItem(ANALYSIS_RESULT_KEY);
}

export async function clearPeekSession(): Promise<void> {
  await clearCaptureSession();
  await clearAnalysisResult();
}
