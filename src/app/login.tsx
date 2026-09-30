import { AppIcon } from "@/components/app-icon";
import { BrandLogo } from "@/components/brand-logo";
import { AppText, AppTextInput } from "@/components/app-text";
import { getDemoUser, setDemoUser } from "@/data/demo-session";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { C, Header, Page, Surface } from "@/components/app-ui";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function finishDemoLogin(nextEmail?: string) {
    const prior = getDemoUser();
    setDemoUser({
      ...prior,
      email: nextEmail || email.trim() || prior.email,
      firstName: prior.firstName || (email.split("@")[0] || "Samira"),
    });
    router.replace("/home");
  }

  function login() {
    if (!email.trim() || !password) {
      setMessage("Saisis un e-mail et un mot de passe de démonstration.");
      return;
    }
    finishDemoLogin();
  }

  function socialLogin(provider: "Facebook" | "Apple") {
    // Les boutons illustrent le parcours, sans authentification externe.
    finishDemoLogin(getDemoUser().email || `${provider.toLowerCase()}@amivoy.demo`);
  }

  return (
    <Page>
      <Header back title="Connexion" />
      <View style={st.travelMotif} accessibilityElementsHidden>
        <View style={st.routeIcon}>
          <AppIcon name="map" size={17} color={C.green} />
        </View>
        <View style={st.routeDots}>
          <View style={st.routeDot} />
          <View style={st.routeDot} />
          <View style={st.routeDot} />
        </View>
        <View style={[st.routeIcon, st.routeIconAccent]}>
          <AppIcon name="pin" size={18} color={C.ink} />
        </View>
        <View style={st.routeDots}>
          <View style={st.routeDot} />
          <View style={st.routeDot} />
          <View style={st.routeDot} />
        </View>
        <View style={st.routeIcon}>
          <AppIcon name="group" size={18} color={C.green} />
        </View>
      </View>
      <AppText style={st.routeCaption}>DÉCOUVRIR · SE RETROUVER · REVIVRE</AppText>
      <BrandLogo style={st.brand} />
      <AppText style={st.title}>Ravie de te retrouver.</AppText>
      <AppText style={st.subtitle}>
        Tes voyages et sorties reprennent ici.
      </AppText>

      <Surface style={st.form}>
        <AppText style={st.label}>ADRESSE E-MAIL</AppText>
        <AppTextInput
          style={st.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="toi@exemple.com"
        />
        <AppText style={st.label}>MOT DE PASSE</AppText>
        <AppTextInput
          style={st.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Mot de passe de démo"
        />
        <Pressable
          onPress={() =>
            setMessage(
              "Réinitialisation simulée : aucun e-mail ne sera envoyé dans cette démo.",
            )
          }
          style={st.forgot}
        >
          <AppText style={st.link}>Mot de passe oublié ?</AppText>
        </Pressable>
        <Pressable onPress={login} style={st.submit}>
          <AppText style={st.submitText}>Se connecter</AppText>
          <AppIcon name="arrow" size={17} color="#FFFFFF" />
        </Pressable>
      </Surface>

      {!!message && <AppText style={st.message}>{message}</AppText>}
      <View style={st.divider}>
        <View style={st.dividerLine} />
        <AppText style={st.or}>OU CONTINUER AVEC</AppText>
        <View style={st.dividerLine} />
      </View>
      <View style={st.socialRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continuer avec Facebook (démo)"
          onPress={() => socialLogin("Facebook")}
          style={({ pressed }) => [st.socialOption, pressed && st.socialPressed]}
        >
          <View style={st.socialIconCircle}>
            <AppText style={st.facebookIcon}>f</AppText>
          </View>
          <AppText style={st.socialLabel}>Facebook</AppText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continuer avec e-mail"
          onPress={login}
          style={({ pressed }) => [st.socialOption, pressed && st.socialPressed]}
        >
          <View style={st.socialIconCircle}>
            <AppIcon name="mail" size={20} color={C.ink} />
          </View>
          <AppText style={st.socialLabel}>E-mail</AppText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continuer avec Apple (démo)"
          onPress={() => socialLogin("Apple")}
          style={({ pressed }) => [st.socialOption, pressed && st.socialPressed]}
        >
          <View style={st.socialIconCircle}>
            <AppIcon name="apple" size={20} color={C.ink} />
          </View>
          <AppText style={st.socialLabel}>Apple</AppText>
        </Pressable>
      </View>
      <AppText style={st.demoNote}>
        Démonstration : Facebook et Apple ne sont pas connectés à leurs services.
      </AppText>
      <Pressable onPress={() => router.push("/onboarding")}>
        <AppText style={st.signup}>
          Pas encore de profil ?{" "}
          <AppText style={st.link}>Créer un profil démo</AppText>
        </AppText>
      </Pressable>
    </Page>
  );
}

const st = StyleSheet.create({
  travelMotif: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    marginBottom: 5,
  },
  routeIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF1E9",
  },
  routeIconAccent: { backgroundColor: C.lime, transform: [{ rotate: "-5deg" }] },
  routeDots: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7 },
  routeDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: "#A5B29D" },
  routeCaption: {
    textAlign: "center",
    color: C.muted,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginBottom: 10,
  },
  brand: { alignSelf: "center", marginBottom: 7 },
  title: {
    color: C.ink,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "900",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 2,
  },
  form: {
    gap: 8,
    padding: 16,
    borderRadius: 20,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
  },
  label: {
    fontSize: 9,
    fontWeight: "900",
    color: C.muted,
    letterSpacing: 1,
    marginTop: 2,
  },
  input: {
    height: 46,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: "#FCFBF7",
    paddingHorizontal: 13,
    color: C.ink,
    fontSize: 11,
  },
  forgot: { alignSelf: "flex-end", paddingVertical: 3 },
  link: { color: C.green, fontWeight: "800", fontSize: 11 },
  submit: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: C.green,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 3,
    shadowColor: "#133B2C",
    shadowOpacity: 0.17,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  submitText: { fontSize: 13, color: "#FFFFFF", fontWeight: "800" },
  message: { color: C.green, fontSize: 11, fontWeight: "700" },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 2,
    marginBottom: 1,
  },
  dividerLine: { height: 1, flex: 1, backgroundColor: C.line },
  or: {
    textAlign: "center",
    color: C.muted,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  socialRow: { flexDirection: "row", justifyContent: "center", gap: 26, paddingVertical: 2 },
  socialOption: { alignItems: "center", justifyContent: "center", gap: 6, minWidth: 58, paddingVertical: 3 },
  socialPressed: { opacity: 0.68, transform: [{ scale: 0.96 }] },
  socialIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#133B2C",
    shadowOpacity: 0.08,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  facebookIcon: { fontSize: 22, lineHeight: 25, color: "#1877F2", fontWeight: "900" },
  socialLabel: { fontSize: 9, color: C.muted, fontWeight: "700" },
  demoNote: { textAlign: "center", fontSize: 9, lineHeight: 14, color: C.muted },
  signup: { textAlign: "center", color: C.muted, fontSize: 11, padding: 9 },
});
