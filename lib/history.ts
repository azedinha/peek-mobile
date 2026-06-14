import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  AnalysisHistoryEntry,
  CaptureSession,
  PeekAnalysisResult,
} from "@/types/peek";
import { saveAnalysisResult, saveCaptureSession } from "@/lib/session";

const HISTORY_KEY = "peek-analysis-history";
const MAX_HISTORY_ENTRIES = 25;

async function readHistory(): Promise<AnalysisHistoryEntry[]> {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as AnalysisHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeHistory(entries: AnalysisHistoryEntry[]): Promise<void> {
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
}

function createEntryId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function getHistoryEntries(): Promise<AnalysisHistoryEntry[]> {
  const entries = await readHistory();
  return entries.sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  );
}

export async function addHistoryEntry(
  session: CaptureSession,
  result: PeekAnalysisResult
): Promise<void> {
  const entries = await readHistory();
  const savedAt = new Date().toISOString();
  const existing = entries.find(
    (entry) => entry.capturedAt === result.capturedAt
  );

  const nextEntry: AnalysisHistoryEntry = {
    id: existing?.id ?? createEntryId(),
    photo: session.photo,
    lat: session.lat,
    lng: session.lng,
    accuracy: session.accuracy,
    capturedAt: session.capturedAt,
    result,
    savedAt,
  };

  const withoutDuplicate = entries.filter(
    (entry) => entry.capturedAt !== result.capturedAt
  );
  const updated = [nextEntry, ...withoutDuplicate].slice(0, MAX_HISTORY_ENTRIES);

  await writeHistory(updated);
}

export async function getHistoryEntry(
  id: string
): Promise<AnalysisHistoryEntry | null> {
  const entries = await readHistory();
  return entries.find((entry) => entry.id === id) ?? null;
}

export async function restoreHistoryEntry(
  id: string
): Promise<AnalysisHistoryEntry | null> {
  const entry = await getHistoryEntry(id);
  if (!entry) return null;

  await saveCaptureSession({
    photo: entry.photo,
    lat: entry.lat,
    lng: entry.lng,
    accuracy: entry.accuracy,
    capturedAt: entry.capturedAt,
  });
  await saveAnalysisResult(entry.result);

  return entry;
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(HISTORY_KEY);
}
