import "react-native-gesture-handler";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/hooks/useAuth";
import { theme } from "@/constants/theme";
import { configureNotifications } from "@/lib/permissions";

export default function RootLayout() {
  useEffect(() => {
    configureNotifications();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background },
            animation: "fade",
          }}
        />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
