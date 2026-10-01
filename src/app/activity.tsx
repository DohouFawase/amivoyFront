import { AppIcon } from "@/components/app-icon";
import { AppText, AppTextInput } from "@/components/app-text";
import { BottomBar, C, Header, Page, SectionTitle, Surface, s } from "@/components/app-ui";
import { fetchGroupActivities } from "@/actions/tripActions";
import { Link } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { tripsService } from "@/services/tripsService";
import { groupsService } from "@/services/groupsService";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import type { GroupActivityRecord } from "@/interface/trips";

type ActivityCategory = GroupActivityRecord["category"];
const filters: { key: ActivityCategory | "all"; label: string }[] = [
  { key: "all", label: "Tout" }, { key: "outing", label: "Sorties" },
  { key: "trip", label: "Voyages" }, { key: "circle", label: "Cercles" },
];

export default function GroupActivity() {
  const dispatch = useAppDispatch();
  const { groupActivities, error, requestStatus } = useAppSelector((state) => state.trips);
  const [filter, setFilter] = useState<ActivityCategory | "all">("all");
  const [category, setCategory] = useState<Exclude<ActivityCategory, "all">>("trip");
  const [groupId, setGroupId] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupOptions, setGroupOptions] = useState<{ id: string; name: string }[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const activities = filter === "all"
    ? groupActivities
    : groupActivities.filter((item) => item.category === filter);

  useEffect(() => {
    void dispatch(fetchGroupActivities());
  }, [dispatch]);
  useEffect(() => {
    let active = true;
    const load = category === "trip" ? tripsService.fetchTrips().then((xs) => xs.map((x) => ({ id: x.id, name: x.title || x.name })))
      : category === "circle" ? groupsService.fetchCircles().then((xs) => xs.map((x) => ({ id: x.id, name: x.name })))
      : groupsService.fetchOutings().then((xs) => xs.map((x) => ({ id: x.id, name: x.title })));
    void load.then((xs) => { if (active) setGroupOptions(xs); }).catch(() => { if (active) setGroupOptions([]); });
    return () => { active = false; };
  }, [category]);
  async function addActivity() {
    if (!groupId.trim() || !groupName.trim() || !title.trim() || saving) { setFormError("Renseigne le groupe et le titre."); return; }
    setSaving(true);
    try { await tripsService.createGroupActivity({ category, group_id: groupId.trim(), group_name: groupName.trim(), title: title.trim(), description: description.trim() || undefined }); await dispatch(fetchGroupActivities()).unwrap(); setTitle(""); setDescription(""); setFormError(""); }
    catch { setFormError("L’activité n’a pas été créée. Vérifie l’accès au voyage, cercle ou sortie indiqué."); }
    finally { setSaving(false); }
  }
  return <View style={{ flex: 1, backgroundColor: C.cream }}>
    <Page>
      <Header back title="Fil du groupe" />
      <AppText style={s.heroTitle}>La vie de ta bande, au même endroit.</AppText>
      <AppText style={s.heroSub}>Nouvelles sorties, voyages et changements dans tes cercles.</AppText>
      <SectionTitle title="Publier dans le fil du groupe" />
      <Surface style={{ gap: 8 }}>
        <View style={st.filters}>{(["trip", "circle", "outing"] as const).map((value) => <Pressable key={value} onPress={() => setCategory(value)} style={[st.filter, category === value && st.filterOn]}><AppText style={[st.filterText, category === value && st.filterTextOn]}>{value === "trip" ? "Voyage" : value === "circle" ? "Cercle" : "Sortie"}</AppText></Pressable>)}</View>
        <View style={st.groupChoices}>{groupOptions.map((group) => <Pressable key={group.id} onPress={() => { setGroupId(group.id); setGroupName(group.name); }} style={[st.filter, groupId === group.id && st.filterOn]}><AppText style={[st.filterText, groupId === group.id && st.filterTextOn]}>{group.name}</AppText></Pressable>)}</View>
        <AppTextInput value={groupId} onChangeText={setGroupId} autoCapitalize="none" placeholder="Identifiant du groupe" style={st.formInput} />
        <AppTextInput value={groupName} onChangeText={setGroupName} placeholder="Nom du groupe" style={st.formInput} />
        <AppTextInput value={title} onChangeText={setTitle} placeholder="Titre de l’actualité" style={st.formInput} />
        <AppTextInput value={description} onChangeText={setDescription} placeholder="Détail (facultatif)" style={st.formInput} />
        <Pressable onPress={() => void addActivity()} disabled={saving} style={st.publish}><AppText style={st.publishText}>{saving ? "Publication…" : "Publier"}</AppText></Pressable>
        {!!formError && <AppText style={st.error}>{formError}</AppText>}
      </Surface>
      <View style={st.filters}>{filters.map((item) => <Pressable key={item.key} onPress={() => setFilter(item.key)} style={[st.filter, filter === item.key && st.filterOn]}><AppText style={[st.filterText, filter === item.key && st.filterTextOn]}>{item.label}</AppText></Pressable>)}</View>
      <SectionTitle title="Activité récente" action={`${activities.length} événement${activities.length === 1 ? "" : "s"}`} />
      {!!error && <AppText style={st.error}>{error}</AppText>}
      {activities.length ? <View style={st.timeline}>{activities.map((item, index) => <View key={item.id} style={st.timelineItem}>
        <View style={st.rail}>{index < activities.length - 1 && <View style={st.railLine} />}<View style={st.icon}><AppIcon name={item.icon ?? "group"} size={19} color={C.green} /></View></View>
        <Link href={item.href as never} asChild><Pressable style={{ flex: 1 }}><Surface style={st.event}>
          <View style={st.eventTop}><AppText style={st.group}>{item.groupName}</AppText><AppText style={st.time}>{item.time}</AppText></View>
          <AppText style={st.title}>{item.title}</AppText><AppText style={st.description}>{item.description}</AppText>
          <AppText style={st.actor}>{item.actor} · Ouvrir →</AppText>
        </Surface></Pressable></Link>
      </View>)}</View> : requestStatus === "loading" ? <AppText style={st.description}>Chargement du fil…</AppText> : <Surface style={st.empty}><AppIcon name="group" size={27} /><AppText style={st.title}>Rien dans cette catégorie pour l’instant</AppText><AppText style={st.description}>Les nouveautés de tes groupes apparaîtront ici.</AppText></Surface>}
      <AppText style={st.foot}>Le fil affiche les événements enregistrés par le backend.</AppText>
    </Page>
    <BottomBar active="activity" />
  </View>;
}

