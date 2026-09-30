import { AppText, AppTextInput } from "@/components/app-text";
import { C, Header, Page, SectionTitle, Surface, s } from "@/components/app-ui";
import { getDemoUser, setDemoUser } from "@/data/demo-session";
import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";

export default function Account() {
  const initial = getDemoUser();
  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [email, setEmail] = useState(initial.email);
  const [country, setCountry] = useState(initial.country);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  function save() {
    if (!firstName.trim() || !email.includes("@")) {
      setError("Renseigne un prénom et une adresse e-mail valide.");
      setNotice("");
      return;
    }
    setDemoUser({ ...getDemoUser(), firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), country: country.trim() || "Bénin" });
    setError("");
    setNotice("Tes informations ont été mises à jour dans la session de démonstration ✓");
  }

  return <Page>
    <Header back title="Mon compte" />
    <AppText style={s.heroTitle}>Tes informations personnelles.</AppText>
    <AppText style={s.heroSub}>Modifie les informations de ton profil Amivoy.</AppText>
    <SectionTitle title="Profil" />
    <Surface style={st.form}>
      <AppText style={st.label}>PRÉNOM</AppText><AppTextInput value={firstName} onChangeText={setFirstName} autoCapitalize="words" style={st.input} placeholder="Ton prénom" />
      <AppText style={st.label}>NOM</AppText><AppTextInput value={lastName} onChangeText={setLastName} autoCapitalize="words" style={st.input} placeholder="Ton nom" />
      <AppText style={st.label}>E-MAIL</AppText><AppTextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={st.input} placeholder="toi@exemple.com" />
      <AppText style={st.label}>PAYS</AppText><AppTextInput value={country} onChangeText={setCountry} style={st.input} placeholder="Ton pays" />
    </Surface>
    {!!error && <AppText style={st.error}>{error}</AppText>}
    {!!notice && <AppText style={st.notice}>{notice}</AppText>}
    <Pressable onPress={save} style={s.button}><AppText style={s.buttonText}>Enregistrer les modifications</AppText></Pressable>
    <AppText style={st.note}>Mode démo · ces informations restent dans la session locale et ne sont pas envoyées.</AppText>
  </Page>;
}

const st = StyleSheet.create({ form: { gap: 9 }, label: { fontSize: 10, color: C.muted, fontWeight: "900", letterSpacing: 1, marginTop: 5 }, input: { minHeight: 46, borderRadius: 13, borderWidth: 1, borderColor: C.line, backgroundColor: C.white, paddingHorizontal: 13, color: C.ink }, error: { color: "#A7493C", fontSize: 11, fontWeight: "700" }, notice: { color: C.green, fontSize: 11, fontWeight: "800" }, note: { color: C.muted, fontSize: 9, lineHeight: 14, textAlign: "center" } });
