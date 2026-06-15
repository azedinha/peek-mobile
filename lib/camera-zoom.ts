import type { CameraType } from "expo-camera";
import { Platform } from "react-native";

export const ZOOM_PRESET_LEVELS = [0.5, 1, 2, 5] as const;
export type ZoomPresetLevel = (typeof ZOOM_PRESET_LEVELS)[number];

export const MAX_DISPLAY_ZOOM = 5;

const VIRTUAL_LENS_PATTERN = /dual|triple|dupla|tripla|virtual|combinada/i;
const ULTRA_WIDE_PATTERN = /ultra[\s-]?(wide|angular)|ultra angular/i;
const TELE_PATTERN = /tele(photo|objetiva)?|periscop|periscópio/i;
const WIDE_PATTERN =
  /(^(back|rear|traseira)\s*camera$)|((grande[\s-]?)?angular)|(wide(?!.*ultra))/i;

const PINCH_EXPONENT = 0.42;

/** Margem para preferir manter a lente atual durante pinch contínuo. */
const LENS_SWITCH_MARGIN = 0.18;

export interface ZoomLevelMapping {
  preset: ZoomPresetLevel;
  selectedLens: string | null;
  cameraZoom: number;
  notes: string;
}

export interface LensCatalog {
  ultraWide: string | null;
  wide: string | null;
  teles: TeleLensInfo[];
}

export interface TeleLensInfo {
  name: string;
  opticalFactor: number;
}

export interface ApplyDisplayZoomOptions {
  stickyLens?: string;
  asPreset?: boolean;
}

interface ZoomCandidate {
  lens?: string;
  opticalFactor: number;
  digitalFactor: number;
  error: number;
}

export function isVirtualLens(name: string): boolean {
  return VIRTUAL_LENS_PATTERN.test(name);
}

function physicalLenses(lenses: string[]): string[] {
  return lenses.filter((lens) => !isVirtualLens(lens));
}

export function findUltraWideLens(lenses: string[]): string | null {
  const physical = physicalLenses(lenses);
  return (
    physical.find((lens) => ULTRA_WIDE_PATTERN.test(lens)) ??
    physical.find((lens) => /ultra/i.test(lens) && /wide|angular/i.test(lens)) ??
    null
  );
}

export function findWideLens(lenses: string[]): string | null {
  const physical = physicalLenses(lenses);

  return (
    physical.find((lens) => /^back camera$/i.test(lens.trim())) ??
    physical.find(
      (lens) =>
        WIDE_PATTERN.test(lens) &&
        !ULTRA_WIDE_PATTERN.test(lens) &&
        !TELE_PATTERN.test(lens)
    ) ??
    physical.find(
      (lens) =>
        !ULTRA_WIDE_PATTERN.test(lens) &&
        !TELE_PATTERN.test(lens) &&
        !/front|true depth|depth/i.test(lens)
    ) ??
    null
  );
}

function inferTeleOpticalFactor(lensName: string, index: number, total: number): number {
  const explicitFactor = lensName.match(/(\d+(?:\.\d+)?)\s*x/i);
  if (explicitFactor) {
    return Number.parseFloat(explicitFactor[1]);
  }

  if (/periscop|periscópio/i.test(lensName)) {
    return 5;
  }

  if (total >= 2) {
    return index === 0 ? 2 : 3;
  }

  return 2;
}

function findAllTelephotoLenses(lenses: string[]): TeleLensInfo[] {
  const physical = physicalLenses(lenses).filter((lens) => TELE_PATTERN.test(lens));

  return physical
    .map((name, index) => ({
      name,
      opticalFactor: inferTeleOpticalFactor(name, index, physical.length),
    }))
    .sort((a, b) => a.opticalFactor - b.opticalFactor);
}

export function buildLensCatalog(lenses: string[]): LensCatalog {
  return {
    ultraWide: findUltraWideLens(lenses),
    wide: findWideLens(lenses),
    teles: findAllTelephotoLenses(lenses),
  };
}

