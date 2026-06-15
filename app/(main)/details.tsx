import { useEffect, useState } from "react";

import { StyleSheet, ScrollView, View } from "react-native";

import { useRouter } from "expo-router";

import { SafeAreaView } from "react-native-safe-area-context";

import { StackScreenChrome } from "@/components/navigation/StackScreenChrome";

import { ScreenHeader } from "@/components/ui/ScreenHeader";

import { Button } from "@/components/ui/Button";

import { LoadingView } from "@/components/ui/LoadingView";

import { DetailsSections } from "@/components/details/DetailsSections";

import { CAMERA_ROUTE, HOME_ROUTE } from "@/lib/routes";

import { theme } from "@/constants/theme";

import { markDetailsCompletedForEvaluation } from "@/lib/evaluation-pending";

import { getAnalysisResult } from "@/lib/session";

import type { PeekAnalysisResult } from "@/types/peek";



export default function DetailsScreen() {

  const router = useRouter();

  const [result, setResult] = useState<PeekAnalysisResult | null>(null);



  const handleBack = async () => {

    await markDetailsCompletedForEvaluation();

    if (router.canGoBack()) {

      router.back();

      return;

    }

    router.replace(HOME_ROUTE);

  };



  useEffect(() => {

    (async () => {

      const stored = await getAnalysisResult();

      if (!stored) {

        router.replace(HOME_ROUTE);

        return;

      }

      setResult(stored);

    })();

  }, [router]);



  if (!result) {

    return <LoadingView />;

  }



  return (

    <SafeAreaView style={styles.safe} edges={["top"]}>

      <StackScreenChrome onBack={handleBack} />

      <ScrollView

        contentContainerStyle={styles.scrollContent}

        showsVerticalScrollIndicator={false}

      >

        <ScreenHeader

          eyebrow="Detalhes"

          title={result.establishment.name}

          subtitle={result.establishment.category?.toUpperCase()}

        />

        <DetailsSections result={result} />

      </ScrollView>



      <View style={styles.footer}>

        <Button fullWidth onPress={() => router.replace(CAMERA_ROUTE)}>

          Nova consulta

        </Button>

      </View>

    </SafeAreaView>

  );

}



const styles = StyleSheet.create({

  safe: {

    flex: 1,

    backgroundColor: theme.colors.background,

  },

  scrollContent: {

    paddingHorizontal: theme.spacing.lg,

    paddingTop: theme.spacing.xs,

    paddingBottom: theme.spacing.lg,

    gap: theme.spacing.md,

  },

  footer: {

    paddingHorizontal: theme.spacing.lg,

    paddingTop: theme.spacing.sm,

    paddingBottom: theme.spacing.md,

    borderTopWidth: 1,

    borderTopColor: theme.colors.border,

    backgroundColor: theme.colors.background,

  },

});


