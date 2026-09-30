import { AppText } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { C, Header, Page, SectionTitle, Surface } from "@/components/app-ui";
import { useState } from "react";
import { Pressable, StyleSheet, Switch, View } from "react-native";
import { router } from "expo-router";

type SafetyState = "idle" | "safe" | "help";

export default function Safety() {
  const [sharing, setSharing] = useState(false);
  const [checkin, setCheckin] = useState(true);
  const [state, setState] = useState<SafetyState>("idle");
  const [alert, setAlert] = useState(false);

  return (
    <Page>
      <Header back title="Sécurité du voyage" />
      <AppText style={st.heading}>Voyage serein, ensemble.</AppText>
      <AppText style={st.sub}>Parcours de démonstration : aucune position réelle n’est lue et aucun message d’urgence n’est envoyé.</AppText>
      <Pressable onPress={() => router.push("/circles")}>
        <Surface style={st.banner}>
          <AppIcon name="shield" size={26} />
          <View style={{ flex: 1 }}><AppText style={st.title}>Tes contacts de confiance</AppText><AppText style={st.sub}>Voir et créer ton cercle d’amis</AppText></View>
          <AppText style={st.arrow}>›</AppText>
        </Surface>
      </Pressable>
      <SectionTitle title="Pendant le voyage" />
      <Surface style={st.card}>
        <View style={st.row}><View style={{ flex: 1 }}><AppText style={st.title}>Partager ma position</AppText><AppText style={st.sub}>Active les scénarios de suivi simulés</AppText></View><Switch value={sharing} onValueChange={(value) => { setSharing(value); setState("idle"); }} trackColor={{ true: C.green }} /></View>
        <View style={st.row}><View style={{ flex: 1 }}><AppText style={st.title}>Pointage quotidien</AppText><AppText style={st.sub}>Rappel de démonstration pour rassurer le groupe</AppText></View><Switch value={checkin} onValueChange={setCheckin} trackColor={{ true: C.green }} /></View>
      </Surface>
      <SectionTitle title="Simulation d’écart de trajet" />
      <Surface style={st.scenario}>
        <View style={st.scenarioHead}><AppIcon name="pin" size={22} /><View style={{ flex: 1 }}><AppText style={st.title}>Tu t’es éloigné·e du groupe ?</AppText><AppText style={st.sub}>{sharing ? "Point de trajet fictif · Cotonou" : "Active le partage simulé pour essayer ce parcours."}</AppText></View></View>
        <Pressable disabled={!sharing} onPress={() => { setState("idle"); setAlert(true); }} style={[st.outlineButton, !sharing && st.disabled]}><AppText style={st.outlineText}>Simuler un écart de trajet</AppText></Pressable>
        {!!alert && <View style={st.prompt}><AppText style={st.promptTitle}>Tout va bien ?</AppText><AppText style={st.sub}>Le groupe attend ton pointage. Choisis une réponse pour voir ce qui se passerait.</AppText><View style={st.actions}><Pressable onPress={() => { setState("safe"); setAlert(false); }} style={st.safeButton}><AppText style={st.safeText}>Tout va bien</AppText></Pressable><Pressable onPress={() => { setState("help"); setAlert(false); }} style={st.helpButton}><AppText style={st.helpText}>Je suis perdu·e</AppText></Pressable></View></View>}
        {state === "safe" && <AppText style={st.success}>Pointage enregistré · le groupe est rassuré ✓</AppText>}
        {state === "help" && <View style={st.helpNotice}><AppText style={st.helpText}>Demande d’aide simulée</AppText><AppText style={st.sub}>Dans la vraie application, il faudrait confirmer la position et prévenir les contacts choisis. Rien n’a été envoyé ici.</AppText></View>}
        {!sharing && <AppText style={st.hint}>Active le bouton « Partager ma position » pour débloquer la simulation.</AppText>}
      </Surface>
      <SectionTitle title="Point de rendez-vous" />
      <Surface style={st.row}><AppIcon name="pin" size={22} /><View style={{ flex: 1 }}><AppText style={st.title}>Place de l’Étoile</AppText><AppText style={st.sub}>Lieu de rencontre de démonstration</AppText></View><AppText style={st.arrow}>›</AppText></Surface>
      <SectionTitle title="Besoin d’aide ?" />
      <Surface style={st.help}><AppText style={st.title}>Numéros utiles du voyage</AppText><AppText style={st.sub}>Ambassade · contact d’urgence du groupe · services locaux</AppText><AppText style={st.note}>Vérifie les numéros officiels de ta destination avant le départ. Cette maquette n’appelle aucun service.</AppText></Surface>
      <Pressable style={st.sos} onPress={() => { setAlert(false); setState("help"); }}><AppText style={st.sosText}>{state === "help" ? "Demande d’aide simulée ✓" : "Déclencher une alerte de test"}</AppText></Pressable>
      <AppText style={st.foot}>Le partage de position, les alertes et les pointages restent fictifs et locaux.</AppText>
    </Page>
  );
}

const st = StyleSheet.create({
  heading: { fontSize: 27, fontWeight: "900", color: C.ink },
  sub: { fontSize: 11, color: C.muted, lineHeight: 16 },
  banner: { flexDirection: "row", gap: 12, alignItems: "center", backgroundColor: "#EDF3E8" },
  title: { fontSize: 12, fontWeight: "900", color: C.ink },
  card: { gap: 0 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13, borderBottomWidth: 1, borderColor: C.line, flex: 1 },
  arrow: { fontSize: 20, color: C.green },
  scenario: { gap: 12 }, scenarioHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  outlineButton: { minHeight: 44, borderWidth: 1, borderColor: C.green, borderRadius: 13, alignItems: "center", justifyContent: "center", paddingHorizontal: 12 },
  outlineText: { color: C.green, fontSize: 11, fontWeight: "900" }, disabled: { opacity: 0.4 },
  prompt: { gap: 9, borderRadius: 14, backgroundColor: "#F4F2E8", padding: 13 }, promptTitle: { color: C.ink, fontSize: 14, fontWeight: "900" },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, safeButton: { flex: 1, minWidth: 120, alignItems: "center", padding: 11, borderRadius: 11, backgroundColor: C.green }, safeText: { color: C.white, fontSize: 10, fontWeight: "900" },
  helpButton: { flex: 1, minWidth: 120, alignItems: "center", padding: 11, borderRadius: 11, backgroundColor: "#A7493C" }, helpText: { color: "#A7493C", fontSize: 10, fontWeight: "900" },
  success: { color: C.green, fontSize: 11, fontWeight: "900" }, helpNotice: { gap: 6, backgroundColor: "#F9EAE6", padding: 12, borderRadius: 12 },
  hint: { fontSize: 10, lineHeight: 15, color: C.muted }, help: { gap: 8, backgroundColor: "#F1F3EC" }, note: { fontSize: 10, color: C.muted, lineHeight: 15 },
  sos: { minHeight: 52, backgroundColor: "#A7493C", borderRadius: 16, alignItems: "center", justifyContent: "center", paddingHorizontal: 12 }, sosText: { color: C.white, fontWeight: "900", fontSize: 12 },
  foot: { fontSize: 9, color: C.muted, lineHeight: 14, textAlign: "center" },
});
