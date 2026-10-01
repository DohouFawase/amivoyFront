import { AppIcon } from "@/components/app-icon";
import { AppText } from "@/components/app-text";
import { C } from "@/components/app-ui";
import type { OutingRecord } from "@/interface/groups";
import type { PhotoCommentRecord, TripJournalEntryRecord, TripPhotoRecord, TripRecord, TripMemberRecord } from "@/interface/trips";
import { groupsService } from "@/services/groupsService";
import { useAppSelector } from "@/hooks/redux";
import { tripsService } from "@/services/tripsService";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, Share, StyleSheet, TextInput, View } from "react-native";

type StoryMoment = { id: string; title: string; text: string; image?: string | null; icon: string; date: string | null };
const noJournalEntries: TripJournalEntryRecord[] = [];
const noTripPhotos: TripPhotoRecord[] = [];

function journalMoment(entry: TripJournalEntryRecord): StoryMoment {
  return {
    id: entry.id,
    title: entry.title || entry.place_label || "Moment du voyage",
    text: [entry.body || entry.content, entry.author?.first_name, entry.day_label || entry.day].filter(Boolean).join(" · "),
    icon: entry.emoji || "journal",
    date: entry.happened_at || entry.created_at,
  };
}

function photoMoment(photo: TripPhotoRecord | OutingRecord["photos"][number]): StoryMoment {
  const isTripPhoto = "trip_id" in photo;
  return {
    id: photo.id,
    title: photo.caption || "Un souvenir partagé",
    text: [photo.by || "Un membre", isTripPhoto ? photo.taken_at : photo.createdAt].filter(Boolean).join(" · "),
    image: photo.url || photo.uri,
    icon: "camera",
    date: isTripPhoto ? photo.taken_at || photo.createdAt : photo.createdAt,
  };
}

