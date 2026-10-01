import { AppText } from "@/components/app-text";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Switch, TextInput, View } from "react-native";
import { fetchNotificationPreferences, saveNotificationPreferences } from "@/actions/tripActions";
import { C, Header, Page, SectionTitle, Surface, s } from "@/components/app-ui";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { tripsService } from "@/services/tripsService";
import type { DeviceTokenRecord } from "@/interface/trips";

const notificationChannels = [
  { key: "push_enabled", label: "Notifications push" },
  { key: "email_enabled", label: "Notifications par e-mail" },
  { key: "sms_enabled", label: "Notifications par SMS" },
] as const;

export default function Settings() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { notificationPreferences, requestStatus, error } = useAppSelector((state) => state.trips);
  const preference = notificationPreferences.find((item) => item.user_id === user?.id);
  const [language, setLanguage] = useState("Français");
  const [plan, setPlan] = useState("Gratuit");
  const [notice, setNotice] = useState("");
  const [tokens, setTokens] = useState<DeviceTokenRecord[]>([]);
  const [deviceToken, setDeviceToken] = useState("");
  const [platform, setPlatform] = useState("android");
  const [editingToken, setEditingToken] = useState<DeviceTokenRecord | null>(null);
  const [tokenError, setTokenError] = useState("");
  const [preferenceDetail, setPreferenceDetail] = useState("");

  useEffect(() => {
    void dispatch(fetchNotificationPreferences());
    void tripsService.fetchDeviceTokens().then(setTokens).catch(() => setTokenError("Les appareils associés n’ont pas pu être chargés."));
  }, [dispatch]);

  async function inspectPreference() {
    if (!preference) { setPreferenceDetail("Aucune préférence personnalisée n’est enregistrée."); return; }
    try { const detail = await tripsService.fetchNotificationPreference(preference.id); setPreferenceDetail(`Préférences de ${detail.user_id} · silence ${detail.quiet_from ?? "non défini"}–${detail.quiet_to ?? "non défini"}`); }
    catch { setPreferenceDetail("Le détail des préférences n’a pas pu être chargé."); }
  }
  function deletePreference() {
    if (!preference) return;
    Alert.alert("Réinitialiser les préférences ?", "Les valeurs par défaut seront appliquées.", [{ text: "Annuler", style: "cancel" }, { text: "Réinitialiser", style: "destructive", onPress: () => { void tripsService.deleteNotificationPreference(preference.id).then(() => dispatch(fetchNotificationPreferences())).then(() => setPreferenceDetail("Préférences réinitialisées.")).catch(() => setPreferenceDetail("Les préférences n’ont pas pu être réinitialisées.")); } }]);
  }

  async function saveChannel(key: (typeof notificationChannels)[number]["key"], value: boolean) {
    if (!user) return;
    try {
      await dispatch(saveNotificationPreferences({
        user_id: user.id,
        push_enabled: key === "push_enabled" ? value : preference?.push_enabled ?? true,
        email_enabled: key === "email_enabled" ? value : preference?.email_enabled ?? true,
        sms_enabled: key === "sms_enabled" ? value : preference?.sms_enabled ?? false,
        per_type_settings: preference?.per_type_settings ?? {},
        quiet_from: preference?.quiet_from,
        quiet_to: preference?.quiet_to,
      })).unwrap();
      setNotice("Préférences de notification enregistrées.");
    } catch {
      return;
    }
  }

  async function saveDeviceToken() {
    if (!user || !deviceToken.trim()) { setTokenError("Saisis un jeton FCM/APNs fourni par ton appareil."); return; }
    try {
      const result = editingToken
        ? await tripsService.updateDeviceToken(editingToken.id, { platform, fcm_apns_token: deviceToken.trim(), last_seen_at: new Date().toISOString() })
        : await tripsService.createDeviceToken({ user_id: user.id, platform, fcm_apns_token: deviceToken.trim(), last_seen_at: new Date().toISOString() });
      setTokens((xs) => editingToken ? xs.map((x) => x.id === result.id ? result : x) : [result, ...xs]); setEditingToken(null); setDeviceToken(""); setTokenError("");
    } catch { setTokenError("Le jeton n’a pas été enregistré. Vérifie qu’il est valide et qu’il n’est pas déjà lié à un autre appareil."); }
  }
  async function editDeviceToken(item: DeviceTokenRecord) {
    try { const detail = await tripsService.fetchDeviceToken(item.id); setEditingToken(detail); setPlatform(detail.platform); setDeviceToken(""); setTokenError(""); }
    catch { setTokenError("Le détail de cet appareil n’a pas pu être chargé."); }
  }
  function deleteDeviceToken(item: DeviceTokenRecord) {
    Alert.alert("Dissocier cet appareil ?", "Il ne recevra plus les notifications push associées à ce jeton.", [{ text: "Annuler", style: "cancel" }, { text: "Dissocier", style: "destructive", onPress: () => { void tripsService.deleteDeviceToken(item.id).then(() => setTokens((xs) => xs.filter((x) => x.id !== item.id))).catch(() => setTokenError("Cet appareil n’a pas pu être dissocié.")); } }]);
  }

  return (
    <Page>
      <Header back title="Réglages" />
      <AppText style={s.heroTitle}>Ton espace, à ta façon.</AppText>
      <AppText style={s.heroSub}>
        Préférences de notifications enregistrées sur ton compte.
      </AppText>
      <SectionTitle title="Compte et sécurité" />
      <Surface style={st.card}>
        {[
          ["Mon compte", "Nom, e-mail et pays", "/account"],
          ["Sécurité du compte", "Mot de passe, double authentification et sessions", "/security"],
          ["Gérer la sécurité", "Options de connexion du compte", "/security"],
        ].map(([name, sub, path]) => (
          <Pressable
            key={name}
            style={st.row}
            onPress={() => router.push(path as "/account" | "/security")}
          >
            <View style={{ flex: 1 }}>
              <AppText style={st.title}>{name}</AppText>
              <AppText style={st.sub}>{sub}</AppText>
            </View>
            <AppText style={st.arrow}>›</AppText>
          </Pressable>
        ))}
      </Surface>
      <SectionTitle title="Notifications et confidentialité" />
      <Surface style={st.card}>
        {notificationChannels.map(({ key, label }) => (
          <View key={key} style={st.row}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <AppText style={st.title}>{label}</AppText>
              <AppText style={st.sub}>{preference ? "Préférence du compte" : "Valeur par défaut jusqu’au premier changement"}</AppText>
            </View>
            <Switch
              value={preference ? preference[key] : key !== "sms_enabled"}
              onValueChange={(value) => void saveChannel(key, value)}
              disabled={requestStatus === "loading"}
              trackColor={{ true: C.green, false: "#D7DDD4" }}
            />
          </View>
        ))}
        <View style={st.row}><Pressable onPress={() => void inspectPreference()}><AppText style={st.link}>Détails du serveur</AppText></Pressable>{!!preference && <Pressable onPress={deletePreference}><AppText style={st.error}>Réinitialiser</AppText></Pressable>}</View>
        {!!preferenceDetail && <AppText style={st.sub}>{preferenceDetail}</AppText>}
        {!!error && <AppText style={st.error}>{error}</AppText>}
      </Surface>
      <SectionTitle title="Outils et synchronisation" />
      <Pressable onPress={() => router.push("/admin-tools")}><Surface style={st.row}><View style={{ flex: 1 }}><AppText style={st.title}>File de synchronisation et outils de gestion</AppText><AppText style={st.sub}>Journal serveur; catalogue et modération selon ton rôle</AppText></View><AppText style={st.arrow}>›</AppText></Surface></Pressable>
      <SectionTitle title="Appareils pour les notifications push" />
      <Surface style={st.card}>
        <AppText style={st.sub}>Associe un jeton FCM/APNs valide fourni par l’application de notification de ton appareil.</AppText>
        <View style={st.row}><Pressable onPress={() => setPlatform("android")}><AppText style={[st.choice, platform === "android" && st.choiceOn]}>Android</AppText></Pressable><Pressable onPress={() => setPlatform("ios")}><AppText style={[st.choice, platform === "ios" && st.choiceOn]}>iOS</AppText></Pressable></View>
        <TextInput value={deviceToken} onChangeText={setDeviceToken} placeholder="Jeton FCM/APNs" multiline autoCapitalize="none" style={st.tokenInput} />
        <Pressable onPress={() => void saveDeviceToken()} style={st.tokenButton}><AppText style={st.tokenButtonText}>{editingToken ? "Mettre à jour l’appareil" : "Associer cet appareil"}</AppText></Pressable>
        {editingToken && <Pressable onPress={() => { setEditingToken(null); setDeviceToken(""); }}><AppText style={st.link}>Annuler la modification</AppText></Pressable>}
        {tokens.map((item) => <View key={item.id} style={st.row}><View style={{ flex: 1 }}><AppText style={st.title}>{item.platform} · {item.id.slice(0, 8)}…</AppText><AppText style={st.sub}>{item.last_seen_at ? `Vu ${new Date(item.last_seen_at).toLocaleDateString()}` : "Dernière activité inconnue"}</AppText></View><Pressable onPress={() => void editDeviceToken(item)}><AppText style={st.link}>Modifier</AppText></Pressable><Pressable onPress={() => deleteDeviceToken(item)}><AppText style={st.error}>Retirer</AppText></Pressable></View>)}
        {!!tokenError && <AppText accessibilityRole="alert" style={st.error}>{tokenError}</AppText>}
      </Surface>
      <SectionTitle title="Langue et devise" />
      <Surface style={st.card}>
        <View style={st.row}>
          <AppText style={st.title}>Langue</AppText>
          <View style={st.inline}>
            {["Français", "English"].map((x) => (
              <Pressable key={x} onPress={() => setLanguage(x)}>
                <AppText style={[st.choice, language === x && st.choiceOn]}>
                  {x}
                </AppText>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={st.row}>
          <AppText style={st.title}>Devise de l’application</AppText>
          <AppText style={[st.choice, st.choiceOn]}>XOF · FCFA</AppText>
        </View>
      </Surface>
      <SectionTitle title="Abonnement" />
      <Surface style={st.row}>
        <View style={{ flex: 1 }}>
          <AppText style={st.title}>Amivoy {plan}</AppText>
          <AppText style={st.sub}>Fonctionnalités premium simulées</AppText>
        </View>
        <Pressable
          onPress={() => setPlan(plan === "Gratuit" ? "Plus" : "Gratuit")}
        >
          <AppText style={st.link}>
            {plan === "Gratuit" ? "Découvrir Plus" : "Revenir à Gratuit"} →
          </AppText>
        </Pressable>
      </Surface>
      <SectionTitle title="Aide et données" />
      <Surface style={st.card}>
        {[
          ["Centre d’aide", "Questions fréquentes"],
          ["Signaler un problème", "Formulaire de démonstration"],
          ["Exporter mes données", "Aperçu local"],
          ["À propos", "Amivoy · version démo"],
        ].map(([title, sub]) => (
          <Pressable
            key={title}
            onPress={() => setNotice(`${title} · aperçu de démonstration, aucune donnée externe n’est utilisée.`)}
            style={st.row}
          >
            <View style={{ flex: 1 }}>
              <AppText style={st.title}>{title}</AppText>
              <AppText style={st.sub}>{sub}</AppText>
            </View>
            <AppText style={st.arrow}>›</AppText>
          </Pressable>
        ))}
      </Surface>
      {!!notice && <AppText style={st.notice}>{notice}</AppText>}
      <AppText style={st.note}>
        Ces préférences indiquent les canaux autorisés; l’envoi effectif dépend de la configuration des services de notification.
      </AppText>
    </Page>
  );
}
const st = StyleSheet.create({
  card: { gap: 0, paddingVertical: 2 },
  row: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  title: { fontSize: 12, fontWeight: "800", color: C.ink },
  sub: { fontSize: 10, color: C.muted, marginTop: 3 },
  arrow: { color: C.green, fontSize: 19 },
  inline: { flexDirection: "row", gap: 5, flexWrap: "wrap" },
  choice: {
    fontSize: 9,
    paddingHorizontal: 7,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#F1F4EB",
    color: C.muted,
  },
  choiceOn: { backgroundColor: C.green, color: C.white, fontWeight: "900" },
  link: { fontSize: 10, color: C.green, fontWeight: "900" },
  notice: { color: C.green, fontSize: 11, fontWeight: "800", paddingVertical: 8 },
  note: { fontSize: 10, color: C.muted, lineHeight: 15, textAlign: "center" },
  error: { color: "#A7493C", fontSize: 10, fontWeight: "800" },
  tokenInput: { minHeight: 60, borderWidth: 1, borderColor: C.line, backgroundColor: C.white, borderRadius: 10, padding: 10, color: C.ink, fontSize: 10 },
  tokenButton: { minHeight: 42, borderRadius: 10, backgroundColor: C.green, alignItems: "center", justifyContent: "center" },
  tokenButtonText: { color: C.white, fontSize: 10, fontWeight: "900" },
});
