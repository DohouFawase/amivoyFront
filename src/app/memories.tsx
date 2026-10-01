import { fetchOutings } from "@/actions/groupActions";
import { fetchTrips } from "@/actions/tripActions";
import { AppIcon } from "@/components/app-icon";
import { AppText } from "@/components/app-text";
import { BottomBar, C, Header, Page, SectionTitle, Surface } from "@/components/app-ui";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { Link, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";

export default function Memories() {
  const dispatch = useAppDispatch();
  const trips = useAppSelector((state) => state.trips.trips);
  const outings = useAppSelector((state) => state.groups.outings);
  const tripError = useAppSelector((state) => state.trips.error);
  const outingError = useAppSelector((state) => state.groups.error);
  const tripStatus = useAppSelector((state) => state.trips.requestStatus);
  const outingStatus = useAppSelector((state) => state.groups.requestStatus);

  useFocusEffect(useCallback(() => {
    void dispatch(fetchTrips());
    void dispatch(fetchOutings());
  }, [dispatch]));

  const sharedOutings = outings.filter((outing) => outing.photos.some((photo) => photo.sharedToStory));
  const sharedPosts = sharedOutings.flatMap((outing) => outing.photos.filter((photo) => photo.sharedToStory).map((photo) => ({ outing, photo })));
  const isLoading = tripStatus === "loading" || outingStatus === "loading";

  return (
    <View style={{ flex: 1, backgroundColor: C.cream }}>
      <Page>
        <Header back title="Souvenirs" />
        <AppText style={st.title}>Les petits moments restent.</AppText>
        <AppText style={st.sub}>Retrouve les carnets de voyage et les photos de tes sorties, puis partage tes favoris dans la Story Amivoy.</AppText>
        {!!tripError && <AppText style={st.error}>{tripError}</AppText>}
        {!!outingError && <AppText style={st.error}>{outingError}</AppText>}
        <SectionTitle title="Stories Amivoy" action={`${sharedOutings.length} sortie${sharedOutings.length === 1 ? "" : "s"}`} />
        {sharedOutings.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.storyRail}>
          {sharedOutings.map((outing) => {
            const cover = outing.photos.find((photo) => photo.sharedToStory);
            const coverUri = cover?.url ?? cover?.uri;
            return <Link key={outing.id} href={{ pathname: "/memories/[id]", params: { id: outing.id, type: "community" } } as never} asChild><Pressable style={st.story}>
              <View style={st.storyRing}>{coverUri ? <Image source={{ uri: coverUri }} style={st.storyImage} /> : <View style={st.storyInner}><AppIcon name="outing" size={24} color={C.green} /></View>}</View>
              <AppText numberOfLines={1} style={st.storyLabel}>{outing.title}</AppText>
              <AppText numberOfLines={1} style={st.storyPlace}>{outing.photos.filter((photo) => photo.sharedToStory).length} souvenir(s)</AppText>
            </Pressable></Link>;
          })}
        </ScrollView> : <Surface style={st.empty}><AppIcon name="camera" size={24} /><View style={{ flex: 1, gap: 3 }}><AppText style={st.albumTitle}>{isLoading ? "Chargement des stories…" : "Ta Story Amivoy est prête"}</AppText><AppText style={st.sub}>Les photos partagées depuis tes sorties apparaîtront ici.</AppText></View></Surface>}
        <SectionTitle title="Fil Amivoy · souvenirs partagés" action={`${sharedPosts.length}`} />
        {sharedPosts.length ? sharedPosts.map(({ outing, photo }) => <Surface key={`${outing.id}-${photo.id}`} style={st.post}>
          {(photo.url || photo.uri) && <Image source={{ uri: photo.url ?? photo.uri ?? undefined }} style={st.postImage} />}
          <View style={st.postContent}>
            <AppText style={st.albumTitle}>{photo.by || "Un membre"} · {outing.locationType === "private" ? "sortie entre amis" : outing.place}</AppText>
            {!!photo.caption && <AppText style={st.postCaption}>{photo.caption}</AppText>}
            <AppText style={st.sub}>{outing.title} · {photo.createdAt ?? "Date non précisée"}</AppText>
            <Link href={{ pathname: "/memories/[id]", params: { id: outing.id, type: "community" } } as never} asChild><Pressable style={st.openStory}><AppText style={st.openStoryText}>Voir la story →</AppText></Pressable></Link>
          </View>
        </Surface>) : <Surface style={st.empty}><AppIcon name="journal" size={24} /><AppText style={st.sub}>Tu choisis quelles photos de tes sorties tu publies ici.</AppText></Surface>}
        <SectionTitle title="Toutes tes sorties" action={`${outings.length}`} />
        {outings.map((outing) => <Link key={outing.id} href={{ pathname: "/memories/[id]", params: { id: outing.id, type: "outing" } } as never} asChild><Pressable><Surface style={st.album}><View style={st.albumIcon}><AppIcon name="outing" size={22} /></View><View style={{ flex: 1, gap: 4 }}><AppText style={st.albumTitle}>{outing.title}</AppText><AppText style={st.sub}>{outing.place} · {outing.date ?? "Date à confirmer"}</AppText><AppText style={st.albumMeta}>{outing.photos.length} photo{outing.photos.length === 1 ? "" : "s"} · {outing.attending.length} participant{outing.attending.length === 1 ? "" : "s"}</AppText></View><AppText style={st.arrow}>›</AppText></Surface></Pressable></Link>)}
        {outings.length === 0 && <Surface style={st.empty}><AppText style={st.sub}>{isLoading ? "Chargement des sorties…" : "Aucune sortie enregistrée pour le moment."}</AppText></Surface>}
        <SectionTitle title="Carnets de voyage" action={`${trips.length}`} />
        {trips.map((trip) => <Link key={trip.id} href={{ pathname: "/memories/[id]", params: { id: trip.id, type: "trip" } } as never} asChild><Pressable><Surface style={st.album}><View style={[st.albumIcon, { backgroundColor: "#F2E5D8" }]}><AppIcon name="journal" size={22} /></View><View style={{ flex: 1, gap: 4 }}><AppText style={st.albumTitle}>{trip.title || trip.name}</AppText><AppText style={st.sub}>{trip.destination ?? trip.destination_label ?? "Destination à définir"} · {trip.dates ?? trip.display_dates ?? "Dates à définir"}</AppText><AppText style={st.albumMeta}>Carnet de voyage · ouvrir les moments</AppText></View><AppText style={st.arrow}>›</AppText></Surface></Pressable></Link>)}
        {trips.length === 0 && <Surface style={st.empty}><AppText style={st.sub}>{isLoading ? "Chargement des carnets…" : "Aucun voyage enregistré pour le moment."}</AppText></Surface>}
      </Page>
      <BottomBar active="home" />
    </View>
  );
}

