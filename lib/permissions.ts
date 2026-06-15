import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { Camera } from "expo-camera";
import { Platform } from "react-native";

export interface PermissionResult {
  granted: boolean;
  canAskAgain: boolean;
}

export function configureNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function ensureForegroundLocationPermission(): Promise<PermissionResult> {
  const current = await Location.getForegroundPermissionsAsync();

  if (current.status === Location.PermissionStatus.GRANTED) {
    return { granted: true, canAskAgain: current.canAskAgain };
  }

  if (!current.canAskAgain) {
    return { granted: false, canAskAgain: false };
  }

  const requested = await Location.requestForegroundPermissionsAsync();

  return {
    granted: requested.status === Location.PermissionStatus.GRANTED,
    canAskAgain: requested.canAskAgain,
  };
}

export async function ensureMediaLibraryPermission(): Promise<PermissionResult> {
  const current = await ImagePicker.getMediaLibraryPermissionsAsync();

  if (current.granted) {
    return { granted: true, canAskAgain: current.canAskAgain };
  }

  if (!current.canAskAgain) {
    return { granted: false, canAskAgain: false };
  }

  const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();

  return {
    granted: requested.granted,
    canAskAgain: requested.canAskAgain,
  };
}

export async function getNotificationPermissionStatus(): Promise<Notifications.PermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

export async function requestNotificationPermission(): Promise<PermissionResult> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Peek",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const current = await Notifications.getPermissionsAsync();

  if (current.granted) {
    return { granted: true, canAskAgain: current.canAskAgain };
  }

  if (!current.canAskAgain) {
    return { granted: false, canAskAgain: false };
  }

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  return {
    granted: requested.granted,
    canAskAgain: requested.canAskAgain,
  };
}

export type PermissionLabel = "Permitido" | "Negado" | "Pendente";

export interface AppPermissionSnapshot {
  camera: PermissionLabel;
  location: PermissionLabel;
  notifications: PermissionLabel;
  mediaLibrary: PermissionLabel;
}

function mapPermissionStatus(granted: boolean, canAskAgain: boolean): PermissionLabel {
  if (granted) return "Permitido";
  if (!canAskAgain) return "Negado";
  return "Pendente";
}

export async function getAppPermissionSnapshot(): Promise<AppPermissionSnapshot> {
  const [camera, location, notifications, mediaLibrary] = await Promise.all([
    Camera.getCameraPermissionsAsync(),
    Location.getForegroundPermissionsAsync(),
    Notifications.getPermissionsAsync(),
    ImagePicker.getMediaLibraryPermissionsAsync(),
  ]);

  return {
    camera: mapPermissionStatus(camera.granted, camera.canAskAgain),
    location: mapPermissionStatus(
      location.status === Location.PermissionStatus.GRANTED,
      location.canAskAgain
    ),
    notifications: mapPermissionStatus(
      notifications.granted,
      notifications.canAskAgain
    ),
    mediaLibrary: mapPermissionStatus(
      mediaLibrary.granted,
      mediaLibrary.canAskAgain
    ),
  };
}
