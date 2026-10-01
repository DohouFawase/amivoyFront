import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, Pressable, Share, StyleSheet, View } from "react-native";
import {
  addOutingContribution,
  addOutingPhoto,
  checkInToOuting,
  createInvitation,
  fetchOuting,
  finishOuting,
  respondToOuting,
  startOuting,
  toggleOutingPhotoStory,
} from "@/actions/groupActions";
import { AppIcon } from "@/components/app-icon";
import { AppText, AppTextInput } from "@/components/app-text";
import { AuthInput } from "@/components/auth-input";
import { C, Header, Page, SectionTitle, Surface } from "@/components/app-ui";
import MapSurface from "@/components/map-surface";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { groupsService } from "@/services/groupsService";
import type { OutingPhotoRecord, OutingRecord } from "@/interface/groups";

export default function OutingDetail() {
  const params = useLocalSearchParams<{ id: string; inviteUrl?: string; inviteError?: string }>();
  const { id } = params;
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { outings, activeOuting, error, notice, requestStatus } = useAppSelector((state) => state.groups);
  const outing: OutingRecord | null = activeOuting?.id === id
    ? activeOuting
    : outings.find((item) => item.id === id) ?? null;
  const [caption, setCaption] = useState("");
  const [contributionAmount, setContributionAmount] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteUrl, setInviteUrl] = useState(typeof params.inviteUrl === "string" ? params.inviteUrl : "");
  const [localError, setLocalError] = useState(typeof params.inviteError === "string" ? params.inviteError : "");

  useEffect(() => {
    void dispatch(fetchOuting(id));
  }, [dispatch, id]);

  const myName = user?.first_name ?? "";
  const isOrganizer = outing !== null && user?.id === outing.creator_id;
  const isAttending = outing?.attending.includes(myName) ?? false;
  const hasCheckedIn = outing?.checkedIn.includes(myName) ?? false;
  const contributed = outing?.contributions.reduce((sum, item) => sum + item.amount, 0) ?? 0;
  const participantNames = [...new Set([...(outing?.guests ?? []), ...(outing?.attending ?? [])])];
  const sharePerPerson = outing?.budgetTarget && participantNames.length > 0
    ? Math.ceil(outing.budgetTarget / participantNames.length)
    : 0;

  async function sendInvitation() {
    setLocalError("");
    if (!outing || !inviteEmail.trim().includes("@")) {
      setLocalError("Saisis une adresse e-mail valide.");
      return;
    }

    try {
      const invitation = await dispatch(createInvitation({
        outing_id: outing.id,
        channel: "email",
        target: inviteEmail.trim(),
      })).unwrap();
      setInviteUrl(invitation.invite_url ?? "");
      if (invitation.email_sent === false) setLocalError("Invitation créée, mais le courriel n’a pas pu être envoyé. Partage le lien ci-dessous.");
      setInviteEmail("");
      if (invitation.invite_url) {
        try {
          await Share.share({ message: invitation.invite_url });
        } catch {
          setLocalError(`Invitation créée. Partage ce lien : ${invitation.invite_url}`);
        }
      }
    } catch {
      return;
    }
  }

  async function shareInvitation() {
    if (!inviteUrl) return;
    try {
      await Share.share({ message: inviteUrl });
    } catch {
      setLocalError(`Copie ce lien pour le partager : ${inviteUrl}`);
    }
  }

  async function toggleAttendance() {
    if (!outing) return;
    setLocalError("");
    try {
      await dispatch(respondToOuting({ id: outing.id, attending: !isAttending })).unwrap();
    } catch {
      return;
    }
  }

  async function checkIn() {
    if (!outing) return;
    setLocalError("");
    try {
      await dispatch(checkInToOuting({ id: outing.id })).unwrap();
    } catch {
      return;
    }
  }

  async function addContribution() {
    if (!outing) return;
    const amount = Number(contributionAmount);
    if (!Number.isInteger(amount) || amount < 1) {
      setLocalError("Entre un montant entier supérieur à zéro.");
      return;
    }

    setLocalError("");
    try {
      await dispatch(addOutingContribution({ id: outing.id, amount })).unwrap();
      setContributionAmount("");
    } catch {
      return;
    }
  }

  function deleteCurrentOuting() {
    if (!outing || !isOrganizer) return;
    Alert.alert("Supprimer cette sortie ?", `« ${outing.title} » sera supprimée.`, [{ text: "Annuler", style: "cancel" }, { text: "Supprimer", style: "destructive", onPress: () => { void groupsService.deleteOuting(outing.id).then(() => router.replace("/outings")).catch(() => setLocalError("La sortie n’a pas pu être supprimée.")); } }]);
  }

  async function capturePhoto(source: "camera" | "library") {
    if (!outing) return;
    setLocalError("");
    if (source === "camera") {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setLocalError("Autorise l’accès à la caméra pour prendre une photo.");
        return;
      }
    }

    const result = source === "camera"
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.85 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.85 });

    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > 20 * 1024 * 1024) {
      setLocalError("La photo doit faire 20 Mo maximum.");
      return;
    }

    try {
      await dispatch(addOutingPhoto({ id: outing.id, asset, caption: caption.trim() })).unwrap();
      setCaption("");
    } catch {
      return;
    }
  }

  async function toggleStory(photo: OutingPhotoRecord) {
    if (!outing) return;
    setLocalError("");
    try {
      await dispatch(toggleOutingPhotoStory({ id: outing.id, photoId: photo.id })).unwrap();
    } catch {
      return;
    }
  }

  async function changeLifecycle(action: "start" | "finish") {
    if (!outing) return;
    setLocalError("");
    try {
      if (action === "start") {
        await dispatch(startOuting({ id: outing.id })).unwrap();
      } else {
        await dispatch(finishOuting({ id: outing.id })).unwrap();
      }
    } catch {
      return;
    }
  }

  if (!outing) {
    return (
      <Page>
        <Header back title="Sortie" />
        {requestStatus === "loading"
          ? <AppText style={styles.sub}>Chargement de la sortie…</AppText>
          : <AppText style={styles.title}>{error || "Cette sortie est introuvable ou tu n’y as pas accès."}</AppText>}
      </Page>
    );
  }

  return (
    <Page>
      <Header back title="La sortie" right={<AppText style={styles.live}>{outing.ended ? "TERMINÉE" : outing.started ? "EN COURS" : "À VENIR"}</AppText>} />
      <Surface style={styles.hero}>
        <AppIcon name={outing.category === "Restaurant" ? "restaurant" : "outing"} size={27} />
        <AppText style={styles.title}>{outing.title}</AppText>
        <AppText style={styles.sub}>{outing.category} · {outing.date ?? "Date à confirmer"} · {outing.time ?? "Heure à confirmer"}</AppText>
        {!!outing.activity && <AppText style={styles.activity}>Au programme · {outing.activity}</AppText>}
      </Surface>

      <SectionTitle title="Rendez-vous" action={outing.circleName ?? undefined} />
      <Surface style={styles.meet}>
        {outing.locationType === "public" && outing.latitude !== null && outing.longitude !== null && (
          <View style={styles.map}>
            <MapSurface latitude={outing.latitude} longitude={outing.longitude} zoom={15} points={[{ id: outing.id, name: outing.place, latitude: outing.latitude, longitude: outing.longitude }]} />
          </View>
        )}
        <AppText style={styles.place}>{outing.place}</AppText>
        {!!outing.note && <AppText style={styles.sub}>{outing.note}</AppText>}
        {outing.locationType === "private" && <AppText style={styles.privateLabel}>ADRESSE PRIVÉE · PARTICIPANTS UNIQUEMENT</AppText>}
        <Pressable onPress={() => void checkIn()} disabled={hasCheckedIn || requestStatus === "loading"} style={[styles.secondaryButton, hasCheckedIn && styles.buttonDone]}>
          <AppText style={styles.secondaryText}>{hasCheckedIn ? "Arrivée confirmée ✓" : "Je suis arrivé·e"}</AppText>
        </Pressable>
      </Surface>

      <SectionTitle title="Participants" action={`${outing.attending.length} présent(s)`} />
      <Surface style={styles.panel}>
        {outing.guests.map((guest) => (
          <View key={guest} style={styles.memberRow}>
            <AppText style={styles.memberName}>{guest}</AppText>
            <AppText style={styles.memberStatus}>{outing.attending.includes(guest) ? "Présent·e ✓" : "À confirmer"}</AppText>
          </View>
        ))}
        <Pressable onPress={() => void toggleAttendance()} disabled={requestStatus === "loading"} style={styles.primaryButton}>
          <AppText style={styles.primaryText}>{isAttending ? "Je ne viens plus" : "Je confirme ma présence"}</AppText>
        </Pressable>
      </Surface>

      <Surface style={styles.panel}>
        <AppText style={styles.sectionTitle}>Inviter une autre personne</AppText>
        <AuthInput label="ADRESSE E-MAIL" value={inviteEmail} onChangeText={setInviteEmail} autoCapitalize="none" keyboardType="email-address" placeholder="ami@example.com" />
        <Pressable onPress={() => void sendInvitation()} disabled={requestStatus === "loading"} style={styles.secondaryButton}>
          <AppText style={styles.secondaryText}>Créer et partager le lien</AppText>
        </Pressable>
        {!!inviteUrl && <>
          <AppText style={styles.sub}>Lien d’invitation prêt à partager.</AppText>
          <Pressable onPress={() => void shareInvitation()} style={styles.storyButton}><AppText style={styles.storyText}>Partager le lien</AppText></Pressable>
        </>}
      </Surface>

      <SectionTitle title="Budget partagé" action={`${outing.contributions.length} cotisation(s)`} />
      <Surface style={styles.panel}>
        <View style={styles.budgetRow}>
          <View><AppText style={styles.eyebrow}>BUDGET PRÉVU</AppText><AppText style={styles.budget}>{(outing.budgetTarget ?? 0).toLocaleString("fr-FR")} {outing.currency}</AppText></View>
          <View><AppText style={styles.eyebrow}>DÉJÀ COTISÉ</AppText><AppText style={styles.budget}>{contributed.toLocaleString("fr-FR")} {outing.currency}</AppText></View>
        </View>
        {sharePerPerson > 0 && <AppText style={styles.sub}>Environ {sharePerPerson.toLocaleString("fr-FR")} {outing.currency} par participant.</AppText>}
        {outing.contributions.map((item) => <View key={item.id} style={styles.memberRow}><AppText style={styles.memberName}>{item.by}</AppText><AppText style={styles.memberStatus}>{item.amount.toLocaleString("fr-FR")} {outing.currency}</AppText></View>)}
        <View style={styles.contributionInput}>
          <AppTextInput value={contributionAmount} onChangeText={setContributionAmount} keyboardType="number-pad" placeholder="Montant en XOF" style={[styles.input, { flex: 1 }]} />
          <Pressable onPress={() => void addContribution()} disabled={requestStatus === "loading"} style={styles.secondaryButton}><AppText style={styles.secondaryText}>Cotiser</AppText></Pressable>
        </View>
        <AppText style={styles.disclaimer}>Suivi des montants uniquement; aucun paiement n’est débité.</AppText>
      </Surface>

      {isOrganizer && <Surface style={styles.panel}>
        <AppText style={styles.sectionTitle}>Organisation</AppText>
        <Pressable onPress={() => void changeLifecycle("start")} disabled={outing.started || requestStatus === "loading"} style={[styles.primaryButton, outing.started && styles.buttonDone]}>
          <AppText style={styles.primaryText}>{outing.started ? "Sortie commencée ✓" : "Lancer la sortie"}</AppText>
        </Pressable>
        <Pressable onPress={() => void changeLifecycle("finish")} disabled={outing.ended || requestStatus === "loading"} style={styles.finishButton}>
          <AppText style={styles.finishText}>{outing.ended ? "Sortie terminée ✓" : "Terminer la sortie"}</AppText>
        </Pressable>
      </Surface>}

      {isOrganizer && <Pressable onPress={deleteCurrentOuting} style={styles.deleteOuting}><AppText style={styles.deleteOutingText}>Supprimer cette sortie</AppText></Pressable>}
      <SectionTitle title={`Souvenirs · ${outing.photos.length}`} />
      <Surface style={styles.panel}>
        <AuthInput label="LÉGENDE" value={caption} onChangeText={setCaption} placeholder="Un mot sur ce souvenir" />
        <View style={styles.photoActions}>
          <Pressable onPress={() => void capturePhoto("camera")} style={styles.secondaryButton}><AppText style={styles.secondaryText}>Prendre une photo</AppText></Pressable>
          <Pressable onPress={() => void capturePhoto("library")} style={styles.secondaryButton}><AppText style={styles.secondaryText}>Choisir une photo</AppText></Pressable>
        </View>
        {outing.photos.map((photo) => (
          <View key={photo.id} style={styles.photoCard}>
            {!!photo.uri && <Image source={{ uri: photo.uri }} style={styles.photo} />}
            <AppText style={styles.memberName}>{photo.caption || "Souvenir de sortie"}</AppText>
            <AppText style={styles.sub}>{photo.by ?? "Un membre"} · {photo.createdAt ?? ""}</AppText>
            <Pressable onPress={() => void toggleStory(photo)} style={styles.storyButton}>
              <AppText style={styles.storyText}>{photo.sharedToStory ? "Retirer de la Story" : "Partager dans la Story"}</AppText>
            </Pressable>
          </View>
        ))}
      </Surface>

      {!!(localError || error) && <AppText style={styles.error}>{localError || error}</AppText>}
      {!!notice && <AppText style={styles.notice}>{notice}</AppText>}
    </Page>
  );
}