const st = StyleSheet.create({
  title: { fontSize: 26, fontWeight: "900", color: C.ink }, sub: { fontSize: 11, color: C.muted, lineHeight: 17 }, error: { color: "#A7493C", fontSize: 11, fontWeight: "800" },
  storyRail: { gap: 13, paddingVertical: 3, paddingRight: 8 }, story: { width: 92, alignItems: "center", gap: 4 },
  storyRing: { width: 68, height: 68, borderRadius: 34, borderWidth: 2, borderColor: C.orange, padding: 3, overflow: "hidden" }, storyImage: { width: "100%", height: "100%", borderRadius: 32 },
  storyInner: { flex: 1, borderRadius: 30, backgroundColor: "#EAF0E4", alignItems: "center", justifyContent: "center" }, storyLabel: { width: 90, color: C.ink, fontSize: 10, fontWeight: "800", textAlign: "center" }, storyPlace: { width: 90, color: C.muted, fontSize: 8, textAlign: "center" },
  album: { flexDirection: "row", alignItems: "center", gap: 11, padding: 13 }, albumIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: "#EAF0E4", alignItems: "center", justifyContent: "center" }, albumTitle: { color: C.ink, fontSize: 12, fontWeight: "900" }, albumMeta: { color: C.green, fontSize: 9, fontWeight: "800" }, arrow: { color: C.green, fontSize: 22 },
  empty: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#F0F3EB" }, post: { padding: 0, overflow: "hidden" }, postImage: { width: "100%", height: 220, backgroundColor: "#E9ECE5" }, postContent: { padding: 13, gap: 6 }, postCaption: { fontSize: 13, color: C.ink, fontWeight: "700" }, openStory: { alignSelf: "flex-start", backgroundColor: C.green, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginTop: 3 }, openStoryText: { color: C.white, fontSize: 10, fontWeight: "900" },
});