export default function MemoryStory() {
  const { id, type } = useLocalSearchParams<{ id: string; type?: string }>();
  const user = useAppSelector((state) => state.auth.user);
  const storyKey = `${type ?? "outing"}:${id}`;
  const [indexState, setIndexState] = useState<{ key: string; index: number }>({ key: "", index: 0 });
  const [tripMembers, setTripMembers] = useState<TripMemberRecord[]>([]);
  const [comments, setComments] = useState<PhotoCommentRecord[]>([]);
  const [commentDraft, setCommentDraft] = useState("");
  const [editingComment, setEditingComment] = useState<PhotoCommentRecord | null>(null);
  const [commentError, setCommentError] = useState("");
  const [loadedStory, setLoadedStory] = useState<{
    key: string;
    trip: TripRecord | null;
    journalEntries: TripJournalEntryRecord[];
    tripPhotos: TripPhotoRecord[];
    outing: OutingRecord | null;
    error: string;
  } | null>(null);
  const story = loadedStory?.key === storyKey ? loadedStory : null;
  const trip = story?.trip ?? null;
  const journalEntries = story?.journalEntries ?? noJournalEntries;
  const tripPhotos = story?.tripPhotos ?? noTripPhotos;
  const outing = story?.outing ?? null;
  const loading = story === null;
  const error = story?.error ?? "";
  const index = indexState.key === storyKey ? indexState.index : 0;

  useEffect(() => {
    let active = true;
    const loadStory = async () => {
      try {
        if (type === "trip") {
          const [loadedTrip, entries, photos] = await Promise.all([
            tripsService.fetchTrip(id),
            tripsService.fetchJournalEntries(id),
            tripsService.fetchTripPhotos(id),
          ]);
          if (active) setLoadedStory({ key: storyKey, trip: loadedTrip, journalEntries: entries, tripPhotos: photos, outing: null, error: "" });
        } else {
          const loadedOuting = await groupsService.fetchOuting(id);
          if (active) setLoadedStory({ key: storyKey, trip: null, journalEntries: [], tripPhotos: [], outing: loadedOuting, error: "" });
        }
      } catch {
        if (active) setLoadedStory({ key: storyKey, trip: null, journalEntries: [], tripPhotos: [], outing: null, error: "Ce souvenir n’a pas pu être chargé. Vérifie ta connexion ou tes droits d’accès." });
      }
    };
    void loadStory();
    return () => { active = false; };
  }, [id, storyKey, type]);

  useEffect(() => {
    if (type !== "trip" || !id) return;
    let active = true;
    void tripsService.fetchTripMembers(id).then((items) => { if (active) setTripMembers(items); }).catch(() => undefined);
    return () => { active = false; };
  }, [id, type]);

  const moments = useMemo<StoryMoment[]>(() => {
    if (type === "trip" && trip) {
      return [
        ...journalEntries.map(journalMoment),
        ...tripPhotos.filter((photo) => photo.status !== "hidden").map(photoMoment),
      ].sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
    }
    if (outing) {
      const photos = type === "community"
        ? outing.photos.filter((photo) => photo.sharedToStory)
        : outing.photos;
      if (photos.length) return photos.map(photoMoment);
      if (type === "outing") {
        return [{
          id: outing.id,
          title: outing.activity || outing.category || outing.title,
          text: [outing.place, outing.date, outing.time, outing.note].filter(Boolean).join(" · "),
          icon: "outing",
          date: outing.created_at,
        }];
      }
    }
    return [];
  }, [journalEntries, outing, trip, tripPhotos, type]);

  const moment = moments[index];
  const currentTripPhoto = type === "trip" ? tripPhotos.find((photo) => photo.id === moment?.id) ?? null : null;
  const currentTripMember = tripMembers.find((member) => member.user_id === user?.id && member.status === "active");
  const currentTripPhotoId = currentTripPhoto?.id;
  const commentsForCurrentPhoto = comments.filter((comment) => comment.photo_id === currentTripPhotoId);
  useEffect(() => {
    let active = true;
    if (!currentTripPhotoId) return;
    void tripsService.fetchPhotoComments(currentTripPhotoId).then((items) => { if (active) setComments(items); }).catch(() => { if (active) setCommentError("Les commentaires n’ont pas pu être chargés."); });
    return () => { active = false; };
  }, [currentTripPhotoId]);
  async function savePhotoComment() {
    if (!currentTripPhoto || !currentTripMember || !commentDraft.trim()) { setCommentError("Tu dois être membre actif pour commenter cette photo."); return; }
    try {
      const saved = editingComment ? await tripsService.updatePhotoComment(editingComment.id, commentDraft.trim()) : await tripsService.createPhotoComment({ photo_id: currentTripPhoto.id, member_id: currentTripMember.id, content: commentDraft.trim() });
      setComments((xs) => editingComment ? xs.map((x) => x.id === saved.id ? saved : x) : [saved, ...xs]); setCommentDraft(""); setEditingComment(null); setCommentError("");
    } catch { setCommentError("Le commentaire n’a pas pu être enregistré."); }
  }
  async function editPhotoComment(comment: PhotoCommentRecord) { try { const detail = await tripsService.fetchPhotoComment(comment.id); setEditingComment(detail); setCommentDraft(detail.content); } catch { setCommentError("Le détail du commentaire n’a pas pu être chargé."); } }
  function deletePhotoComment(comment: PhotoCommentRecord) { Alert.alert("Supprimer ce commentaire ?", comment.content, [{ text: "Annuler", style: "cancel" }, { text: "Supprimer", style: "destructive", onPress: () => { void tripsService.deletePhotoComment(comment.id).then(() => setComments((xs) => xs.filter((x) => x.id !== comment.id))).catch(() => setCommentError("Le commentaire n’a pas pu être supprimé.")); } }]); }
  const title = outing
    ? type === "community" && outing.locationType === "private" ? "Souvenirs entre amis" : outing.title
    : trip?.title || trip?.name || "Souvenir";
  const subtitle = outing
    ? outing.locationType === "private" ? `Lieu privé · ${outing.date ?? "date non précisée"}` : [outing.place, outing.date].filter(Boolean).join(" · ")
    : trip ? [trip.destination ?? trip.destination_label, trip.dates ?? trip.display_dates].filter(Boolean).join(" · ") : "";

  function advance(direction: number) {
    const next = index + direction;
    if (next >= moments.length) router.back();
    else setIndexState({ key: storyKey, index: Math.max(0, next) });
  }

  async function shareAmivoy() {
    if (!moment) return;
    try {
      await Share.share({ title: "Amivoy", message: `${moment.title} — un souvenir de ${outing?.title ?? trip?.title ?? trip?.name}, partagé avec Amivoy ✨` });
    } catch {
      return;
    }
  }

  if (loading) return <View style={st.empty}><AppText style={st.emptyText}>Chargement des souvenirs…</AppText></View>;
  if (error || !moment) return <View style={st.empty}><AppText style={st.emptyText}>{error || (type === "community" ? "Aucune photo partagée dans cette story." : "Aucun moment enregistré dans cet album.")}</AppText>{trip && <Pressable onPress={() => router.push({ pathname: "/trip/[id]/journal", params: { id: trip.id } } as never)}><AppText style={st.backText}>Ajouter un souvenir au carnet</AppText></Pressable>}<Pressable onPress={() => router.back()}><AppText style={st.backText}>Retour</AppText></Pressable></View>;

  return (
    <View style={st.screen}>
      <View style={st.progressRow}>{moments.map((item, i) => <View key={item.id} style={st.track}><View style={[st.fill, i <= index && st.fillOn]} /></View>)}</View>
      <View style={st.top}><Pressable onPress={() => router.back()} style={st.close}><AppText style={st.closeText}>×</AppText></Pressable><View style={{ flex: 1 }}><AppText numberOfLines={1} style={st.storyTitle}>{title}</AppText><AppText style={st.storySubtitle}>{subtitle}</AppText></View><AppText style={st.count}>{index + 1}/{moments.length}</AppText></View>
      <View style={st.stage}>
        {moment.image ? <Image source={{ uri: moment.image }} style={StyleSheet.absoluteFill} resizeMode="cover" /> : <View style={st.art}><AppIcon name={moment.icon} size={76} color={C.white} /><AppText style={st.artPlace}>{outing?.place ?? trip?.destination ?? trip?.destination_label}</AppText></View>}
        <Pressable accessibilityRole="button" accessibilityLabel="Moment précédent" style={st.hitLeft} onPress={() => advance(-1)} />
        <Pressable accessibilityRole="button" accessibilityLabel="Moment suivant" style={st.hitRight} onPress={() => advance(1)} />
        <View pointerEvents="none" style={st.caption}><AppText style={st.momentTitle}>{moment.title}</AppText><AppText style={st.momentText}>{moment.text}</AppText></View>
      </View>
      {currentTripPhoto && <View style={st.comments}><AppText style={st.commentHeading}>Commentaires · {commentsForCurrentPhoto.length}</AppText>{commentsForCurrentPhoto.map((comment) => <View key={comment.id} style={st.commentRow}><AppText style={st.commentText}>{comment.content}</AppText><Pressable onPress={() => void editPhotoComment(comment)}><AppText style={st.commentAction}>Modifier</AppText></Pressable><Pressable onPress={() => deletePhotoComment(comment)}><AppText style={st.commentDelete}>×</AppText></Pressable></View>)}<View style={st.commentInputRow}><TextInput value={commentDraft} onChangeText={setCommentDraft} placeholder="Écrire un commentaire…" style={st.commentInput} /><Pressable onPress={() => void savePhotoComment()}><AppText style={st.commentAction}>{editingComment ? "Enregistrer" : "Envoyer"}</AppText></Pressable></View>{!!commentError && <AppText style={st.commentError}>{commentError}</AppText>}</View>}
      <View style={st.footer}><AppText style={st.footerHint}>Touche à droite pour continuer · à gauche pour revenir</AppText>{outing && type === "outing" && <Pressable onPress={() => router.push({ pathname: "/outing/[id]", params: { id: outing.id } } as never)} style={st.detailButton}><AppText style={st.detailButtonText}>Ouvrir la sortie</AppText></Pressable>}{(outing || trip) && <Pressable onPress={() => void shareAmivoy()} style={st.detailButton}><AppText style={st.detailButtonText}>Partager Amivoy ↗</AppText></Pressable>}{trip && <Pressable onPress={() => router.push({ pathname: "/trip/[id]/journal", params: { id: trip.id } } as never)} style={st.detailButton}><AppText style={st.detailButtonText}>Ouvrir le carnet</AppText></Pressable>}</View>
    </View>
  );
}

