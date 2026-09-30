import { AppText } from "@/components/app-text";
import { Link } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { BottomBar, C, Header, Page, SectionTitle, Surface, TripCard } from "@/components/app-ui";
import { trips } from "@/data/mock";

export default function MyTrips() {
  return (
    <View style={{ flex: 1, backgroundColor: C.cream }}>
      <Page>
        <Header back title="Mes voyages" />
        <AppText style={st.title}>Toutes tes aventures.</AppText>
        <AppText style={st.sub}>Retrouve les voyages créés et ceux que tu prépares avec tes amis.</AppText>
        <Link href="/create-trip" asChild><Pressable style={st.button}><AppText style={st.buttonText}>＋  Créer un voyage</AppText></Pressable></Link>
        <SectionTitle title="Tes voyages" action={`${trips.length} voyage${trips.length === 1 ? "" : "s"}`} />
        {trips.map((trip) => <TripCard key={trip.id} trip={trip} />)}
        {!trips.length && <Surface><AppText style={st.sub}>Tu n’as pas encore créé de voyage.</AppText></Surface>}
      </Page>
      <BottomBar active="home" />
    </View>
  );
}
const st = StyleSheet.create({ title: { fontSize: 26, fontWeight: "900", color: C.ink }, sub: { color: C.muted, fontSize: 12, lineHeight: 18 }, button: { minHeight: 46, borderRadius: 14, backgroundColor: C.lime, alignItems: "center", justifyContent: "center" }, buttonText: { color: C.green, fontSize: 12, fontWeight: "900" } });
