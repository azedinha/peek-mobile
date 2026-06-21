import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {

  View,

  Text,

  Pressable,

  StyleSheet,

  ActivityIndicator,

  Linking,

} from "react-native";

import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

import {

  CameraView,

  useCameraPermissions,

  type CameraType,

  type FlashMode,

} from "expo-camera";

import * as ImagePicker from "expo-image-picker";

import * as Location from "expo-location";

import {

  PinchGestureHandler,

  State,

  type PinchGestureHandlerGestureEvent,

} from "react-native-gesture-handler";

import { theme } from "@/constants/theme";

import {

  applyDisplayZoom,

  clampDisplayZoom,

  formatDisplayZoom,

  getSupportedZoomPresets,

  nearestPreset,

  pinchScaleToDisplayZoom,

  type ZoomPresetLevel,

} from "@/lib/camera-zoom";

import { prepareCapturePhoto } from "@/lib/capture-photo";

import {

  clearAnalysisResult,

  saveCaptureSession,

} from "@/lib/session";

import {

  ensureForegroundLocationPermission,

  ensureMediaLibraryPermission,

} from "@/lib/permissions";

import { HISTORY_ROUTE, HOME_ROUTE, RESULT_ROUTE } from "@/lib/routes";

const FLASH_SEQUENCE: FlashMode[] = ["off", "auto", "on"];



const DISPLAY_ZOOM_EPSILON = 0.008;

const CAMERA_ZOOM_EPSILON = 0.002;



interface ZoomRuntimeState {

  displayZoom: number;

  cameraZoom: number;

  selectedLens?: string;

}



