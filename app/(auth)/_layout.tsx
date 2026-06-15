import { Redirect, Stack } from "expo-router";
import { LoadingView } from "@/components/ui/LoadingView";
import { useAuth } from "@/hooks/useAuth";
import { HOME_ROUTE } from "@/lib/routes";

export default function AuthLayout() {
  const { canAccessApp, loading } = useAuth();

  if (loading) {
    return <LoadingView />;
  }

  if (canAccessApp) {
    return <Redirect href={HOME_ROUTE} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    />
  );
}
