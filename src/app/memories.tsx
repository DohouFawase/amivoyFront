import { AppText } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { Link } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { BottomBar, C, Header, Page, SectionTitle, Surface } from "@/components/app-ui";
import { trips } from "@/data/mock";
import { listOutings } from "@/data/outings";

export default function Memories() {
  const outings = listOutings();
  const sharedOutings = outings.filter((outing) => outing.photos.some((photo) => photo.sharedToStory));
  const sharedPosts = sharedOutings.flatMap((outing) => outing.photos.filter((photo) => photo.sharedToStory).map((photo) => ({ outing, photo })));
  return (
    <View style={{ flex: 1, backgroundColor: C.cream }}>
      <Page>
        <Header back title="Souvenirs" />
        <AppText style={st.title}>Les petits moments restent.</AppText>
        <AppText style={st.sub}>Garde les souvenirs de tes sorties, partage-les dans la Story Amivoy ou fais connaître l’application à tes proches.</AppText>
        <SectionTitle title="Stories Amivoy" action={`${sharedOutings.length} sortie${sharedOutings.length === 1 ? "" : "s"}`} />
        {sharedOutings.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.storyRail}>
          {sharedOutings.map((outing) => {
            const cover = outing.photos.find((photo) => photo.sharedToStory);
            return <Link key={outing.id} href={{ pathname: "/memories/[id]", params: { id: outing.id, type: "community" } } as never} asChild><Pressable style={st.story}>
              <View style={st.storyRing}>{cover?.uri ? <Image source={{ uri: cover.uri }} style={st.storyImage} /> : <View style={st.storyInner}><AppIcon name="outing" size={24} color={C.green} /></View>}</View>
              <AppText numberOfLines={1} style={st.storyLabel}>{outing.title}</AppText>
              <AppText numberOfLines={1} style={st.storyPlace}>{cover ? `${outing.photos.filter((photo) => photo.sharedToStory).length} souvenir(s)` : "Souvenir partagé"}</AppText>
            </Pressable></Link>;
          })}
        </ScrollView> : <Surface style={st.empty}><AppIcon name="camera" size={24} /><View style={{ flex: 1, gap: 3 }}><AppText style={st.albumTitle}>Ta Story Amivoy est prête</AppText><AppText style={st.sub}>Dans une sortie, choisis « Partager sur la Story Amivoy » sous une photo pour la publier ici.</AppText></View></Surface>}
        <SectionTitle title="Fil Amivoy · souvenirs partagés" action={`${sharedPosts.length}`} />
        {sharedPosts.length ? sharedPosts.map(({ outing, photo }) => <Surface key={`${outing.id}-${photo.id}`} style={st.post}>
          <Image source={{ uri: photo.uri }} style={st.postImage} />
          <View style={st.postContent}>
            <AppText style={st.albumTitle}>{photo.by} · {outing.locationType === "private" ? "sortie entre amis" : outing.place}</AppText>
            <AppText style={st.postCaption}>{photo.caption}</AppText>
            <AppText style={st.sub}>{outing.title} · {photo.createdAt}</AppText>
            <Link href={{ pathname: "/memories/[id]", params: { id: outing.id, type: "community" } } as never} asChild><Pressable style={st.openStory}><AppText style={st.openStoryText}>Voir la story →</AppText></Pressable></Link>
          </View>
        </Surface>) : <Surface style={st.empty}><AppIcon name="journal" size={24} /><AppText style={st.sub}>Les photos partagées depuis tes sorties apparaîtront ici. Tu décides lesquelles tu publies.</AppText></Surface>}
        <SectionTitle title="Toutes tes sorties" action={`${outings.length}`} />
        {outings.map((outing) => <Link key={outing.id} href={{ pathname: "/memories/[id]", params: { id: outing.id, type: "outing" } } as never} asChild><Pressable><Surface style={st.album}><View style={st.albumIcon}><AppIcon name="outing" size={22} /></View><View style={{ flex: 1, gap: 4 }}><AppText style={st.albumTitle}>{outing.title}</AppText><AppText style={st.sub}>{outing.place} · {outing.date}</AppText><AppText style={st.albumMeta}>{outing.photos.length} photo{outing.photos.length === 1 ? "" : "s"} · {outing.attending.length} participant{outing.attending.length === 1 ? "" : "s"}</AppText></View><AppText style={st.arrow}>›</AppText></Surface></Pressable></Link>)}
        <SectionTitle title="Carnets de voyage" action={`${trips.length}`} />
        {trips.map((trip) => <Link key={trip.id} href={{ pathname: "/memories/[id]", params: { id: trip.id, type: "trip" } } as never} asChild><Pressable><Surface style={st.album}><View style={[st.albumIcon, { backgroundColor: "#F2E5D8" }]}><AppIcon name="journal" size={22} /></View><View style={{ flex: 1, gap: 4 }}><AppText style={st.albumTitle}>{trip.title}</AppText><AppText style={st.sub}>{trip.destination} · {trip.dates}</AppText><AppText style={st.albumMeta}>Carnet de voyage · ouvrir les moments</AppText></View><AppText style={st.arrow}>›</AppText></Surface></Pressable></Link>)}
      </Page>
      <BottomBar active="home" />
    </View>
  );
}

const st = StyleSheet.create({
  title: { fontSize: 26, fontWeight: "900", color: C.ink }, sub: { fontSize: 11, color: C.muted, lineHeight: 17 },
  storyRail: { gap: 13, paddingVertical: 3, paddingRight: 8 }, story: { width: 92, alignItems: "center", gap: 4 },
  storyRing: { width: 68, height: 68, borderRadius: 34, borderWidth: 2, borderColor: C.orange, padding: 3, overflow: "hidden" }, storyImage: { width: "100%", height: "100%", borderRadius: 32 },
  storyInner: { flex: 1, borderRadius: 30, backgroundColor: "#EAF0E4", alignItems: "center", justifyContent: "center" }, storyLabel: { width: 90, color: C.ink, fontSize: 10, fontWeight: "800", textAlign: "center" }, storyPlace: { width: 90, color: C.muted, fontSize: 8, textAlign: "center" },
  album: { flexDirection: "row", alignItems: "center", gap: 11, padding: 13 }, albumIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: "#EAF0E4", alignItems: "center", justifyContent: "center" }, albumTitle: { color: C.ink, fontSize: 12, fontWeight: "900" }, albumMeta: { color: C.green, fontSize: 9, fontWeight: "800" }, arrow: { color: C.green, fontSize: 22 },
  empty: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#F0F3EB" }, post: { padding: 0, overflow: "hidden" }, postImage: { width: "100%", height: 220, backgroundColor: "#E9ECE5" }, postContent: { padding: 13, gap: 6 }, postCaption: { fontSize: 13, color: C.ink, fontWeight: "700" }, openStory: { alignSelf: "flex-start", backgroundColor: C.green, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginTop: 3 }, openStoryText: { color: C.white, fontSize: 10, fontWeight: "900" },
});
