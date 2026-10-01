import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Switch, View } from "react-native";
import {
  changePassword,
  disableTwoFactor,
  enableTwoFactor,
  fetchSessions,
  revokeOtherSessions,
  verifyTwoFactorEnable,
} from "@/actions/authActions";
import { AppIcon } from "@/components/app-icon";
import { AppText } from "@/components/app-text";
import { AuthInput } from "@/components/auth-input";
import { C, Header, Page, SectionTitle, Surface, s } from "@/components/app-ui";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { changePasswordSchema } from "@/schemas/authSchemas";

export default function Security() {
  const dispatch = useAppDispatch();
  const { user, sessions, error, notice, requestStatus } = useAppSelector((state) => state.auth);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [awaitingTwoFactorCode, setAwaitingTwoFactorCode] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    void dispatch(fetchSessions());
  }, [dispatch]);

  async function toggleTwoFactor(enabled: boolean) {
    setLocalError("");
    if (!currentPassword) {
      setLocalError("Saisis ton mot de passe actuel pour modifier la 2FA.");
      return;
    }

    try {
      if (enabled) {
        await dispatch(enableTwoFactor({ current_password: currentPassword })).unwrap();
        setAwaitingTwoFactorCode(true);
      } else {
        await dispatch(disableTwoFactor({ current_password: currentPassword })).unwrap();
        setCurrentPassword("");
      }
    } catch {
      return;
    }
  }

  async function confirmTwoFactor() {
    setLocalError("");
    if (!/^\d{6}$/.test(twoFactorCode)) {
      setLocalError("Le code doit contenir 6 chiffres.");
      return;
    }

    try {
      await dispatch(verifyTwoFactorEnable(twoFactorCode)).unwrap();
      setAwaitingTwoFactorCode(false);
      setTwoFactorCode("");
      setCurrentPassword("");
    } catch {
      return;
    }
  }

  async function submitPasswordChange() {
    setLocalError("");
    const validation = changePasswordSchema.safeParse({
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: confirmPassword,
    });

    if (!validation.success) {
      setLocalError(validation.error.issues[0]?.message ?? "Vérifie les champs.");
      return;
    }

    try {
      await dispatch(changePassword(validation.data)).unwrap();
      router.replace("/login");
    } catch {
      return;
    }
  }

  async function closeOtherSessions() {
    setLocalError("");
    try {
      await dispatch(revokeOtherSessions()).unwrap();
      await dispatch(fetchSessions());
    } catch {
      return;
    }
  }

  return (
    <Page>
      <Header back title="Sécurité" />
      <AppText style={s.heroTitle}>Protège ton compte.</AppText>
      <AppText style={s.heroSub}>Les changements sont appliqués à ton compte Amivoy.</AppText>

      <SectionTitle title="Double authentification" />
      <Surface style={styles.row}>
        <View style={styles.icon}><AppIcon name="shield" size={21} /></View>
        <View style={{ flex: 1, gap: 3 }}>
          <AppText style={styles.title}>Code de vérification</AppText>
          <AppText style={styles.sub}>{user?.two_factor_enabled ? "Activée · code requis à la connexion" : "Désactivée · ajoute une étape de protection"}</AppText>
        </View>
        <Switch value={user?.two_factor_enabled ?? false} onValueChange={(value) => void toggleTwoFactor(value)} trackColor={{ true: C.green }} />
      </Surface>
      <AuthInput label="MOT DE PASSE ACTUEL" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry placeholder="Confirme ton identité" />
      {awaitingTwoFactorCode && (
        <Surface style={styles.form}>
          <AppText style={styles.sub}>Saisis le code envoyé à ton adresse e-mail pour activer la 2FA.</AppText>
          <AuthInput label="CODE À 6 CHIFFRES" value={twoFactorCode} onChangeText={setTwoFactorCode} keyboardType="number-pad" maxLength={6} placeholder="000000" />
          <Pressable onPress={() => void confirmTwoFactor()} disabled={requestStatus === "loading"} style={styles.secondary}>
            <AppText style={styles.secondaryText}>Confirmer l’activation</AppText>
          </Pressable>
        </Surface>
      )}

      <SectionTitle title="Changer le mot de passe" />
      <Surface style={styles.form}>
        <AuthInput label="NOUVEAU MOT DE PASSE" value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="8 caractères minimum" />
        <AuthInput label="CONFIRMER LE MOT DE PASSE" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholder="Répète le nouveau mot de passe" />
        <Pressable onPress={() => void submitPasswordChange()} disabled={requestStatus === "loading"} style={styles.secondary}>
          <AppText style={styles.secondaryText}>Mettre à jour le mot de passe</AppText>
        </Pressable>
        <AppText style={styles.sub}>Après le changement, la session sera fermée et tu devras te reconnecter.</AppText>
      </Surface>

      <SectionTitle title="Sessions ouvertes" />
      {sessions.map((session) => (
        <Surface key={session.id} style={styles.row}>
          <View style={styles.icon}><AppIcon name="phone" size={20} /></View>
          <View style={{ flex: 1, gap: 3 }}>
            <AppText style={styles.title}>{session.device_name || "Appareil inconnu"}</AppText>
            <AppText style={styles.sub}>{session.ip_address || "Adresse IP inconnue"}</AppText>
            <AppText style={styles.sub}>Expire le {session.expires_at ? new Date(session.expires_at).toLocaleString() : "non précisé"}</AppText>
          </View>
        </Surface>
      ))}
      {sessions.length === 0 && requestStatus !== "loading" && <AppText style={styles.sub}>Aucune session active renvoyée par le serveur.</AppText>}
      <Pressable onPress={() => void closeOtherSessions()} disabled={requestStatus === "loading"} style={styles.sessionButton}>
        <AppText style={styles.sessionText}>Fermer les autres sessions</AppText>
      </Pressable>
      {!!(localError || error) && <AppText style={styles.error}>{localError || error}</AppText>}
      {!!notice && <AppText style={styles.notice}>{notice}</AppText>}
    </Page>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 11 },
  icon: { width: 40, height: 40, borderRadius: 14, backgroundColor: "#EDF2E8", alignItems: "center", justifyContent: "center" },
  title: { color: C.ink, fontSize: 12, fontWeight: "900" },
  sub: { color: C.muted, fontSize: 10, lineHeight: 14 },
  form: { gap: 9 },
  secondary: { minHeight: 44, borderRadius: 12, backgroundColor: C.green, alignItems: "center", justifyContent: "center", padding: 10 },
  secondaryText: { color: C.white, fontSize: 11, fontWeight: "900" },
  sessionButton: { alignSelf: "flex-start", paddingVertical: 10 },
  sessionText: { color: C.green, fontSize: 11, fontWeight: "900" },
  error: { color: "#A7493C", fontSize: 11, fontWeight: "700" },
  notice: { color: C.green, fontSize: 11, fontWeight: "800" },
});
