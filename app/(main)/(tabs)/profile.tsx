import { useCallback, useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { ProfileActionRow, ProfileDivider } from "@/components/profile/ProfileActionRow";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { getPrivacyPolicyUrl, getTermsOfUseUrl } from "@/lib/config";
import {
  getDisplayFullName,
  getUserAvatarUrl,
  getUserEmailLabel,
} from "@/lib/user-display";
import { LOGIN_ROUTE } from "@/lib/routes";
import { theme } from "@/constants/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, devBypass, signOut } = useAuth();
  const isGuest = devBypass && !user;
  const [signingOut, setSigningOut] = useState(false);

  const name = getDisplayFullName(user, { isGuest });
  const email = getUserEmailLabel(user, { isGuest });
  const avatarUrl = isGuest ? null : getUserAvatarUrl(user);

  const openExternalUrl = useCallback(async (url: string | null, label: string) => {
    if (!url) {
      Alert.alert(label, "Link indisponível no momento.");
      return;
    }

    try {
      await WebBrowser.openBrowserAsync(url);
    } catch {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        return;
      }

      Alert.alert(label, "Não foi possível abrir o link.");
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    if (signingOut) return;

    setSigningOut(true);

    try {
      await signOut();
      router.replace(LOGIN_ROUTE);
    } catch {
      Alert.alert("Sair", "Não foi possível encerrar a sessão. Tente novamente.");
    } finally {
      setSigningOut(false);
    }
  }, [router, signOut, signingOut]);

  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader eyebrow="Perfil" title="Sua conta" />

        <ProfileHeader name={name} email={email} avatarUrl={avatarUrl} />

        <ProfileSection title="Conta">
          <ProfileActionRow label="Nome" value={name} showChevron={false} />
          <ProfileDivider />
          <ProfileActionRow label="E-mail" value={email} showChevron={false} />
        </ProfileSection>

        <ProfileSection title="Privacidade">
          <ProfileActionRow
            label="Política de Privacidade"
            onPress={() =>
              openExternalUrl(getPrivacyPolicyUrl(), "Política de Privacidade")
            }
          />
          <ProfileDivider />
          <ProfileActionRow
            label="Termos de Uso"
            onPress={() => openExternalUrl(getTermsOfUseUrl(), "Termos de Uso")}
          />
        </ProfileSection>

        <ProfileSection title="Sobre o Peek">
          <ProfileActionRow
            label="Versão"
            value={appVersion}
            showChevron={false}
          />
          <ProfileDivider />
          <ProfileActionRow
            label="Descrição"
            value="Identifique estabelecimentos e consulte reputação em um só lugar."
            showChevron={false}
          />
        </ProfileSection>

        <Button
          variant="outline"
          fullWidth
          loading={signingOut}
          onPress={handleSignOut}
        >
          Sair da conta
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
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
});