const st = StyleSheet.create({ screen: { flex: 1, backgroundColor: "#14231D", paddingTop: 12, paddingHorizontal: 12, paddingBottom: 18 }, progressRow: { flexDirection: "row", gap: 4, paddingBottom: 12 }, track: { height: 3, flex: 1, borderRadius: 2, backgroundColor: "rgba(255,255,255,.3)", overflow: "hidden" }, fill: { height: "100%", width: "0%", backgroundColor: "transparent" }, fillOn: { width: "100%", backgroundColor: C.white }, top: { height: 54, flexDirection: "row", alignItems: "center", gap: 10 }, close: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,.15)", alignItems: "center", justifyContent: "center" }, closeText: { color: C.white, fontSize: 27, lineHeight: 30 }, storyTitle: { color: C.white, fontSize: 12, fontWeight: "900" }, storySubtitle: { color: "#D2DCD4", fontSize: 9, marginTop: 3 }, count: { color: C.white, fontSize: 10, fontWeight: "800" }, stage: { flex: 1, marginTop: 8, borderRadius: 22, overflow: "hidden", backgroundColor: "#456250", position: "relative" }, art: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center", gap: 18, padding: 32, backgroundColor: "#52745D" }, artPlace: { color: C.white, fontSize: 18, fontWeight: "900", textAlign: "center" }, hitLeft: { position: "absolute", left: 0, top: 0, bottom: 0, width: "35%" }, hitRight: { position: "absolute", right: 0, top: 0, bottom: 0, width: "65%" }, caption: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 22, paddingTop: 55, backgroundColor: "rgba(10,20,14,.45)" }, momentTitle: { color: C.white, fontSize: 20, fontWeight: "900", marginBottom: 8 }, momentText: { color: "#F2F5EF", fontSize: 12, lineHeight: 18 }, comments: { maxHeight: 165, backgroundColor: "#F4F6F1", borderRadius: 12, padding: 9, gap: 5 }, commentHeading: { color: C.ink, fontSize: 10, fontWeight: "900" }, commentRow: { flexDirection: "row", alignItems: "center", gap: 8 }, commentText: { color: C.ink, flex: 1, fontSize: 9 }, commentAction: { color: C.green, fontSize: 9, fontWeight: "900" }, commentDelete: { color: "#A7493C", fontWeight: "900" }, commentInputRow: { flexDirection: "row", alignItems: "center", gap: 8 }, commentInput: { flex: 1, minHeight: 36, borderRadius: 8, backgroundColor: C.white, paddingHorizontal: 8, color: C.ink, fontSize: 10 }, commentError: { color: "#A7493C", fontSize: 9 }, footer: { minHeight: 58, justifyContent: "center", alignItems: "center", gap: 8, paddingTop: 8 }, footerHint: { color: "#C0CBC2", fontSize: 9, textAlign: "center" }, detailButton: { paddingHorizontal: 15, paddingVertical: 9, borderRadius: 12, backgroundColor: "#E0EBD6" }, detailButtonText: { color: C.green, fontSize: 10, fontWeight: "900" }, empty: { flex: 1, backgroundColor: C.cream, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 24 }, emptyText: { color: C.ink, fontWeight: "800", textAlign: "center" }, backText: { color: C.green, fontWeight: "900", textAlign: "center" } });