const styles = StyleSheet.create({
  live: { color: C.green, fontSize: 9, fontWeight: "900" },
  hero: { backgroundColor: C.green, gap: 8, alignItems: "flex-start" },
  title: { color: C.white, fontSize: 21, fontWeight: "900" },
  sub: { color: C.muted, fontSize: 10, lineHeight: 15 },
  activity: { color: C.white, fontSize: 11, fontWeight: "800" },
  meet: { gap: 10 },
  map: { height: 160, borderRadius: 12, overflow: "hidden", backgroundColor: "#DFEADF" },
  place: { color: C.ink, fontSize: 14, fontWeight: "900" },
  privateLabel: { color: C.green, fontSize: 8, fontWeight: "900" },
  panel: { gap: 10 },
  sectionTitle: { color: C.ink, fontSize: 12, fontWeight: "900" },
  memberRow: { minHeight: 38, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderColor: C.line },
  memberName: { color: C.ink, fontSize: 11, fontWeight: "800" },
  memberStatus: { color: C.green, fontSize: 10, fontWeight: "800" },
  primaryButton: { minHeight: 44, borderRadius: 11, backgroundColor: C.green, alignItems: "center", justifyContent: "center", paddingHorizontal: 12 },
  primaryText: { color: C.white, fontSize: 11, fontWeight: "900" },
  secondaryButton: { minHeight: 40, borderRadius: 10, backgroundColor: "#EDF2E8", alignItems: "center", justifyContent: "center", paddingHorizontal: 12 },
  secondaryText: { color: C.green, fontSize: 10, fontWeight: "900" },
  buttonDone: { opacity: 0.65 },
  budgetRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  eyebrow: { color: C.muted, fontSize: 8, fontWeight: "900" },
  budget: { color: C.green, fontSize: 15, fontWeight: "900", marginTop: 4 },
  contributionInput: { flexDirection: "row", gap: 8 },
  input: { minHeight: 42, borderWidth: 1, borderColor: C.line, borderRadius: 10, backgroundColor: C.white, color: C.ink, paddingHorizontal: 10 },
  disclaimer: { color: C.muted, fontSize: 9 },
  finishButton: { alignSelf: "flex-start", paddingVertical: 8 },
  finishText: { color: "#A7493C", fontSize: 10, fontWeight: "900" },
  photoActions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  photoCard: { gap: 6, paddingVertical: 8, borderTopWidth: 1, borderColor: C.line },
  deleteOuting: { minHeight: 42, alignItems: "center", justifyContent: "center", borderRadius: 11, backgroundColor: "#F8EAE5" }, deleteOutingText: { color: "#A7493C", fontSize: 10, fontWeight: "900" },
  photo: { width: "100%", aspectRatio: 1.6, borderRadius: 10, backgroundColor: "#EDF2E8" },
  storyButton: { alignSelf: "flex-start", paddingVertical: 7 },
  storyText: { color: C.green, fontSize: 10, fontWeight: "900" },
  error: { color: "#A7493C", fontSize: 11, fontWeight: "800" },
  notice: { color: C.green, fontSize: 11, fontWeight: "800" },
});
