import { AppText, AppTextInput } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { C, Header, Page, SectionTitle, Surface, s } from "@/components/app-ui";
import { getSecurityPreferences, updateSecurityPreferences } from "@/data/security-session";
import { useState } from "react";
import { Pressable, StyleSheet, Switch, View } from "react-native";

export default function Security() {
  const [preferences, setPreferences] = useState(getSecurityPreferences());
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  function toggleTwoFactor(enabled: boolean) {
    setPreferences(updateSecurityPreferences({ twoFactorEnabled: enabled }));
    setNotice(enabled ? "Double authentification activée pour la démo ✓" : "Double authentification désactivée pour la démo.");
  }
  function changePassword() {
    if (!currentPassword || newPassword.length < 8 || newPassword !== confirmPassword) {
      setError(!currentPassword ? "Saisis ton mot de passe actuel." : newPassword.length < 8 ? "Le nouveau mot de passe doit contenir au moins 8 caractères." : "Les deux nouveaux mots de passe ne correspondent pas.");
      setNotice("");
      return;
    }
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setError("");
    setNotice("Mot de passe modifié dans cette démo. Aucun mot de passe n’a été transmis ni enregistré.");
  }
  function closeOtherSessions() {
    setPreferences(updateSecurityPreferences({ otherSessionsClosed: true }));
    setNotice("Les autres sessions de démonstration ont été fermées ✓");
  }

  return <Page>
    <Header back title="Sécurité" />
    <AppText style={s.heroTitle}>Protège ton compte.</AppText>
    <AppText style={s.heroSub}>Options de sécurité simulées pour cette maquette.</AppText>
    <SectionTitle title="Double authentification" />
    <Surface style={st.row}>
      <View style={st.icon}><AppIcon name="shield" size={21} /></View>
      <View style={{ flex: 1, gap: 3 }}><AppText style={st.title}>Code de vérification</AppText><AppText style={st.sub}>{preferences.twoFactorEnabled ? "Activée · deuxième étape simulée" : "Désactivée · ajoute une étape de protection"}</AppText></View>
      <Switch value={preferences.twoFactorEnabled} onValueChange={toggleTwoFactor} trackColor={{ true: C.green }} />
    </Surface>
    <SectionTitle title="Changer le mot de passe" />
    <Surface style={st.form}>
      <AppTextInput value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry placeholder="Mot de passe actuel" style={st.input} />
      <AppTextInput value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="Nouveau mot de passe · 8 caractères min." style={st.input} />
      <AppTextInput value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholder="Confirmer le nouveau mot de passe" style={st.input} />
      <Pressable onPress={changePassword} style={st.secondary}><AppText style={st.secondaryText}>Mettre à jour le mot de passe</AppText></Pressable>
    </Surface>
    <SectionTitle title="Sessions ouvertes" />
    <Surface style={st.row}>
      <View style={st.icon}><AppIcon name="phone" size={20} /></View>
      <View style={{ flex: 1, gap: 3 }}><AppText style={st.title}>Cet appareil · session actuelle</AppText><AppText style={st.sub}>Activité locale à cette démo</AppText></View>
    </Surface>
    <Pressable onPress={closeOtherSessions} style={st.sessionButton}><AppText style={st.sessionText}>{preferences.otherSessionsClosed ? "Autres sessions fermées ✓" : "Fermer les autres sessions"}</AppText></Pressable>
    {!!error && <AppText style={st.error}>{error}</AppText>}
    {!!notice && <AppText style={st.notice}>{notice}</AppText>}
    <AppText style={st.note}>Aucun compte réel n’est modifié : la connexion et les sessions ne sont pas reliées à un serveur.</AppText>
  </Page>;
}

const st = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center", gap: 11 }, icon: { width: 40, height: 40, borderRadius: 14, backgroundColor: "#EDF2E8", alignItems: "center", justifyContent: "center" }, title: { color: C.ink, fontSize: 12, fontWeight: "900" }, sub: { color: C.muted, fontSize: 10, lineHeight: 14 }, form: { gap: 9 }, input: { height: 46, borderRadius: 13, borderWidth: 1, borderColor: C.line, backgroundColor: C.white, paddingHorizontal: 13, color: C.ink }, secondary: { minHeight: 44, borderRadius: 12, backgroundColor: C.green, alignItems: "center", justifyContent: "center", padding: 10 }, secondaryText: { color: C.white, fontSize: 11, fontWeight: "900" }, sessionButton: { alignSelf: "flex-start", paddingVertical: 10 }, sessionText: { color: C.green, fontSize: 11, fontWeight: "900" }, error: { color: "#A7493C", fontSize: 11, fontWeight: "700" }, notice: { color: C.green, fontSize: 11, fontWeight: "800" }, note: { color: C.muted, fontSize: 9, lineHeight: 14, textAlign: "center" } });
