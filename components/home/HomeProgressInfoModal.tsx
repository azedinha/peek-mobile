import type { ReactNode } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  DAILY_UNIQUE_ESTABLISHMENT_LIMIT,
  PHOTO_SEARCH_COOLDOWN_DAYS,
  POINTS_GUIDE,
  PROGRESSION_LEVEL_THRESHOLDS,
} from "@/lib/progression-info";
import { theme } from "@/constants/theme";

export function HomeProgressInfoModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.sheetWrap} edges={["bottom"]}>
          <View style={styles.sheet}>
            <View style={styles.header}>
              <Text style={styles.title}>Como funciona a progressão</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fechar"
                onPress={onClose}
                hitSlop={8}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={theme.colors.textSecondary}
                />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}
            >
              <Section title="Como ganhar pontos">
                {POINTS_GUIDE.map((item) => (
                  <Bullet key={item.label}>
                    <Text style={styles.bulletText}>
                      {item.label}:{" "}
                      <Text style={styles.bulletStrong}>+{item.points} pts</Text>
                    </Text>
                  </Bullet>
                ))}
              </Section>

              <Section title="Como subir de nível">
                <Text style={styles.paragraph}>
                  Seu nível é calculado automaticamente pelo total de pontos
                  acumulados.
                </Text>
                {PROGRESSION_LEVEL_THRESHOLDS.map((level) => (
                  <View key={level.label} style={styles.levelRow}>
                    <Text style={styles.levelName}>{level.label}</Text>
                    <Text style={styles.levelPoints}>
                      {level.points.toLocaleString("pt-BR")} pts
                    </Text>
                  </View>
                ))}
              </Section>

              <Section title="Limite diário">
                <Bullet>
                  <Text style={styles.bulletText}>
                    Máximo de{" "}
                    <Text style={styles.bulletStrong}>
                      {DAILY_UNIQUE_ESTABLISHMENT_LIMIT} estabelecimentos únicos
                    </Text>{" "}
                    pontuados por dia.
                  </Text>
                </Bullet>
                <Bullet>
                  <Text style={styles.bulletText}>
                    Pesquisar o mesmo local várias vezes não consome vagas
                    extras.
                  </Text>
                </Bullet>
                <Bullet>
                  <Text style={styles.bulletText}>
                    Pesquisa por foto no mesmo lugar só pontua novamente após{" "}
                    {PHOTO_SEARCH_COOLDOWN_DAYS} dias.
                  </Text>
                </Bullet>
              </Section>

              <Section title="Sistema de avaliação">
                <Bullet>
                  <Text style={styles.bulletText}>
                    Após uma consulta recente, você pode avaliar sua experiência
                    ao voltar para a Home.
                  </Text>
                </Bullet>
                <Bullet>
                  <Text style={styles.bulletText}>
                    Pesquisa por foto: avaliação direta após os detalhes.
                  </Text>
                </Bullet>
                <Bullet>
                  <Text style={styles.bulletText}>
                    Pesquisa por nome: primeiro confirme se já visitou o local.
                  </Text>
                </Bullet>
                <Bullet>
                  <Text style={styles.bulletText}>
                    Cada estabelecimento pode ser avaliado apenas uma vez por
                    usuário.
                  </Text>
                </Bullet>
                <Bullet>
                  <Text style={styles.bulletText}>
                    Consultas abertas pelo histórico não disparam avaliação.
                  </Text>
                </Bullet>
              </Section>
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Bullet({ children }: { children: ReactNode }) {
  return <View style={styles.bullet}>{children}</View>;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  sheetWrap: {
    maxHeight: "88%",
  },
  sheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    paddingTop: theme.spacing.md,
    maxHeight: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  title: {
    ...theme.typography.title,
    fontSize: 20,
    lineHeight: 26,
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.primary,
    letterSpacing: -0.2,
  },
  paragraph: {
    ...theme.typography.caption,
    fontSize: 14,
    lineHeight: 20,
  },
  bullet: {
    paddingLeft: theme.spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.border,
  },
  bulletText: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.primary,
  },
  bulletStrong: {
    fontWeight: "600",
  },
  levelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  levelName: {
    fontSize: 14,
    color: theme.colors.primary,
  },
  levelPoints: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
});