const INITIAL_ZOOM_RUNTIME: ZoomRuntimeState = {

  displayZoom: 1,

  cameraZoom: 0,

  selectedLens: undefined,

};



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

  const pinchStartDisplayZoom = useRef(1);

  const displayZoomRef = useRef(1);

  const zoomRuntimeRef = useRef<ZoomRuntimeState>(INITIAL_ZOOM_RUNTIME);

  const pendingPinchZoomRef = useRef<number | null>(null);

  const pinchFrameRef = useRef<number | null>(null);

  const cameraPromptStarted = useRef(false);

  const [permission, requestPermission] = useCameraPermissions();

  const [isRequestingCamera, setIsRequestingCamera] = useState(false);

  const [isCameraConfigured, setIsCameraConfigured] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [galleryError, setGalleryError] = useState<string | null>(null);

  const [isCapturing, setIsCapturing] = useState(false);

  const [isPickingGallery, setIsPickingGallery] = useState(false);

  const [facing] = useState<CameraType>("back");

  const [flash, setFlash] = useState<FlashMode>("auto");

  const [availableLenses, setAvailableLenses] = useState<string[]>([]);

  const [zoomRuntime, setZoomRuntime] =

    useState<ZoomRuntimeState>(INITIAL_ZOOM_RUNTIME);

  const [isPinching, setIsPinching] = useState(false);



  const supportedPresets = useMemo(

    () => getSupportedZoomPresets(availableLenses, facing),

    [availableLenses, facing]

  );



  const activePreset = useMemo(

    () => nearestPreset(zoomRuntime.displayZoom, supportedPresets),

    [zoomRuntime.displayZoom, supportedPresets]

  );



  const commitZoomRuntime = useCallback(

    (nextDisplay: number, options?: { asPreset?: boolean }) => {

      const clamped = clampDisplayZoom(nextDisplay);

      const { zoom, selectedLens: lens } = applyDisplayZoom(

        clamped,

        availableLenses,

        {

          asPreset: options?.asPreset,

          stickyLens: options?.asPreset

            ? undefined

            : zoomRuntimeRef.current.selectedLens,

        }

      );

      const prev = zoomRuntimeRef.current;

      const unchanged =

        Math.abs(prev.displayZoom - clamped) < DISPLAY_ZOOM_EPSILON &&

        Math.abs(prev.cameraZoom - zoom) < CAMERA_ZOOM_EPSILON &&

        prev.selectedLens === lens;



      if (unchanged) {

        displayZoomRef.current = clamped;

        return;

      }



      const nextRuntime: ZoomRuntimeState = {

        displayZoom: clamped,

        cameraZoom: zoom,

        selectedLens: lens,

      };



      zoomRuntimeRef.current = nextRuntime;

      displayZoomRef.current = clamped;

      setZoomRuntime(nextRuntime);

    },

    [availableLenses]

  );



  const flushPinchFrame = useCallback(() => {

    pinchFrameRef.current = null;



    const pending = pendingPinchZoomRef.current;

    if (pending === null) {

      return;

    }



    commitZoomRuntime(pending);

  }, [commitZoomRuntime]);



  const schedulePinchCommit = useCallback(

    (target: number) => {

      pendingPinchZoomRef.current = clampDisplayZoom(target);



      if (pinchFrameRef.current !== null) {

        return;

      }



      pinchFrameRef.current = requestAnimationFrame(flushPinchFrame);

    },

    [flushPinchFrame]

  );



  const cancelPinchFrame = useCallback(() => {

    if (pinchFrameRef.current !== null) {

      cancelAnimationFrame(pinchFrameRef.current);

      pinchFrameRef.current = null;

    }



    pendingPinchZoomRef.current = null;

  }, []);



  const handleAvailableLensesChanged = useCallback(

    ({ lenses }: { lenses: string[] }) => {

      setAvailableLenses(lenses);

    },

    []

  );



  const handleCameraReady = useCallback(async () => {

    const lenses = (await cameraRef.current?.getAvailableLensesAsync()) ?? [];

    setAvailableLenses(lenses);

    commitZoomRuntime(1);

    setIsCameraConfigured(true);

  }, [commitZoomRuntime]);



  useEffect(() => {

    if (availableLenses.length === 0) return;

    commitZoomRuntime(displayZoomRef.current);

  }, [availableLenses, commitZoomRuntime]);



  useEffect(() => cancelPinchFrame, [cancelPinchFrame]);



  const handlePinchGesture = useCallback(

    (event: PinchGestureHandlerGestureEvent) => {

      if (event.nativeEvent.state !== State.ACTIVE) return;



      schedulePinchCommit(

        pinchScaleToDisplayZoom(

          pinchStartDisplayZoom.current,

          event.nativeEvent.scale

        )

      );

    },

    [schedulePinchCommit]

  );



  const handlePinchStateChange = useCallback(

    (event: PinchGestureHandlerGestureEvent) => {

      const { state } = event.nativeEvent;



      if (state === State.BEGAN) {

        cancelPinchFrame();

        pinchStartDisplayZoom.current = displayZoomRef.current;

        setIsPinching(true);

      }



      if (state === State.END || state === State.CANCELLED) {

        cancelPinchFrame();



        const finalZoom =

          pendingPinchZoomRef.current ?? displayZoomRef.current;

        commitZoomRuntime(finalZoom);

        setIsPinching(false);

      }

    },

    [cancelPinchFrame, commitZoomRuntime]

  );



  const handleSelectPreset = useCallback(

    (preset: ZoomPresetLevel) => {

      cancelPinchFrame();

      commitZoomRuntime(preset, { asPreset: true });

    },

    [cancelPinchFrame, commitZoomRuntime]

  );



  const handleCycleFlash = useCallback(() => {

    setFlash((current) => {

      const currentIndex = FLASH_SEQUENCE.indexOf(current);

      return FLASH_SEQUENCE[(currentIndex + 1) % FLASH_SEQUENCE.length];

    });

  }, []);



  useEffect(() => {

    if (!permission || permission.granted || cameraPromptStarted.current) {

      return;

    }



    cameraPromptStarted.current = true;

    setIsRequestingCamera(true);

    requestPermission().finally(() => setIsRequestingCamera(false));

  }, [permission, requestPermission]);



  const finalizePhoto = useCallback(

    async (photoDataUrl: string) => {

      const locationPermission = await ensureForegroundLocationPermission();

      if (!locationPermission.granted) {

        throw new Error(

          locationPermission.canAskAgain

            ? "Permissão de localização negada."

            : "Permissão de localização negada. Autorize o acesso nas configurações."

        );

      }



      const position = await Location.getCurrentPositionAsync({

        accuracy: Location.Accuracy.High,

      });



      const capturedAt = new Date().toISOString();



      await clearAnalysisResult();

      await saveCaptureSession({

        photo: photoDataUrl,

        lat: position.coords.latitude,

        lng: position.coords.longitude,

        accuracy: position.coords.accuracy ?? undefined,

        capturedAt,

        eligibleForEvaluation: true,

        consultationSource: "photo",

      });



      router.push(RESULT_ROUTE);

    },

    [router]

  );



  const handleCapture = async () => {

    if (!cameraRef.current || isCapturing) return;



    setIsCapturing(true);

    setError(null);



    try {

      const photo = await cameraRef.current.takePictureAsync({

        quality: 1,

        base64: false,

        skipProcessing: false,

      });



      if (!photo?.uri) {

        throw new Error("Falha ao processar a imagem.");

      }



      const prepared = await prepareCapturePhoto({

        uri: photo.uri,

        width: photo.width,

        height: photo.height,

      });



      await finalizePhoto(prepared.dataUrl);

    } catch (captureError) {

      setError(getLocationErrorMessage(captureError));

    } finally {

      setIsCapturing(false);

    }

  };



  const handleOpenGallery = async () => {

    if (isPickingGallery || isCapturing) return;



    setGalleryError(null);

    setIsPickingGallery(true);



    try {

      const mediaPermission = await ensureMediaLibraryPermission();

      if (!mediaPermission.granted) {

        setGalleryError(

          mediaPermission.canAskAgain

            ? "Permissão de fotos negada."

            : "Permissão de fotos negada. Abra as configurações para autorizar o acesso."

        );

        return;

      }



      const result = await ImagePicker.launchImageLibraryAsync({

        mediaTypes: ["images"],

        allowsEditing: false,

        quality: 1,

        base64: false,

      });



      if (result.canceled || !result.assets[0]?.uri) {

        return;

      }



      setIsCapturing(true);

      const asset = result.assets[0];

      const prepared = await prepareCapturePhoto({

        uri: asset.uri,

        width: asset.width,

        height: asset.height,

      });

      await finalizePhoto(prepared.dataUrl);

    } catch (pickError) {

      setGalleryError(getLocationErrorMessage(pickError));

    } finally {

      setIsPickingGallery(false);

      setIsCapturing(false);

    }

  };



  if (!permission || isRequestingCamera) {

    return (

      <View style={styles.centered}>

        <ActivityIndicator color={theme.colors.primary} />

      </View>

    );

  }



  if (!permission.granted) {

    return (

      <SafeAreaView style={styles.centered}>

        <Pressable

          style={styles.settingsButton}

          onPress={() => Linking.openSettings()}

        >

          <Text style={styles.settingsButtonText}>Abrir configurações</Text>

        </Pressable>

        <Pressable onPress={() => router.navigate(HOME_ROUTE)}>

          <Text style={styles.backLink}>Voltar</Text>

        </Pressable>

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

            zoom={zoomRuntime.cameraZoom}

            selectedLens={zoomRuntime.selectedLens}

            flash={flash}

            autofocus="off"

            onCameraReady={handleCameraReady}

            onAvailableLensesChanged={handleAvailableLensesChanged}

          />

          {!isCameraConfigured ? (

            <View style={styles.cameraLoadingOverlay}>

              <ActivityIndicator color={theme.colors.white} />

            </View>

          ) : null}

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



      {galleryError && (

        <View style={styles.galleryErrorBanner}>

          <Text style={styles.galleryErrorText}>{galleryError}</Text>

          {galleryError.includes("configurações") ? (

            <Pressable onPress={() => Linking.openSettings()}>

              <Text style={styles.galleryErrorAction}>Abrir configurações</Text>

            </Pressable>

          ) : (

            <Pressable onPress={() => setGalleryError(null)}>

              <Text style={styles.galleryErrorAction}>Fechar</Text>

            </Pressable>

          )}

        </View>

      )}



      <SafeAreaView style={styles.controls} pointerEvents="box-none">

        <View style={styles.topBar}>

          <Pressable

            accessibilityLabel="Voltar"

            style={styles.topIconButton}

            onPress={() => router.navigate(HOME_ROUTE)}

          >

            <Ionicons name="chevron-back" size={22} color={theme.colors.white} />

          </Pressable>



          <View style={styles.topActions}>

            <Pressable

              accessibilityLabel="Histórico"

              style={styles.topIconButton}

              onPress={() => router.navigate(HISTORY_ROUTE)}

            >

              <Ionicons name="time-outline" size={20} color={theme.colors.white} />

            </Pressable>

            <Pressable

              accessibilityLabel={`Flash ${getFlashLabel(flash)}`}

              style={[

                styles.topIconButton,

                flash !== "off" && styles.topIconButtonActive,

              ]}

              onPress={handleCycleFlash}

            >

              <Text style={styles.topIconLight}>⚡</Text>

            </Pressable>

          </View>

        </View>



        <View style={styles.bottomArea}>

          {supportedPresets.length > 1 ? (

            <View style={styles.zoomSelector}>

              {isPinching ? (

                <View style={styles.zoomLiveIndicator}>

                  <Text style={styles.zoomLiveText}>

                    {formatDisplayZoom(zoomRuntime.displayZoom)}

                  </Text>

                </View>

              ) : (

                supportedPresets.map((preset) => {

                  const isActive = activePreset === preset;

                  return (

                    <Pressable

                      key={preset}

                      accessibilityLabel={`Zoom ${preset}x`}

                      onPress={() => handleSelectPreset(preset)}

                      style={[

                        styles.zoomPreset,

                        isActive && styles.zoomPresetActive,

                      ]}

                    >

                      <Text

                        style={[

                          styles.zoomPresetText,

                          isActive && styles.zoomPresetTextActive,

                        ]}

                      >

                        {preset === 0.5 ? ".5" : preset}x

                      </Text>

                    </Pressable>

                  );

                })

              )}

            </View>

          ) : null}



          <View style={styles.captureRow}>

            <Pressable

              accessibilityLabel="Abrir galeria"

              disabled={isPickingGallery || isCapturing}

              onPress={handleOpenGallery}

              style={({ pressed }) => [

                styles.galleryButton,

                pressed && styles.galleryButtonPressed,

                (isPickingGallery || isCapturing) && styles.galleryButtonDisabled,

              ]}

            >

              {isPickingGallery ? (

                <ActivityIndicator color={theme.colors.white} size="small" />

              ) : (

                <View style={styles.galleryThumb}>

                  <Text style={styles.galleryIcon}>▦</Text>

                </View>

              )}

            </Pressable>



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



            <View style={styles.captureSpacer} />

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

  cameraLoadingOverlay: {

    ...StyleSheet.absoluteFillObject,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "rgba(0, 0, 0, 0.35)",

  },

  centered: {

    flex: 1,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: theme.colors.background,

    gap: theme.spacing.md,

    paddingHorizontal: theme.spacing.lg,

  },

  settingsButton: {

    backgroundColor: theme.colors.primary,

    minHeight: 52,

    borderRadius: theme.radius.md,

    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: theme.spacing.lg,

  },

  settingsButtonText: {

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

    paddingTop: theme.spacing.xs,

  },

  topActions: {

    flexDirection: "row",

    alignItems: "center",

    gap: theme.spacing.xs,

  },

  topIconButton: {

    width: 40,

    height: 40,

    borderRadius: 20,

    backgroundColor: "rgba(0, 0, 0, 0.35)",

    alignItems: "center",

    justifyContent: "center",

  },

  topIconButtonActive: {

    backgroundColor: "rgba(255, 255, 255, 0.22)",

  },

  topIconLight: {

    color: theme.colors.white,

    fontSize: 18,

    fontWeight: "600",

  },

  bottomArea: {

    gap: theme.spacing.md,

    paddingBottom: theme.spacing.lg,

  },

  zoomSelector: {

    alignSelf: "center",

    flexDirection: "row",

    alignItems: "center",

    gap: 4,

    backgroundColor: "rgba(0, 0, 0, 0.42)",

    borderRadius: theme.radius.full,

    paddingHorizontal: 6,

    paddingVertical: 6,

    minHeight: 36,

  },

  zoomPreset: {

    minWidth: 34,

    height: 28,

    borderRadius: 14,

    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: 8,

  },

  zoomPresetActive: {

    backgroundColor: "rgba(255, 204, 0, 0.95)",

  },

  zoomPresetText: {

    color: "rgba(255, 255, 255, 0.88)",

    fontSize: 12,

    fontWeight: "600",

  },

  zoomPresetTextActive: {

    color: "#111111",

  },

  zoomLiveIndicator: {

    minWidth: 72,

    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: theme.spacing.sm,

  },

  zoomLiveText: {

    color: "#FFCC00",

    fontSize: 13,

    fontWeight: "700",

  },

  captureRow: {

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    paddingHorizontal: theme.spacing.xl,

  },

  galleryButton: {

    width: 52,

    height: 52,

    alignItems: "center",

    justifyContent: "center",

  },

  galleryButtonPressed: {

    opacity: 0.82,

  },

  galleryButtonDisabled: {

    opacity: 0.45,

  },

  galleryThumb: {

    width: 44,

    height: 44,

    borderRadius: 10,

    borderWidth: 2,

    borderColor: "rgba(255, 255, 255, 0.92)",

    backgroundColor: "rgba(255, 255, 255, 0.12)",

    alignItems: "center",

    justifyContent: "center",

  },

  galleryIcon: {

    color: theme.colors.white,

    fontSize: 20,

    fontWeight: "600",

  },

  captureSpacer: {

    width: 52,

    height: 52,

  },

  shutterOuter: {

    width: 78,

    height: 78,

    borderRadius: 39,

    borderWidth: 4,

    borderColor: theme.colors.white,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "transparent",

  },

  shutterInner: {

    width: 62,

    height: 62,

    borderRadius: 31,

    backgroundColor: theme.colors.white,

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

  galleryErrorBanner: {

    position: "absolute",

    left: theme.spacing.md,

    right: theme.spacing.md,

    bottom: 180,

    backgroundColor: "rgba(0, 0, 0, 0.78)",

    borderRadius: theme.radius.md,

    paddingHorizontal: theme.spacing.md,

    paddingVertical: theme.spacing.sm,

    gap: 6,

  },

  galleryErrorText: {

    color: theme.colors.white,

    fontSize: 14,

    textAlign: "center",

  },

  galleryErrorAction: {

    color: "#FFCC00",

    fontSize: 14,

    fontWeight: "600",

    textAlign: "center",

  },

});


