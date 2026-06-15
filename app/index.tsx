import { Redirect } from "expo-router";
import { LoadingView } from "@/components/ui/LoadingView";
import { useAuth } from "@/hooks/useAuth";
import { HOME_ROUTE, LOGIN_ROUTE } from "@/lib/routes";

export default function Index() {
  const { canAccessApp, loading } = useAuth();

  if (loading) {
    return <LoadingView />;
  }

  if (canAccessApp) {
    return <Redirect href={HOME_ROUTE} />;
  }

  return <Redirect href={LOGIN_ROUTE} />;
}