function buildCandidates(
  targetFactor: number,
  catalog: LensCatalog
): ZoomCandidate[] {
  const candidates: ZoomCandidate[] = [];

  if (catalog.ultraWide && targetFactor < 1) {
    const digitalFactor = targetFactor / 0.5;
    if (digitalFactor >= 1) {
      candidates.push({
        lens: catalog.ultraWide,
        opticalFactor: 0.5,
        digitalFactor,
        error: Math.abs(targetFactor - 0.5 * digitalFactor),
      });
    }
  }

  if (catalog.wide) {
    const digitalFactor = targetFactor;
    if (digitalFactor >= 1) {
      candidates.push({
        lens: catalog.wide,
        opticalFactor: 1,
        digitalFactor,
        error: Math.abs(targetFactor - digitalFactor),
      });
    }
  }

  for (const tele of catalog.teles) {
    const digitalFactor = targetFactor / tele.opticalFactor;
    if (digitalFactor >= 1) {
      candidates.push({
        lens: tele.name,
        opticalFactor: tele.opticalFactor,
        digitalFactor,
        error: Math.abs(targetFactor - tele.opticalFactor * digitalFactor),
      });
    }
  }

  if (candidates.length === 0 && targetFactor >= 1) {
    candidates.push({
      lens: undefined,
      opticalFactor: 1,
      digitalFactor: targetFactor,
      error: 0,
    });
  }

  return candidates;
}

function pickBestCandidate(
  candidates: ZoomCandidate[],
  stickyLens?: string
): ZoomCandidate {
  const sorted = [...candidates].sort((a, b) => {
    if (a.error !== b.error) return a.error - b.error;
    const digitalDelta = a.digitalFactor - b.digitalFactor;
    if (digitalDelta !== 0) return digitalDelta;
    return a.opticalFactor - b.opticalFactor;
  });

  if (!stickyLens) {
    return sorted[0];
  }

  const stickyCandidate = sorted.find((candidate) => candidate.lens === stickyLens);
  if (!stickyCandidate) {
    return sorted[0];
  }

  if (sorted[0].error + LENS_SWITCH_MARGIN < stickyCandidate.error) {
    return sorted[0];
  }

  return stickyCandidate;
}

/**
 * Estimativa do videoMaxZoomFactor (iOS) / maxZoomRatio (Android) da lente ativa.
 * Expo mapeia camera.zoom 0→1 sobre esse máximo nativo; subestimar aqui causa overshoot visual.
 */
function resolveNativeMaxReference(opticalFactor: number): number {
  if (opticalFactor <= 0.5) {
    return 4;
  }

  if (opticalFactor <= 1) {
    return Platform.OS === "ios" ? MAX_DISPLAY_ZOOM * 5 : MAX_DISPLAY_ZOOM * 2;
  }

  if (opticalFactor <= 2) {
    return Platform.OS === "ios" ? 15 : MAX_DISPLAY_ZOOM * 3;
  }

  if (opticalFactor <= 3) {
    return Platform.OS === "ios" ? 12 : MAX_DISPLAY_ZOOM * 2.5;
  }

  return Platform.OS === "ios" ? 10 : MAX_DISPLAY_ZOOM * 2;
}

function capDigitalFactor(digitalFactor: number, opticalFactor: number): number {
  const maxDigitalOnLens = MAX_DISPLAY_ZOOM / opticalFactor;
  return Math.min(digitalFactor, maxDigitalOnLens);
}

export function displayFactorToCameraZoom(
  digitalFactor: number,
  opticalFactor = 1
): number {
  if (digitalFactor <= 1) {
    return 0;
  }

  const cappedDigital = capDigitalFactor(digitalFactor, opticalFactor);
  const nativeMaxReference = resolveNativeMaxReference(opticalFactor);

  if (Platform.OS === "ios") {
    // Expo iOS: videoZoomFactor = pow(nativeMax, cameraZoom)
    return Math.min(1, Math.log(cappedDigital) / Math.log(nativeMaxReference));
  }

  // Expo Android: targetZoomRatio = cameraZoom * maxZoomRatio
  return Math.min(1, cappedDigital / nativeMaxReference);
}

export function normalizedToDisplayZoom(
  normalized: number,
  opticalFactor = 1
): number {
  if (normalized <= 0) {
    return 1;
  }

  const nativeMaxReference = resolveNativeMaxReference(opticalFactor);
  const clampedNormalized = Math.min(1, normalized);

  if (Platform.OS === "ios") {
    const factor = Math.pow(nativeMaxReference, clampedNormalized);
    return Math.round(Math.min(factor, MAX_DISPLAY_ZOOM) * 10) / 10;
  }

  const factor = clampedNormalized * nativeMaxReference;
  return Math.round(Math.min(factor, MAX_DISPLAY_ZOOM) * 10) / 10;
}

