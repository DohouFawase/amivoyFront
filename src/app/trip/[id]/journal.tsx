import * as ImagePicker from "expo-image-picker";
import { AppIcon } from "@/components/app-icon";
import { AppText, AppTextInput } from "@/components/app-text";
import { BottomBar, C, Header, Page, SectionTitle, Surface, s } from "@/components/app-ui";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, View } from "react-native";
import { tripsService } from "@/services/tripsService";
import type { TripJournalEntryRecord, TripPhotoRecord } from "@/interface/trips";

export default function Journal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [entries, setEntries] = useState<TripJournalEntryRecord[]>([]);
  const [photos, setPhotos] = useState<TripPhotoRecord[]>([]);
  const [photoCaption, setPhotoCaption] = useState("");
  const [editingPhoto, setEditingPhoto] = useState<TripPhotoRecord | null>(null);
  const [photoCaptionDraft, setPhotoCaptionDraft] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editPlace, setEditPlace] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [place, setPlace] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    Promise.all([tripsService.fetchJournalEntries(id), tripsService.fetchTripPhotos(id)])
      .then(([loadedEntries, loadedPhotos]) => { if (active) { setEntries(loadedEntries); setPhotos(loadedPhotos); setError(""); } })
      .catch(() => { if (active) setError("Le carnet n’a pas pu être chargé."); });
    return () => { active = false; };
  }, [id]);

  async function uploadTripPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.75 });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) { setError("La photo doit faire 10 Mo maximum."); return; }
    setBusy(true);
    try { const photo = await tripsService.createTripPhoto({ trip_id: id, image: asset, caption: photoCaption.trim() || undefined }); setPhotos((xs) => [photo, ...xs]); setPhotoCaption(""); setError(""); }
    catch { setError("La photo n’a pas pu être envoyée au carnet."); }
    finally { setBusy(false); }
  }

  async function editPhoto(photo: TripPhotoRecord) {
    setBusy(true);
    try { const detail = await tripsService.fetchTripPhoto(photo.id); setEditingPhoto(detail); setPhotoCaptionDraft(detail.caption ?? ""); setError(""); }
    catch { setError("Les informations de cette photo n’ont pas pu être chargées."); }
    finally { setBusy(false); }
  }
  async function savePhoto() {
    if (!editingPhoto || busy) return;
    setBusy(true);
    try { const saved = await tripsService.updateTripPhoto(editingPhoto.id, { caption: photoCaptionDraft.trim() || null }); setPhotos((items) => items.map((item) => item.id === saved.id ? saved : item)); setEditingPhoto(null); setError(""); }
    catch { setError("La légende de la photo n’a pas pu être modifiée."); }
    finally { setBusy(false); }
  }
  function deletePhoto(photo: TripPhotoRecord) {
    Alert.alert("Supprimer cette photo ?", photo.caption || "Cette action est définitive.", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: () => { void tripsService.deleteTripPhoto(photo.id).then(() => setPhotos((items) => items.filter((item) => item.id !== photo.id))).catch(() => setError("La photo n’a pas pu être supprimée.")); } },
    ]);
  }

  async function beginEdit(id: string) {
    setBusy(true);
    try {
      const entry = await tripsService.fetchJournalEntry(id);
      setEditingId(entry.id); setEditTitle(entry.title ?? ""); setEditBody(entry.content ?? entry.body); setEditPlace(entry.place_label ?? ""); setError("");
    } catch { setError("Ce souvenir n’a pas pu être chargé pour modification."); }
    finally { setBusy(false); }
  }

  async function saveEdit() {
    if (!editingId || !editBody.trim() || busy) return;
    setBusy(true);
    try {
      const updated = await tripsService.updateJournalEntry(editingId, { title: editTitle.trim() || null, content: editBody.trim(), place_label: editPlace.trim() || null });
      setEntries((current) => current.map((entry) => entry.id === updated.id ? updated : entry)); setEditingId(null); setError("");
    } catch { setError("Les modifications du souvenir n’ont pas pu être enregistrées."); }
    finally { setBusy(false); }
  }

  async function save() {
    if (!body.trim() || busy) { setError("Raconte d’abord le souvenir avant de l’enregistrer."); return; }
    setBusy(true);
    try {
      const entry = await tripsService.createJournalEntry({ trip_id: id, title: title.trim(), content: body.trim(), place_label: place.trim() || undefined, day_label: new Date().toLocaleDateString("fr-FR", { dateStyle: "long" }), emoji: "✨" });
      setEntries((current) => [entry, ...current]); setTitle(""); setBody(""); setPlace(""); setAdding(false); setError("");
    } catch { setError("Le souvenir n’a pas pu être enregistré sur le voyage."); }
    finally { setBusy(false); }
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.cream }}>
      <Page>
        <Header back title="Carnet de voyage" right={<Pressable accessibilityRole="button" accessibilityLabel="Ajouter un souvenir" onPress={() => setAdding((current) => !current)}><AppText style={{ color: C.green, fontSize: 22 }}>＋</AppText></Pressable>} />
        <AppText style={{ fontSize: 27, fontWeight: "900", color: C.ink }}>Nos petits moments.</AppText>
        <AppText style={{ fontSize: 12, color: C.muted, marginTop: -13 }}>Les souvenirs sont enregistrés et partagés avec les voyageurs.</AppText>
        <Surface style={st.cover}><AppIcon name="journal" size={35} /><AppText style={st.coverTitle}>Le carnet du voyage</AppText><AppText style={st.coverSub}>{entries.length} souvenir(s) partagé(s)</AppText></Surface>
        {adding && <Surface style={{ gap: 10 }}>
          <AppTextInput placeholder="Titre du souvenir (facultatif)" style={s.input} value={title} onChangeText={setTitle} />
          <AppTextInput placeholder="Raconte ce moment…" multiline style={[s.input, { height: 100, textAlignVertical: "top" }]} value={body} onChangeText={setBody} />
          <AppTextInput placeholder="Lieu (facultatif)" style={s.input} value={place} onChangeText={setPlace} />
          <Pressable disabled={busy} onPress={() => void save()} style={s.button}><AppText style={s.buttonText}>{busy ? "Enregistrement…" : "Enregistrer le souvenir"}</AppText></Pressable>
        </Surface>}
        <SectionTitle title="Photos du voyage" action={`${photos.length}`} />
        <Surface style={{ gap: 8 }}><AppTextInput placeholder="Légende de la photo (facultatif)" style={s.input} value={photoCaption} onChangeText={setPhotoCaption} /><Pressable disabled={busy} onPress={() => void uploadTripPhoto()} style={s.button}><AppText style={s.buttonText}>{busy ? "Envoi…" : "Choisir et envoyer une photo"}</AppText></Pressable></Surface>
        {photos.map((photo) => <Surface key={photo.id} style={{ gap: 6 }}>{!!photo.url && <Image source={{ uri: photo.url }} style={st.tripPhoto} />}{editingPhoto?.id === photo.id ? <><AppTextInput value={photoCaptionDraft} onChangeText={setPhotoCaptionDraft} placeholder="Légende" style={s.input} /><View style={{ flexDirection: "row", gap: 14 }}><Pressable disabled={busy} onPress={() => void savePhoto()}><AppText style={st.editText}>Enregistrer</AppText></Pressable><Pressable onPress={() => setEditingPhoto(null)}><AppText style={st.date}>Annuler</AppText></Pressable></View></> : <><AppText style={st.body}>{photo.caption || "Photo du voyage"}</AppText><AppText style={st.date}>{photo.taken_at ? new Date(photo.taken_at).toLocaleDateString("fr-FR") : "Ajoutée au carnet"}</AppText><View style={{ flexDirection: "row", gap: 16 }}><Pressable disabled={busy} onPress={() => void editPhoto(photo)}><AppText style={st.editText}>Modifier</AppText></Pressable><Pressable onPress={() => deletePhoto(photo)}><AppText style={st.error}>Supprimer</AppText></Pressable></View></>}</Surface>)}
        {!!error && <AppText accessibilityRole="alert" style={st.error}>{error}</AppText>}
        <View style={st.timeline}>
          {entries.map((entry) => (
            <View key={entry.id} style={st.entry}>
              <View style={st.rail}><View style={st.dot} /><View style={st.line} /></View>
              <View style={{ flex: 1 }}>
                <AppText style={st.day}>{entry.day_label || entry.day || new Date(entry.created_at).toLocaleDateString("fr-FR", { dateStyle: "long" })}</AppText>
                <Surface style={{ padding: 0, overflow: "hidden" }}>
                  <View style={st.photo}><AppIcon name={entry.emoji || "✨"} size={42} color={C.white} /><AppText style={st.place}>{entry.place_label || "Souvenir du voyage"}</AppText></View>
                  <View style={{ padding: 14, gap: 9 }}>
                    {editingId === entry.id ? <>
                      <AppTextInput placeholder="Titre" style={s.input} value={editTitle} onChangeText={setEditTitle} />
                      <AppTextInput placeholder="Raconte ce moment…" multiline style={[s.input, { minHeight: 100, textAlignVertical: "top" }]} value={editBody} onChangeText={setEditBody} />
                      <AppTextInput placeholder="Lieu" style={s.input} value={editPlace} onChangeText={setEditPlace} />
                      <View style={st.editActions}><Pressable disabled={busy} onPress={() => void saveEdit()} style={st.editButton}><AppText style={st.editButtonText}>{busy ? "Enregistrement…" : "Enregistrer"}</AppText></Pressable><Pressable onPress={() => setEditingId(null)} style={st.cancelButton}><AppText style={st.cancelText}>Annuler</AppText></Pressable></View>
                    </> : <>
                      {!!entry.title && <AppText style={st.title}>{entry.title}</AppText>}
                      <AppText style={st.body}>{entry.content || entry.body}</AppText>
                      <View style={st.author}><View style={st.avatar}><AppText style={{ fontWeight: "800", fontSize: 10 }}>{entry.author?.first_name?.charAt(0) || "A"}</AppText></View><AppText style={{ fontSize: 10, color: C.muted, flex: 1 }}>{entry.author?.first_name || "Voyageur"} · {new Date(entry.created_at).toLocaleDateString("fr-FR")}</AppText><Pressable disabled={busy} onPress={() => void beginEdit(entry.id)}><AppText style={st.editText}>Modifier</AppText></Pressable></View>
                    </>}
                  </View>
                </Surface>
              </View>
            </View>
          ))}
        </View>
        {!entries.length && !error && <Surface><AppText style={{ fontSize: 11, color: C.muted }}>Le carnet est vide. Ajoute le premier souvenir du groupe.</AppText></Surface>}
      </Page>
      <BottomBar />
    </View>
  );
}
const st = StyleSheet.create({ tripPhoto: { width: "100%", aspectRatio: 1.3, borderRadius: 12, backgroundColor: "#EDF2E8" }, date: { fontSize: 9, color: C.muted }, cover: { height: 155, backgroundColor: C.green, justifyContent: "center", alignItems: "center", borderRadius: 22 }, coverTitle: { fontSize: 16, fontWeight: "900", color: C.white, marginTop: 12 }, coverSub: { fontSize: 11, color: "#E9EDE6", marginTop: 4 }, timeline: { gap: 5 }, entry: { flexDirection: "row", gap: 12 }, rail: { width: 12, alignItems: "center" }, dot: { width: 9, height: 9, borderRadius: 6, backgroundColor: C.green, marginTop: 1 }, line: { width: 2, backgroundColor: "#DCE5D5", flex: 1 }, photo: { height: 130, backgroundColor: "#A6B9A1", alignItems: "center", justifyContent: "center" }, place: { position: "absolute", right: 12, bottom: 12, color: C.white, fontWeight: "700" }, day: { fontSize: 9, color: C.green, fontWeight: "900", letterSpacing: 1.1, marginBottom: 7 }, title: { fontSize: 15, fontWeight: "900", color: C.ink }, body: { fontSize: 12, color: C.muted, lineHeight: 18, marginTop: 7 }, author: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 }, avatar: { width: 25, height: 25, borderRadius: 9, backgroundColor: "#D9E8D3", alignItems: "center", justifyContent: "center" }, error: { color: "#A7493C", fontSize: 11, fontWeight: "800" }, editText: { color: C.green, fontSize: 10, fontWeight: "900" }, editActions: { flexDirection: "row", gap: 8 }, editButton: { backgroundColor: C.green, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 }, editButtonText: { color: C.white, fontSize: 10, fontWeight: "900" }, cancelButton: { backgroundColor: "#F2F3EF", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 }, cancelText: { color: C.muted, fontSize: 10, fontWeight: "800" } });
