import { AppText, AppTextInput } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { tripsService } from "@/services/tripsService";
import type { PublicTripRecord, RouteSuggestionRecord, TripRecord } from "@/interface/trips";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import {
  BottomBar,
  C,
  Eyebrow,
  Header,
  Page,
  SectionTitle,
  Surface,
  TripCard,
  s,
} from "@/components/app-ui";
export default function ExploreScreen() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Tout");
  const [myTrips, setMyTrips] = useState<TripRecord[]>([]);
  const [publicTrips, setPublicTrips] = useState<PublicTripRecord[]>([]);
  const [routes, setRoutes] = useState<RouteSuggestionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPublic, setSelectedPublic] = useState<PublicTripRecord | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      tripsService.fetchTrips(),
      tripsService.fetchDiscoverTrips(),
      tripsService.fetchRouteSuggestions(),
    ]).then(([mine, discovered, suggestedRoutes]) => {
      if (!active) return;
      setMyTrips(mine);
      setPublicTrips(discovered);
      setRoutes(suggestedRoutes);
      setError("");
    }).catch(() => {
      if (active) setError("Les voyages à explorer n’ont pas pu être chargés depuis l’API.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matchesQuery = (text: string) => text.toLocaleLowerCase().includes(normalizedQuery);
  const filtered = myTrips.filter((trip) => {
    const status = (trip.status ?? "").toLocaleLowerCase();
    const matchesStatus = filter === "Tout"
      || (filter === "En cours" && ["active", "ongoing", "in_progress", "en cours"].some((value) => status.includes(value)))
      || (filter === "À venir" && !["active", "ongoing", "in_progress", "en cours", "completed", "cancelled", "terminé"].some((value) => status.includes(value)));
    return matchesStatus && matchesQuery(`${trip.title} ${trip.destination_label ?? trip.destination ?? ""}`);
  });
  const matchingPublicTrips = publicTrips.filter((trip) => matchesQuery(`${trip.name} ${trip.destination_label ?? ""} ${trip.description ?? ""}`));
  const matchingRoutes = routes.filter((route) => matchesQuery(`${route.name} ${route.country} ${route.subtitle}`));

  function toCard(trip: TripRecord) {
    const status = (trip.status ?? "à préparer").toLocaleLowerCase();
    const statusLabel = ["active", "ongoing", "in_progress", "en cours"].some((value) => status.includes(value)) ? "En cours" : "À venir";
    return {
      id: trip.id,
      title: trip.title || trip.name,
      destination: trip.destination_label ?? trip.destination ?? "Destination à définir",
      dates: trip.dates ?? trip.display_dates ?? (trip.start_date && trip.end_date ? `${trip.start_date} — ${trip.end_date}` : "Dates à organiser"),
      days: trip.duration_days ?? trip.days ?? 1,
      people: trip.people ?? trip.estimated_members ?? 1,
      image: trip.cover_url ?? trip.image ?? "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=85",
      status: statusLabel,
    };
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.cream }}>
      <Page>
        <Header title="Explorer" />
        <View style={s.hero}>
          <Eyebrow>TON PROCHAIN DÉPART</Eyebrow>
          <AppText style={[s.heroTitle, { fontSize: 28 }]}>Chaque voyage a{"\n"}une histoire à vivre.</AppText>
          <AppText style={s.heroSub}>Trouve l’inspiration, puis invite ta bande.</AppText>
        </View>
        <View style={st.search}>
          <AppText style={{ fontSize: 18, color: C.muted }}>⌕</AppText>
          <AppTextInput value={query} onChangeText={setQuery} placeholder="Destination, voyage…" placeholderTextColor="#99A198" style={st.input} />
          <AppText style={{ color: C.green }}>☷</AppText>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {["Tout", "En cours", "À venir"].map((x) => <Pressable key={x} onPress={() => setFilter(x)} style={[st.filter, filter === x && st.filterOn]}><AppText style={[st.filterText, filter === x && { color: "#fff" }]}>{x}</AppText></Pressable>)}
        </ScrollView>
        <Link href="/map" asChild><Pressable style={st.mapCta}><AppText style={{ fontSize: 20 }}>⌖</AppText><View style={{ flex: 1 }}><AppText style={{ fontSize: 12, fontWeight: "800", color: C.ink }}>Explorer sur la carte</AppText><AppText style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Trouve un lieu et des idées de trajets</AppText></View><AppText style={{ color: C.green }}>›</AppText></Pressable></Link>
        <SectionTitle title="Tes voyages" action={`${filtered.length} voyages`} />
        {filtered.map((trip) => <TripCard key={trip.id} trip={toCard(trip)} />)}
        {!loading && filtered.length === 0 && <Surface><AppText style={{ color: C.muted }}>{error || "Aucun voyage ne correspond à ta recherche."}</AppText></Surface>}
        <View style={st.ai}><AppText style={{ fontSize: 24 }}>✦</AppText><View style={{ flex: 1 }}><AppText style={{ fontSize: 14, fontWeight: "800", color: C.ink }}>Une idée de destination ?</AppText><AppText style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Décris ton voyage idéal, on le prépare ensemble.</AppText></View><Link href="/create-trip" style={{ color: C.green, fontWeight: "800" }}>Créer ›</Link></View>
        <SectionTitle title="Voyages à découvrir" action={`${matchingPublicTrips.length} publics`} />
        {loading && <Surface style={st.discovery}><ActivityIndicator color={C.green} /><AppText style={{ color: C.muted }}>Chargement depuis l’API…</AppText></Surface>}
        {!loading && matchingPublicTrips.map((trip, i) => <Pressable key={trip.id} onPress={() => { setDetailLoading(true); void tripsService.fetchDiscoverTrip(trip.id).then(setSelectedPublic).catch(() => setError("Le détail de ce voyage public n’a pas pu être chargé.")).finally(() => setDetailLoading(false)); }}><Surface style={st.discovery}><View style={[st.discoverEmoji, { backgroundColor: ["#E6E7D4", "#EADDD2", "#DFE8E8"][i % 3] }]}><AppIcon name="trip" size={25} /></View><View style={{ flex: 1 }}><AppText style={{ fontSize: 13, fontWeight: "800", color: C.ink }}>{trip.name}</AppText><AppText style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{[trip.destination_label, trip.start_date && trip.end_date ? `${trip.start_date} — ${trip.end_date}` : null].filter(Boolean).join(" · ") || trip.description || "Voyage partagé par la communauté"}</AppText></View><AppText style={{ color: C.green }}>›</AppText></Surface></Pressable>)}
        {detailLoading && <Surface><ActivityIndicator color={C.green} /></Surface>}
        {selectedPublic && <Surface style={{ gap: 8 }}><AppText style={{ fontSize: 15, fontWeight: "900", color: C.ink }}>{selectedPublic.name}</AppText><AppText style={{ fontSize: 11, color: C.muted }}>{selectedPublic.destination_label || "Destination non précisée"}</AppText><AppText style={{ fontSize: 11, color: C.muted }}>{[selectedPublic.start_date, selectedPublic.end_date].filter(Boolean).join(" — ")}</AppText><AppText style={{ fontSize: 11, color: C.ink }}>{selectedPublic.description || "Aucune description."}</AppText><Pressable onPress={() => setSelectedPublic(null)}><AppText style={{ color: C.green, fontWeight: "800" }}>Fermer</AppText></Pressable></Surface>}
        {!loading && matchingPublicTrips.length === 0 && <Surface><AppText style={{ color: C.muted }}>{error || "Aucun voyage public à découvrir pour le moment."}</AppText></Surface>}
        <SectionTitle title="Itinéraires proposés" action="API Amigo" />
        {matchingRoutes.map((route) => <Surface key={route.id} style={st.discovery}><View style={[st.discoverEmoji, { backgroundColor: route.tint }]}><AppText style={{ fontSize: 24 }}>{route.emoji}</AppText></View><View style={{ flex: 1 }}><AppText style={{ fontSize: 13, fontWeight: "800", color: C.ink }}>{route.name}</AppText><AppText style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{route.country} · {route.subtitle} · {route.days} · {route.distance}</AppText></View></Surface>)}
        {!loading && matchingRoutes.length === 0 && <Surface><AppText style={{ color: C.muted }}>{error || "Aucun itinéraire proposé par l’API."}</AppText></Surface>}
      </Page>
      <BottomBar active="explore" />
    </View>
  );
}

const st = StyleSheet.create({
  search: {
    height: 48,
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: C.line,
  },
  input: { flex: 1, fontSize: 13, color: C.ink },
  filter: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 30,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: C.line,
  },
  filterOn: { backgroundColor: C.green, borderColor: C.green },
  filterText: { fontSize: 11, color: C.muted, fontWeight: "700" },
  mapCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    backgroundColor: "#EAF1E4",
    padding: 13,
    borderRadius: 16,
  },
  ai: {
    backgroundColor: C.lime,
    padding: 16,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  discovery: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 11,
  },
  discoverEmoji: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
});
