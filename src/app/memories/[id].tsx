import { AppText } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Image, Pressable, Share, StyleSheet, View } from "react-native";
import { C } from "@/components/app-ui";
import { journal, trips } from "@/data/mock";
import { getOuting } from "@/data/outings";

type StoryMoment = { title: string; text: string; image?: string; icon: string };

export default function MemoryStory() {
  const { id, type } = useLocalSearchParams<{ id: string; type?: string }>();
  const [index, setIndex] = useState(0);
  const outing = type === "outing" || type === "community" ? getOuting(id) : undefined;
  const trip = type === "trip" ? trips.find((item) => item.id === id) : undefined;
  const moments = useMemo<StoryMoment[]>(() => {
    if (outing) {
      const photos = type === "community" ? outing.photos.filter((photo) => photo.sharedToStory) : outing.photos;
      if (photos.length) return photos.map((photo) => ({ title: photo.caption, text: `${photo.by} · ${photo.createdAt}`, image: photo.uri, icon: "camera" }));
      return [{ title: outing.activity || outing.category, text: `${outing.place} · ${outing.date} à ${outing.time}${outing.note ? ` · ${outing.note}` : ""}`, icon: "outing" }];
    }
    if (trip) return journal.map((entry) => ({ title: entry.title, text: entry.body, icon: entry.emoji }));
    return [];
  }, [outing, trip, type]);
  const moment = moments[index];
  if (!moment) return <View style={st.empty}><AppText style={st.emptyText}>Ce souvenir est introuvable.</AppText><Pressable onPress={() => router.back()}><AppText style={st.backText}>Retour</AppText></Pressable></View>;
  const title = outing ? type === "community" && outing.locationType === "private" ? "Souvenirs entre amis" : outing.title : trip?.title ?? "Souvenir";
  function advance(direction: number) {
    const next = index + direction;
    if (next >= moments.length) router.back();
    else setIndex(Math.max(0, next));
  }
  async function shareAmivoy() {
    try {
      await Share.share({ title: "Amivoy", message: `${moment.title} — un souvenir de ${outing?.title ?? trip?.title}, partagé avec Amivoy ✨` });
    } catch {
      return;
    }
  }
  return (
    <View style={st.screen}>
      <View style={st.progressRow}>{moments.map((item, i) => <View key={`${item.title}-${i}`} style={st.track}><View style={[st.fill, i <= index && st.fillOn]} /></View>)}</View>
      <View style={st.top}><Pressable onPress={() => router.back()} style={st.close}><AppText style={st.closeText}>×</AppText></Pressable><View style={{ flex: 1 }}><AppText numberOfLines={1} style={st.storyTitle}>{title}</AppText><AppText style={st.storySubtitle}>{outing ? type === "community" && outing.locationType === "private" ? `Lieu privé · ${outing.date}` : `${outing.place} · ${outing.date}` : trip?.destination}</AppText></View><AppText style={st.count}>{index + 1}/{moments.length}</AppText></View>
      <View style={st.stage}>
        {moment.image ? <Image source={{ uri: moment.image }} style={StyleSheet.absoluteFill} resizeMode="cover" /> : <View style={st.art}><AppIcon name={moment.icon} size={76} color={C.white} /><AppText style={st.artPlace}>{outing?.place ?? trip?.destination}</AppText></View>}
        <Pressable accessibilityLabel="Moment précédent" style={st.hitLeft} onPress={() => advance(-1)} />
        <Pressable accessibilityLabel="Moment suivant" style={st.hitRight} onPress={() => advance(1)} />
        <View pointerEvents="none" style={st.caption}><AppText style={st.momentTitle}>{moment.title}</AppText><AppText style={st.momentText}>{moment.text}</AppText></View>
      </View>
      <View style={st.footer}><AppText style={st.footerHint}>Touche à droite pour continuer · à gauche pour revenir</AppText>{outing && type === "outing" && <Pressable onPress={() => router.push({ pathname: "/outing/[id]", params: { id: outing.id } } as never)} style={st.detailButton}><AppText style={st.detailButtonText}>Ouvrir la sortie</AppText></Pressable>}{(outing || trip) && <Pressable onPress={() => void shareAmivoy()} style={st.detailButton}><AppText style={st.detailButtonText}>Partager Amivoy ↗</AppText></Pressable>}{trip && <Pressable onPress={() => router.push({ pathname: "/trip/[id]/journal", params: { id: trip.id } } as never)} style={st.detailButton}><AppText style={st.detailButtonText}>Ouvrir le carnet</AppText></Pressable>}</View>
    </View>
  );
}
const st = StyleSheet.create({ screen: { flex: 1, backgroundColor: "#14231D", paddingTop: 12, paddingHorizontal: 12, paddingBottom: 18 }, progressRow: { flexDirection: "row", gap: 4, paddingBottom: 12 }, track: { height: 3, flex: 1, borderRadius: 2, backgroundColor: "rgba(255,255,255,.3)", overflow: "hidden" }, fill: { height: "100%", width: "0%", backgroundColor: "transparent" }, fillOn: { width: "100%", backgroundColor: C.white }, top: { height: 54, flexDirection: "row", alignItems: "center", gap: 10 }, close: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,.15)", alignItems: "center", justifyContent: "center" }, closeText: { color: C.white, fontSize: 27, lineHeight: 30 }, storyTitle: { color: C.white, fontSize: 12, fontWeight: "900" }, storySubtitle: { color: "#D2DCD4", fontSize: 9, marginTop: 3 }, count: { color: C.white, fontSize: 10, fontWeight: "800" }, stage: { flex: 1, marginTop: 8, borderRadius: 22, overflow: "hidden", backgroundColor: "#456250", position: "relative" }, art: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center", gap: 18, padding: 32, backgroundColor: "#52745D" }, artPlace: { color: C.white, fontSize: 18, fontWeight: "900", textAlign: "center" }, hitLeft: { position: "absolute", left: 0, top: 0, bottom: 0, width: "35%" }, hitRight: { position: "absolute", right: 0, top: 0, bottom: 0, width: "65%" }, caption: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 22, paddingTop: 55, backgroundColor: "rgba(10,20,14,.45)" }, momentTitle: { color: C.white, fontSize: 20, fontWeight: "900", marginBottom: 8 }, momentText: { color: "#F2F5EF", fontSize: 12, lineHeight: 18 }, footer: { minHeight: 58, justifyContent: "center", alignItems: "center", gap: 8, paddingTop: 8 }, footerHint: { color: "#C0CBC2", fontSize: 9, textAlign: "center" }, detailButton: { paddingHorizontal: 15, paddingVertical: 9, borderRadius: 12, backgroundColor: "#E0EBD6" }, detailButtonText: { color: C.green, fontSize: 10, fontWeight: "900" }, empty: { flex: 1, backgroundColor: C.cream, alignItems: "center", justifyContent: "center", gap: 12 }, emptyText: { color: C.ink, fontWeight: "800" }, backText: { color: C.green, fontWeight: "900" } });
