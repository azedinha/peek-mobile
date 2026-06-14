import { Redirect } from "expo-router";
import { LoadingView } from "@/components/ui/LoadingView";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const { canAccessApp, loading } = useAuth();

  if (loading) {
    return <LoadingView />;
  }

  if (canAccessApp) {
    return <Redirect href="/(main)/camera" />;
  }

  return <Redirect href="/(auth)/login" />;
}
