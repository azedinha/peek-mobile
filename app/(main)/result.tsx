import { useEffect, useRef, useState } from "react";

import { View, Text, StyleSheet, ScrollView } from "react-native";

import { useRouter } from "expo-router";

import { SafeAreaView } from "react-native-safe-area-context";

import { StackScreenChrome } from "@/components/navigation/StackScreenChrome";

import { ScreenHeader } from "@/components/ui/ScreenHeader";

import { Logo } from "@/components/Logo";

import { Button } from "@/components/ui/Button";

import { LoadingView } from "@/components/ui/LoadingView";

import { ResultSummaryView } from "@/components/result/ResultViews";
import { useAuth } from "@/hooks/useAuth";

import { runAnalysisForSession } from "@/lib/analyze-session";
import { AnalyzeApiError, getAnalyzeApiDiagnostics } from "@/lib/api";

import {

  CAMERA_ROUTE,

  DETAILS_ROUTE,

  HOME_ROUTE,

} from "@/lib/routes";

import { theme } from "@/constants/theme";

import { getCaptureSession, getAnalysisResult, saveAnalysisResult } from "@/lib/session";

import { addHistoryEntry } from "@/lib/history";
import { registerPendingEvaluationIfEligible } from "@/lib/evaluation-pending";

import type { PeekAnalysisResult } from "@/types/peek";



type PageState = "loading" | "error" | "ready";



export default function ResultScreen() {

  const router = useRouter();

  const { user } = useAuth();

  const [state, setState] = useState<PageState>("loading");

  const [result, setResult] = useState<PeekAnalysisResult | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [errorDebug, setErrorDebug] = useState<string | null>(null);

  const fetchedRef = useRef(false);



  const handleBack = () => {

    if (router.canGoBack()) {

      router.back();

      return;

    }

    router.replace(HOME_ROUTE);

  };



  useEffect(() => {

    if (fetchedRef.current) return;

    fetchedRef.current = true;



    (async () => {

      const session = await getCaptureSession();

      if (!session) {

        router.replace(HOME_ROUTE);

        return;

      }



      const cached = await getAnalysisResult();

      if (cached && cached.capturedAt === session.capturedAt) {

        setResult(cached);

        setState("ready");

        if (user) {

          await registerPendingEvaluationIfEligible(session, cached);

        }

        return;

      }



      try {

        const data = await runAnalysisForSession(session);

        await saveAnalysisResult(data);

        await addHistoryEntry(session, data);

        if (user) {

          await registerPendingEvaluationIfEligible(session, data);

        }

        setResult(data);

        setState("ready");

      } catch (err) {

        const message =

          err instanceof Error

            ? err.message

            : "Falha na análise. Tente novamente.";

        const rawDetail =
          err instanceof AnalyzeApiError && err.rawErrorDetail
            ? err.rawErrorDetail
            : err instanceof Error
              ? `[${err.name}] ${err.message}${err.stack ? `\n${err.stack}` : ""}`
              : String(err);

        const diagnostics = getAnalyzeApiDiagnostics();

        setError(message);

        setErrorDebug(
          [
            "— Diagnóstico (temporário) —",
            "",
            "Erro original:",
            rawDetail,
            "",
            `config.apiUrl: ${diagnostics.apiUrl}`,
            `isApiConfigured(): ${String(diagnostics.isApiConfigured)}`,
            `POST /api/analyze: ${diagnostics.analyzeUrl}`,
          ].join("\n")
        );

        setState("error");

      }

    })();

  }, [router, user]);



  if (state === "loading") {

    return (

      <SafeAreaView style={styles.safe} edges={["top"]}>

        <StackScreenChrome onBack={handleBack} />

        <View style={styles.loadingContent}>

          <Logo size="md" />

          <Text style={styles.loadingText}>Analisando estabelecimento...</Text>

        </View>

      </SafeAreaView>

    );

  }



  if (state === "error") {

    return (

      <SafeAreaView style={styles.safe} edges={["top"]}>

        <StackScreenChrome onBack={handleBack} />

        <ScrollView
          contentContainerStyle={styles.centerContent}
          showsVerticalScrollIndicator={false}
        >

          <ScreenHeader eyebrow="Resultado" title="Análise indisponível" />

          <Text style={styles.errorText}>{error}</Text>

          {errorDebug ? (
            <Text selectable style={styles.debugText}>
              {errorDebug}
            </Text>
          ) : null}

          <Button fullWidth onPress={() => router.replace(CAMERA_ROUTE)}>

            Tentar novamente

          </Button>

          <Button variant="outline" fullWidth onPress={() => router.replace(HOME_ROUTE)}>

            Voltar ao início

          </Button>

        </ScrollView>

      </SafeAreaView>

    );

  }



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

        <ResultSummaryView result={result} />

        <Button fullWidth onPress={() => router.push(DETAILS_ROUTE)}>

          Ver detalhes

        </Button>

        <Button variant="outline" fullWidth onPress={() => router.replace(HOME_ROUTE)}>

          Voltar ao início

        </Button>

      </ScrollView>

    </SafeAreaView>

  );

}



const styles = StyleSheet.create({

  safe: {

    flex: 1,

    backgroundColor: theme.colors.background,

  },

  loadingContent: {

    flex: 1,

    alignItems: "center",

    justifyContent: "center",

    gap: theme.spacing.md,

    paddingHorizontal: theme.spacing.lg,

  },

  loadingText: {

    ...theme.typography.caption,

    textAlign: "center",

  },

  centerContent: {

    flexGrow: 1,

    justifyContent: "center",

    paddingHorizontal: theme.spacing.lg,

    paddingVertical: theme.spacing.lg,

    gap: theme.spacing.md,

  },

  scrollContent: {

    paddingHorizontal: theme.spacing.lg,

    paddingTop: theme.spacing.xs,

    paddingBottom: theme.spacing.xl,

    gap: theme.spacing.md,

  },

  errorText: {

    fontSize: 15,

    lineHeight: 22,

    color: theme.colors.error,

    textAlign: "center",

  },

  debugText: {

    fontSize: 11,

    lineHeight: 16,

    fontFamily: "Courier",

    color: theme.colors.textSecondary,

    textAlign: "left",

    backgroundColor: theme.colors.surface,

    borderRadius: theme.radius.md,

    padding: theme.spacing.sm,

  },

});