export function clampDisplayZoom(value: number): number {
  return Math.min(MAX_DISPLAY_ZOOM, Math.max(0.5, value));
}

function candidateToCameraCommand(
  candidate: ZoomCandidate
): { zoom: number; selectedLens?: string } {
  return {
    zoom: displayFactorToCameraZoom(
      candidate.digitalFactor,
      candidate.opticalFactor
    ),
    selectedLens: candidate.lens,
  };
}

export function canAchieveTargetFactor(
  targetFactor: number,
  catalog: LensCatalog
): boolean {
  return buildCandidates(targetFactor, catalog).length > 0;
}

export function resolvePresetZoom(
  preset: ZoomPresetLevel,
  lenses: string[]
): { zoom: number; selectedLens?: string } {
  const catalog = buildLensCatalog(lenses);
  const candidates = buildCandidates(preset, catalog);
  const best = pickBestCandidate(candidates);
  return candidateToCameraCommand(best);
}

export function applyDisplayZoom(
  displayZoom: number,
  lenses: string[],
  options?: ApplyDisplayZoomOptions
): { zoom: number; selectedLens?: string } {
  const catalog = buildLensCatalog(lenses);
  const clamped = clampDisplayZoom(displayZoom);

  if (options?.asPreset) {
    const preset = ZOOM_PRESET_LEVELS.find(
      (level) => Math.abs(level - clamped) < 0.001
    );
    if (preset) {
      return resolvePresetZoom(preset, lenses);
    }
  }

  const candidates = buildCandidates(clamped, catalog);
  const best = pickBestCandidate(candidates, options?.stickyLens);
  return candidateToCameraCommand(best);
}

export function getSupportedZoomPresets(
  availableLenses: string[],
  facing: CameraType
): ZoomPresetLevel[] {
  if (facing === "front") {
    return [1];
  }

  const catalog = buildLensCatalog(availableLenses);
  const presets: ZoomPresetLevel[] = [1];

  if (catalog.ultraWide) {
    presets.unshift(0.5);
  }

  if (canAchieveTargetFactor(2, catalog)) {
    presets.push(2);
  }

  if (canAchieveTargetFactor(5, catalog)) {
    presets.push(5);
  }

  return presets;
}

export function getZoomLevelMappings(lenses: string[]): ZoomLevelMapping[] {
  const catalog = buildLensCatalog(lenses);

  return ZOOM_PRESET_LEVELS.map((preset) => {
    const { zoom, selectedLens } = resolvePresetZoom(preset, lenses);
    const candidate = pickBestCandidate(buildCandidates(preset, catalog));

    return {
      preset,
      selectedLens: selectedLens ?? null,
      cameraZoom: zoom,
      notes: [
        `lente=${selectedLens ?? "default"}`,
        `optical=${candidate.opticalFactor}x`,
        `digital=${candidate.digitalFactor.toFixed(2)}x`,
        `nativeMax=${resolveNativeMaxReference(candidate.opticalFactor)}`,
        `camera.zoom=${zoom.toFixed(3)}`,
      ].join("; "),
    };
  });
}

export function pinchScaleToDisplayZoom(
  baseDisplayZoom: number,
  scale: number
): number {
  const adjustedScale = Math.pow(Math.max(scale, 0.01), PINCH_EXPONENT);
  return clampDisplayZoom(baseDisplayZoom * adjustedScale);
}

export function formatDisplayZoom(value: number): string {
  if (value < 1) {
    return `${value.toFixed(1)}x`;
  }

  if (Number.isInteger(value)) {
    return `${value}x`;
  }

  return `${value.toFixed(1)}x`;
}

export function nearestPreset(
  displayZoom: number,
  presets: ZoomPresetLevel[]
): ZoomPresetLevel {
  return presets.reduce((closest, preset) => {
    return Math.abs(preset - displayZoom) < Math.abs(closest - displayZoom)
      ? preset
      : closest;
  }, presets[0]);
}
