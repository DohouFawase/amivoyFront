import { AppText } from "@/components/app-text";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Switch, View } from "react-native";
import { C, Header, Page, SectionTitle, Surface, s } from "@/components/app-ui";
const initial = [
  ["Notifications de voyage", true],
  ["Activité du groupe", true],
  ["Rappels et échéances", false],
  ["Partager ma position pendant un voyage", false],
] as const;
export default function Settings() {
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(initial),
  );
  const [language, setLanguage] = useState("Français");
  const [plan, setPlan] = useState("Gratuit");
  const [notice, setNotice] = useState("");
  const flip = (key: string, value: boolean) =>
    setToggles((old) => ({ ...old, [key]: value }));
  return (
    <Page>
      <Header back title="Réglages" />
      <AppText style={s.heroTitle}>Ton espace, à ta façon.</AppText>
      <AppText style={s.heroSub}>
        Préférences de démonstration, enregistrées pendant cette session.
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
        {initial.map(([name]) => (
          <View key={name} style={st.row}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <AppText style={st.title}>{name}</AppText>
              <AppText style={st.sub}>Préférence locale de démonstration</AppText>
            </View>
            <Switch
              value={toggles[name]}
              onValueChange={(value) => flip(name, value)}
              trackColor={{ true: C.green, false: "#D7DDD4" }}
            />
          </View>
        ))}
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
            <AppText style={st.arrow}>{toggles[title] ? "✓" : "›"}</AppText>
          </Pressable>
        ))}
      </Surface>
      {!!notice && <AppText style={st.notice}>{notice}</AppText>}
      <AppText style={st.note}>
        Ces réglages n’envoient ni données ni notifications. Ils servent à
        présenter les écrans de l’application.
      </AppText>
      <Pressable onPress={() => router.replace("/onboarding")} style={s.button}>
        <AppText style={s.buttonText}>Revoir l’accueil guidé</AppText>
      </Pressable>
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
});
