import { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CameraView,
  useCameraPermissions,
  type CameraType,
  type FlashMode,
} from "expo-camera";
import * as Location from "expo-location";
import {
  PinchGestureHandler,
  State,
  type PinchGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import { theme } from "@/constants/theme";
import {
  clearAnalysisResult,
  saveCaptureSession,
} from "@/lib/session";

const ZOOM_STEP = 0.06;
const PINCH_SENSITIVITY = 0.45;
const MIN_ZOOM = 0;
const MAX_ZOOM = 1;

const FLASH_SEQUENCE: FlashMode[] = ["off", "auto", "on"];

function clampZoom(value: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

function formatZoomLabel(zoom: number): string {
  return `${(1 + zoom * 4).toFixed(1)}x`;
}

function getFlashLabel(mode: FlashMode): string {
  switch (mode) {
    case "on":
      return "On";
    case "auto":
      return "Auto";
    default:
      return "Off";
  }
}

function getLocationErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("denied")) {
      return "Permissão de localização negada. Autorize o acesso nas configurações.";
    }
    return error.message;
  }
  return "Não foi possível obter sua localização.";
}

export default function CameraScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const pinchBaseZoom = useRef(0);
  const zoomRef = useRef(0);
  const [permission, requestPermission] = useCameraPermissions();
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("auto");
  const [zoom, setZoom] = useState(0);

  const updateZoom = useCallback((value: number) => {
    const next = clampZoom(value);
    pinchBaseZoom.current = next;
    zoomRef.current = next;
    setZoom(next);
  }, []);

  const handlePinchGesture = useCallback(
    (event: PinchGestureHandlerGestureEvent) => {
      if (event.nativeEvent.state !== State.ACTIVE) return;

      const scaleDelta = event.nativeEvent.scale - 1;
      updateZoom(pinchBaseZoom.current + scaleDelta * PINCH_SENSITIVITY);
    },
    [updateZoom]
  );

  const handlePinchStateChange = useCallback(
    (event: PinchGestureHandlerGestureEvent) => {
      const { state } = event.nativeEvent;

      if (state === State.BEGAN) {
        pinchBaseZoom.current = zoomRef.current;
      }

      if (state === State.END || state === State.CANCELLED) {
        pinchBaseZoom.current = zoomRef.current;
      }
    },
    []
  );

  const handleCycleFlash = useCallback(() => {
    setFlash((current) => {
      const currentIndex = FLASH_SEQUENCE.indexOf(current);
      return FLASH_SEQUENCE[(currentIndex + 1) % FLASH_SEQUENCE.length];
    });
  }, []);

  const handleToggleFacing = useCallback(() => {
    setFacing((current) => {
      const next = current === "back" ? "front" : "back";
      if (next === "front") {
        setFlash("off");
      }
      return next;
    });
  }, []);

  const handleRequestPermission = useCallback(async () => {
    setError(null);
    const result = await requestPermission();
    if (!result.granted) {
      setError(
        "Permissão da câmera negada. Autorize o acesso nas configurações do iPhone."
      );
    }
  }, [requestPermission]);

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error(
          "Permissão de localização negada. Autorize o acesso nas configurações."
        );
      }

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.88,
        base64: true,
        skipProcessing: false,
      });

      if (!photo?.base64) {
        throw new Error("Falha ao processar a imagem.");
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const capturedAt = new Date().toISOString();
      const dataUrl = `data:image/jpeg;base64,${photo.base64}`;

      await clearAnalysisResult();
      await saveCaptureSession({
        photo: dataUrl,
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy ?? undefined,
        capturedAt,
      });

      router.push("/(main)/result");
    } catch (captureError) {
      setError(getLocationErrorMessage(captureError));
    } finally {
      setIsCapturing(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionScreen}>
        <View style={styles.permissionContent}>
          <Text style={styles.permissionTitle}>Acesso à câmera</Text>
          <Text style={styles.permissionText}>
            Peek precisa da câmera para fotografar a fachada do estabelecimento.
          </Text>
          {error && <Text style={styles.error}>{error}</Text>}
          <Pressable style={styles.permissionButton} onPress={handleRequestPermission}>
            <Text style={styles.permissionButtonText}>Continuar</Text>
          </Pressable>
          <Pressable onPress={() => router.replace("/(auth)/login")}>
            <Text style={styles.backLink}>Voltar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <PinchGestureHandler
        onGestureEvent={handlePinchGesture}
        onHandlerStateChange={handlePinchStateChange}
      >
        <View style={styles.cameraWrapper}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            mode="picture"
            zoom={zoom}
            flash={flash}
            autofocus="off"
            mirror={facing === "front"}
          />
        </View>
      </PinchGestureHandler>

      {error && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorOverlayText}>{error}</Text>
          <Pressable onPress={() => setError(null)}>
            <Text style={styles.retryLink}>Tentar novamente</Text>
          </Pressable>
        </View>
      )}

      <SafeAreaView style={styles.controls} pointerEvents="box-none">
        <View style={styles.topBar}>
          <Pressable
            accessibilityLabel="Voltar"
            style={styles.iconButton}
            onPress={() => router.replace("/(auth)/login")}
          >
            <Text style={styles.backChevron}>‹</Text>
          </Pressable>

          <View style={styles.topActions}>
            {facing === "back" ? (
              <Pressable
                accessibilityLabel={`Flash ${getFlashLabel(flash)}`}
                style={[
                  styles.iconButton,
                  flash !== "off" && styles.iconButtonActive,
                ]}
                onPress={handleCycleFlash}
              >
                <Text style={styles.iconButtonText}>⚡ {getFlashLabel(flash)}</Text>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityLabel="Alternar câmera"
              style={styles.iconButton}
              onPress={handleToggleFacing}
            >
              <Text style={styles.iconButtonText}>↻</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.bottomControls}>
          <View style={styles.zoomPanel}>
            <Pressable
              accessibilityLabel="Diminuir zoom"
              style={styles.zoomButton}
              onPress={() => updateZoom(zoom - ZOOM_STEP)}
            >
              <Text style={styles.zoomButtonText}>−</Text>
            </Pressable>

            <View style={styles.zoomVisual}>
              <View style={styles.zoomTrack}>
                <View
                  style={[styles.zoomFill, { width: `${zoom * 100}%` }]}
                />
              </View>
              <Text style={styles.zoomLabel}>{formatZoomLabel(zoom)}</Text>
            </View>

            <Pressable
              accessibilityLabel="Aumentar zoom"
              style={styles.zoomButton}
              onPress={() => updateZoom(zoom + ZOOM_STEP)}
            >
              <Text style={styles.zoomButtonText}>+</Text>
            </Pressable>
          </View>

          <View style={styles.shutterArea}>
            <Pressable
              accessibilityLabel="Capturar foto"
              disabled={isCapturing || !!error}
              onPress={handleCapture}
              style={({ pressed }) => [
                styles.shutterOuter,
                (isCapturing || !!error) && styles.shutterDisabled,
                pressed && styles.shutterPressed,
              ]}
            >
              {isCapturing ? (
                <ActivityIndicator color={theme.colors.primary} />
              ) : (
                <View style={styles.shutterInner} />
              )}
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.cameraOverlay,
  },
  cameraWrapper: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
  },
  permissionScreen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  permissionContent: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  permissionTitle: {
    ...theme.typography.title,
    textAlign: "center",
  },
  permissionText: {
    ...theme.typography.body,
    textAlign: "center",
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  permissionButton: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    minHeight: 52,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  permissionButtonText: {
    color: theme.colors.white,
    fontSize: 17,
    fontWeight: "500",
  },
  backLink: {
    ...theme.typography.caption,
    textAlign: "center",
    color: theme.colors.primary,
    marginTop: theme.spacing.sm,
  },
  controls: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  iconButton: {
    minWidth: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  iconButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 1)",
  },
  iconButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  backChevron: {
    fontSize: 28,
    lineHeight: 30,
    color: theme.colors.primary,
    marginTop: -2,
  },
  bottomControls: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  zoomPanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  zoomButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  zoomButtonText: {
    fontSize: 24,
    lineHeight: 26,
    color: theme.colors.primary,
    fontWeight: "500",
  },
  zoomVisual: {
    flex: 1,
    gap: 6,
  },
  zoomTrack: {
    height: 4,
    borderRadius: theme.radius.full,
    backgroundColor: "rgba(255, 255, 255, 0.35)",
    overflow: "hidden",
  },
  zoomFill: {
    height: "100%",
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.white,
  },
  zoomLabel: {
    color: theme.colors.white,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  shutterArea: {
    alignItems: "center",
  },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  shutterDisabled: {
    opacity: 0.45,
  },
  shutterPressed: {
    opacity: 0.88,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.88)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  errorOverlayText: {
    color: theme.colors.white,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  retryLink: {
    color: theme.colors.white,
    fontSize: 15,
    textDecorationLine: "underline",
  },
  error: {
    ...theme.typography.caption,
    color: theme.colors.error,
    textAlign: "center",
  },
});
