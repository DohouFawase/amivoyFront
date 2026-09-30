import { AppIcon } from "@/components/app-icon";
import { AppText } from "@/components/app-text";
import { BottomBar, C, Header, Page, SectionTitle, Surface, s } from "@/components/app-ui";
import { listGroupActivities, type ActivityCategory } from "@/data/group-activity";
import { Link } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useState } from "react";

const filters: { key: ActivityCategory | "all"; label: string }[] = [
  { key: "all", label: "Tout" }, { key: "outing", label: "Sorties" },
  { key: "trip", label: "Voyages" }, { key: "circle", label: "Cercles" },
];

export default function GroupActivity() {
  const [filter, setFilter] = useState<ActivityCategory | "all">("all");
  const activities = listGroupActivities(filter);
  return <View style={{ flex: 1, backgroundColor: C.cream }}>
    <Page>
      <Header back title="Fil du groupe" />
      <AppText style={s.heroTitle}>La vie de ta bande, au même endroit.</AppText>
      <AppText style={s.heroSub}>Nouvelles sorties, voyages, souvenirs partagés et changements dans tes cercles.</AppText>
      <View style={st.filters}>{filters.map((item) => <Pressable key={item.key} onPress={() => setFilter(item.key)} style={[st.filter, filter === item.key && st.filterOn]}><AppText style={[st.filterText, filter === item.key && st.filterTextOn]}>{item.label}</AppText></Pressable>)}</View>
      <SectionTitle title="Activité récente" action={`${activities.length} événement${activities.length === 1 ? "" : "s"}`} />
      {activities.length ? <View style={st.timeline}>{activities.map((item, index) => <View key={item.id} style={st.timelineItem}>
        <View style={st.rail}>{index < activities.length - 1 && <View style={st.railLine} />}<View style={st.icon}><AppIcon name={item.icon} size={19} color={C.green} /></View></View>
        <Link href={item.href as never} asChild><Pressable style={{ flex: 1 }}><Surface style={st.event}>
          <View style={st.eventTop}><AppText style={st.group}>{item.groupName}</AppText><AppText style={st.time}>{item.time}</AppText></View>
          <AppText style={st.title}>{item.title}</AppText><AppText style={st.description}>{item.description}</AppText>
          <AppText style={st.actor}>{item.actor} · Ouvrir →</AppText>
        </Surface></Pressable></Link>
      </View>)}</View> : <Surface style={st.empty}><AppIcon name="group" size={27} /><AppText style={st.title}>Rien dans cette catégorie pour l’instant</AppText><AppText style={st.description}>Les nouveautés de tes groupes apparaîtront ici.</AppText></Surface>}
      <AppText style={st.foot}>Fil de démonstration · les activités restent locales à cette session.</AppText>
    </Page>
    <BottomBar active="activity" />
  </View>;
}

const st = StyleSheet.create({
  filters: { flexDirection: "row", gap: 7, flexWrap: "wrap" },
  filter: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 16, backgroundColor: C.white, borderWidth: 1, borderColor: C.line },
  filterOn: { backgroundColor: C.green, borderColor: C.green }, filterText: { fontSize: 10, color: C.ink, fontWeight: "800" }, filterTextOn: { color: C.white },
  timeline: { gap: 0 }, timelineItem: { flexDirection: "row", gap: 10, minHeight: 112 }, rail: { width: 34, alignItems: "center", position: "relative" }, railLine: { position: "absolute", top: 33, bottom: -4, width: 1, backgroundColor: C.line },
  icon: { width: 32, height: 32, borderRadius: 12, backgroundColor: "#EAF0E4", alignItems: "center", justifyContent: "center", zIndex: 1 },
  event: { flex: 1, gap: 6, padding: 12 }, eventTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }, group: { color: C.green, fontSize: 9, fontWeight: "900", flex: 1 }, time: { color: C.muted, fontSize: 8 }, title: { color: C.ink, fontSize: 12, fontWeight: "900" }, description: { color: C.muted, fontSize: 10, lineHeight: 15 }, actor: { color: C.green, fontSize: 9, fontWeight: "800", marginTop: 1 }, empty: { alignItems: "center", gap: 8, padding: 20 }, foot: { textAlign: "center", color: C.muted, fontSize: 9, marginTop: 5 },
});
