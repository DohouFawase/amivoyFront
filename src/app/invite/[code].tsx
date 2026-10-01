import { AppText } from "@/components/app-text";
import { C, Header, Page, Surface } from "@/components/app-ui";
import { useAppSelector } from "@/hooks/redux";
import { groupsService } from "@/services/groupsService";
import type { InvitationRecord } from "@/interface/groups";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

export default function OpenInvitation() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { user, isBootstrapping } = useAppSelector((state) => state.auth);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<InvitationRecord | null>(null);

  function openAuth(path: "/login" | "/register") {
    router.push({ pathname: path, params: { inviteCode: code } } as never);
  }

  async function respond(status: "accepted" | "declined") {
    if (!code || busy) return;
    setBusy(true);
    setError("");
    try {
      const invitation = await groupsService.respondToInvitation({ code, status });
      setResult(invitation);
    } catch {
      setError("Ce lien est invalide, expiré ou déjà utilisé. Vérifie que tu es connecté avec l’adresse qui a reçu l’invitation.");
    } finally {
      setBusy(false);
    }
  }

  function continueToGroup() {
    if (result?.outing_id) router.replace({ pathname: "/outing/[id]", params: { id: result.outing_id } } as never);
    else if (result?.trip_id) router.replace({ pathname: "/trip/[id]", params: { id: result.trip_id } } as never);
    else router.replace("/circles");
  }

  if (isBootstrapping) {
    return <Page><Header back title="Invitation" /><ActivityIndicator color={C.green} /></Page>;
  }

  return <Page>
    <Header back title="Invitation Amivoy" />
    <View style={styles.hero}><AppText style={styles.emoji}>✉️</AppText><AppText style={styles.title}>{result ? (result.statusCode === "accepted" ? "Tu as rejoint le groupe." : "Réponse enregistrée.") : "Tu es invité·e à rejoindre un groupe."}</AppText><AppText style={styles.subtitle}>{result?.destination ? `Invitation pour ${result.destination}.` : "Réponds à cette invitation pour retrouver tes proches sur Amivoy."}</AppText></View>
    {!!error && <AppText accessibilityRole="alert" style={styles.error}>{error}</AppText>}
    {result ? <Surface style={styles.card}><AppText style={styles.success}>{result.status}</AppText><Pressable onPress={continueToGroup} style={styles.primary}><AppText style={styles.primaryText}>Continuer</AppText></Pressable></Surface> : !user ? <Surface style={styles.card}><AppText style={styles.body}>Connecte-toi avec l’adresse qui a reçu le courriel, ou crée un compte avec cette adresse pour répondre.</AppText><Pressable onPress={() => openAuth("/login")} style={styles.primary}><AppText style={styles.primaryText}>Se connecter</AppText></Pressable><Pressable onPress={() => openAuth("/register")} style={styles.secondary}><AppText style={styles.secondaryText}>Créer un compte</AppText></Pressable></Surface> : <Surface style={styles.card}><AppText style={styles.body}>Choisis si tu souhaites rejoindre ce groupe.</AppText><Pressable disabled={busy} onPress={() => void respond("accepted")} style={[styles.primary, busy && styles.disabled]}><AppText style={styles.primaryText}>{busy ? "Enregistrement…" : "Accepter l’invitation"}</AppText></Pressable><Pressable disabled={busy} onPress={() => void respond("declined")} style={styles.secondary}><AppText style={styles.secondaryText}>Refuser</AppText></Pressable></Surface>}
  </Page>;
}

const styles = StyleSheet.create({ hero: { alignItems: "center", gap: 12, paddingVertical: 24 }, emoji: { fontSize: 42 }, title: { color: C.ink, fontSize: 24, fontWeight: "900", textAlign: "center" }, subtitle: { color: C.muted, fontSize: 12, textAlign: "center", lineHeight: 18 }, card: { gap: 12 }, body: { color: C.ink, fontSize: 12, lineHeight: 19 }, primary: { minHeight: 48, borderRadius: 13, backgroundColor: C.green, alignItems: "center", justifyContent: "center", paddingHorizontal: 15 }, primaryText: { color: C.white, fontSize: 12, fontWeight: "900" }, secondary: { minHeight: 44, borderRadius: 12, backgroundColor: "#EDF2E8", alignItems: "center", justifyContent: "center", paddingHorizontal: 15 }, secondaryText: { color: C.green, fontSize: 11, fontWeight: "900" }, success: { textAlign: "center", color: C.green, fontWeight: "900" }, error: { color: "#A7493C", fontSize: 11, lineHeight: 17 }, disabled: { opacity: 0.6 } });
