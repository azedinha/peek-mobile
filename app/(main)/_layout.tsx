import { Redirect, Stack } from "expo-router";
import { LoadingView } from "@/components/ui/LoadingView";
import { useAuth } from "@/hooks/useAuth";

export default function MainLayout() {
  const { canAccessApp, loading } = useAuth();

  if (loading) {
    return <LoadingView />;
  }

  if (!canAccessApp) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    />
  );
}
