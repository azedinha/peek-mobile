import { useCallback } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ProfileActionRow, ProfileDivider } from "@/components/profile/ProfileActionRow";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { Button } from "@/components/ui/Button";
import { useLinkedProviders } from "@/hooks/useLinkedProviders";
import {
  findIdentityForProvider,
  getIdentityEmailLabel,
  PEEK_OAUTH_PROVIDERS,
  PROVIDER_LABELS,
  type PeekOAuthProvider,
} from "@/lib/auth-providers";
import { theme } from "@/constants/theme";

const PROVIDER_ICONS: Record<
  PeekOAuthProvider,
  keyof typeof Ionicons.glyphMap
> = {
  google: "logo-google",
  apple: "logo-apple",
};

export function LinkedProvidersSection() {
  const {
    identities,
    loading,
    busyProvider,
    canUnlink,
    linkProvider,
    unlinkProvider,
    isProviderLinked,
  } = useLinkedProviders();

  const handleLink = useCallback(
    async (provider: PeekOAuthProvider) => {
      try {
        await linkProvider(provider);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Não foi possível vincular este método de login.";
        Alert.alert(PROVIDER_LABELS[provider], message);
      }
    },
    [linkProvider]
  );

  const handleUnlink = useCallback(
    (provider: PeekOAuthProvider) => {
      const label = PROVIDER_LABELS[provider];

      Alert.alert(
        `Desvincular ${label}`,
        `Você não poderá mais entrar com ${label} nesta conta.`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Desvincular",
            style: "destructive",
            onPress: () => {
              void (async () => {
                try {
                  await unlinkProvider(provider);
                } catch (error) {
                  const message =
                    error instanceof Error
                      ? error.message
                      : "Não foi possível desvincular este método de login.";
                  Alert.alert(label, message);
                }
              })();
            },
          },
        ]
      );
    },
    [unlinkProvider]
  );

  return (
    <ProfileSection title="Métodos de login">
      {PEEK_OAUTH_PROVIDERS.map((provider, index) => {
        const linked = isProviderLinked(provider);
        const identity = findIdentityForProvider(identities, provider);
        const email = identity ? getIdentityEmailLabel(identity) : null;
        const isBusy = busyProvider === provider;

        return (
          <View key={provider}>
            {index > 0 ? <ProfileDivider /> : null}

            <View style={styles.providerBlock}>
              <View style={styles.providerHeader}>
                <View style={styles.providerTitleRow}>
                  <Ionicons
                    name={PROVIDER_ICONS[provider]}
                    size={18}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.providerTitle}>
                    {PROVIDER_LABELS[provider]}
                  </Text>
                </View>
                <Text style={styles.providerStatus}>
                  {loading ? "Carregando..." : linked ? "Conectado" : "Não conectado"}
                </Text>
              </View>

              {linked && email ? (
                <Text style={styles.providerEmail}>{email}</Text>
              ) : null}

              {linked ? (
                <Button
                  variant="outline"
                  fullWidth
                  disabled={!canUnlink || isBusy || loading}
                  loading={isBusy}
                  onPress={() => handleUnlink(provider)}
                >
                  {`Desvincular ${PROVIDER_LABELS[provider]}`}
                </Button>
              ) : (
                <Button
                  fullWidth
                  disabled={isBusy || loading}
                  loading={isBusy}
                  onPress={() => void handleLink(provider)}
                >
                  {`Vincular ${PROVIDER_LABELS[provider]}`}
                </Button>
              )}
            </View>
          </View>
        );
      })}

      {!canUnlink ? (
        <Text style={styles.hint}>
          Mantenha pelo menos um método de login ativo na conta.
        </Text>
      ) : null}
    </ProfileSection>
  );
}

const styles = StyleSheet.create({
  providerBlock: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  providerHeader: {
    gap: 4,
  },
  providerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  providerTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.primary,
  },
  providerStatus: {
    ...theme.typography.caption,
  },
  providerEmail: {
    ...theme.typography.caption,
    lineHeight: 18,
  },
  hint: {
    ...theme.typography.caption,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    lineHeight: 18,
  },
});