const st = StyleSheet.create({
  groupChoices: { flexDirection: "row", flexWrap: "wrap", gap: 6 }, formInput: { minHeight: 42, borderRadius: 10, borderWidth: 1, borderColor: C.line, backgroundColor: C.white, paddingHorizontal: 11, color: C.ink, fontSize: 11 }, publish: { minHeight: 42, borderRadius: 10, backgroundColor: C.green, alignItems: "center", justifyContent: "center" }, publishText: { color: C.white, fontSize: 10, fontWeight: "900" },
  filters: { flexDirection: "row", gap: 7, flexWrap: "wrap" },
  filter: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 16, backgroundColor: C.white, borderWidth: 1, borderColor: C.line },
  filterOn: { backgroundColor: C.green, borderColor: C.green }, filterText: { fontSize: 10, color: C.ink, fontWeight: "800" }, filterTextOn: { color: C.white },
  timeline: { gap: 0 }, timelineItem: { flexDirection: "row", gap: 10, minHeight: 112 }, rail: { width: 34, alignItems: "center", position: "relative" }, railLine: { position: "absolute", top: 33, bottom: -4, width: 1, backgroundColor: C.line },
  icon: { width: 32, height: 32, borderRadius: 12, backgroundColor: "#EAF0E4", alignItems: "center", justifyContent: "center", zIndex: 1 },
  event: { flex: 1, gap: 6, padding: 12 }, eventTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }, group: { color: C.green, fontSize: 9, fontWeight: "900", flex: 1 }, time: { color: C.muted, fontSize: 8 }, title: { color: C.ink, fontSize: 12, fontWeight: "900" }, description: { color: C.muted, fontSize: 10, lineHeight: 15 }, actor: { color: C.green, fontSize: 9, fontWeight: "800", marginTop: 1 }, empty: { alignItems: "center", gap: 8, padding: 20 }, foot: { textAlign: "center", color: C.muted, fontSize: 9, marginTop: 5 }, error: { color: "#A7493C", fontSize: 11, fontWeight: "800" },
});
