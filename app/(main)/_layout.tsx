import { Redirect, Stack } from "expo-router";
import { LoadingView } from "@/components/ui/LoadingView";
import { useAuth } from "@/hooks/useAuth";
import { LOGIN_ROUTE } from "@/lib/routes";

export default function MainLayout() {
  const { canAccessApp, loading } = useAuth();

  if (loading) {
    return <LoadingView />;
  }

  if (!canAccessApp) {
    return <Redirect href={LOGIN_ROUTE} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
      <Stack.Screen name="result" />
      <Stack.Screen name="details" />
      <Stack.Screen name="evaluation" />
    </Stack>
  );
}
