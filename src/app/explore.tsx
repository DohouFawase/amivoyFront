import { AppText, AppTextInput } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { Link } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
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
import { discover, trips } from "@/data/mock";
export default function ExploreScreen() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Tout");
  const filtered = useMemo(
    () =>
      trips.filter(
        (x) =>
          `${x.title} ${x.destination}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (filter === "Tout" || x.status === filter),
      ),
    [query, filter],
  );
  return (
    <View style={{ flex: 1, backgroundColor: C.cream }}>
      <Page>
        <Header title="Explorer" />
        <View style={s.hero}>
          <Eyebrow>TON PROCHAIN DÉPART</Eyebrow>
          <AppText style={[s.heroTitle, { fontSize: 28 }]}>
            Chaque voyage a{"\n"}une histoire à vivre.
          </AppText>
          <AppText style={s.heroSub}>
            Trouve l’inspiration, puis invite ta bande.
          </AppText>
        </View>
        <View style={st.search}>
          <AppText style={{ fontSize: 18, color: C.muted }}>⌕</AppText>
          <AppTextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Destination, voyage…"
            placeholderTextColor="#99A198"
            style={st.input}
          />
          <AppText style={{ color: C.green }}>☷</AppText>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {["Tout", "En cours", "À venir"].map((x) => (
            <Pressable
              key={x}
              onPress={() => setFilter(x)}
              style={[st.filter, filter === x && st.filterOn]}
            >
              <AppText style={[st.filterText, filter === x && { color: "#fff" }]}>
                {x}
              </AppText>
            </Pressable>
          ))}
        </ScrollView>
        <Link href="/map" asChild>
          <Pressable style={st.mapCta}>
            <AppText style={{ fontSize: 20 }}>⌖</AppText>
            <View style={{ flex: 1 }}>
              <AppText style={{ fontSize: 12, fontWeight: "800", color: C.ink }}>
                Explorer sur la carte
              </AppText>
              <AppText style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
                Trouve un lieu et des idées de trajets
              </AppText>
            </View>
            <AppText style={{ color: C.green }}>›</AppText>
          </Pressable>
        </Link>
        <SectionTitle title="Tes voyages" action={`${trips.length} voyages`} />
        {filtered.map((t) => (
          <TripCard key={t.id} trip={t} />
        ))}
        {filtered.length === 0 && (
          <Surface>
            <AppText style={{ color: C.muted }}>
              Aucun voyage ne correspond à ta recherche.
            </AppText>
          </Surface>
        )}
        <View style={st.ai}>
          <AppText style={{ fontSize: 24 }}>✦</AppText>
          <View style={{ flex: 1 }}>
            <AppText style={{ fontSize: 14, fontWeight: "800", color: C.ink }}>
              Une idée de destination ?
            </AppText>
            <AppText style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
              Décris ton voyage idéal, on le prépare ensemble.
            </AppText>
          </View>
          <Link
            href="/create-trip"
            style={{ color: C.green, fontWeight: "800" }}
          >
            Créer ›
          </Link>
        </View>
        <SectionTitle title="Voyages à découvrir" action="Voir tout" />
        <View style={{ gap: 10 }}>
          {discover.map((x, i) => (
            <Surface key={x.title} style={st.discovery}>
              <View
                style={[
                  st.discoverEmoji,
                  { backgroundColor: ["#E6E7D4", "#EADDD2", "#DFE8E8"][i] },
                ]}
              >
                <AppIcon name={x.emoji} size={25} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText style={{ fontSize: 13, fontWeight: "800", color: C.ink }}>
                  {x.title}
                </AppText>
                <AppText style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
                  {x.place}
                </AppText>
              </View>
              <AppText style={{ color: C.green }}>♡ {x.saves}</AppText>
            </Surface>
          ))}
        </View>
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
