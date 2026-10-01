import { AppIcon } from "@/components/app-icon";
import { AppText, AppTextInput } from "@/components/app-text";
import { BottomBar, C, Header, Page, Pill, Surface, s } from "@/components/app-ui";
import { tripsService } from "@/services/tripsService";
import type { PackingItemRecord } from "@/interface/trips";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

export default function Packing() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [items, setItems] = useState<PackingItemRecord[]>([]);
  const [value, setValue] = useState("");
  const [filter, setFilter] = useState<"all" | "todo" | "done">("all");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    tripsService.fetchPackingItems(id)
      .then((loadedItems) => { if (active) { setItems(loadedItems); setError(""); } })
      .catch(() => { if (active) setError("La checklist n’a pas pu être chargée. Vérifie ta connexion puis réessaie."); });
    return () => { active = false; };
  }, [id]);

  async function add() {
    const title = value.trim();
    if (!title || busy) return;
    setBusy(true);
    try {
      const item = await tripsService.createPackingItem({ trip_id: id, title, category: "À préparer" });
      setItems((current) => [...current, item]);
      setValue(""); setError("");
    } catch {
      setError("L’élément n’a pas pu être ajouté.");
    } finally { setBusy(false); }
  }

  async function toggle(item: PackingItemRecord) {
    try {
      const updated = await tripsService.updatePackingItem(item.id, { is_packed: !item.is_packed });
      setItems((current) => current.map((entry) => entry.id === item.id ? updated : entry));
      setError("");
    } catch { setError("Le changement n’a pas été enregistré."); }
  }

  async function inspect(item: PackingItemRecord) {
    try { const detail = await tripsService.fetchPackingItem(item.id); Alert.alert(detail.title, `${detail.category || "À préparer"} · quantité ${detail.quantity}${detail.notes ? `\n${detail.notes}` : ""}`); }
    catch { setError("Le détail de cet élément n’a pas pu être chargé."); }
  }

  async function remove(item: PackingItemRecord) {
    try {
      await tripsService.deletePackingItem(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    } catch { setError("L’élément n’a pas pu être supprimé."); }
  }

  const done = items.filter((item) => item.is_packed).length;
  const visible = items.filter((item) => filter === "all" || (filter === "done" ? item.is_packed : !item.is_packed));
  return (
    <View style={{ flex: 1, backgroundColor: C.cream }}>
      <Page>
        <Header back title="Liste de voyage" />
        <AppText style={{ fontSize: 27, fontWeight: "900", color: C.ink }}>On n’oublie rien.</AppText>
        <AppText style={{ fontSize: 12, color: C.muted, marginTop: -13 }}>Voyage · checklist partagée et enregistrée</AppText>
        <Surface style={st.progress}>
          <View style={st.top}><AppText style={{ fontSize: 13, fontWeight: "800", color: C.ink }}>La valise de l’équipe</AppText><AppText style={{ fontSize: 12, fontWeight: "800", color: C.green }}>{done}/{items.length}</AppText></View>
          <View style={st.track}><View style={[st.fill, { width: `${items.length ? done / items.length * 100 : 0}%` }]} /></View>
          <AppText style={{ fontSize: 10, color: C.muted, marginTop: 7 }}>{items.length > 0 && done === items.length ? "Tout est prêt !" : `${items.length - done} choses restent à préparer`}</AppText>
        </Surface>
        <View style={st.addRow}>
          <AppTextInput value={value} onChangeText={setValue} onSubmitEditing={() => void add()} returnKeyType="done" placeholder="Ajouter quelque chose…" placeholderTextColor="#98A198" style={[s.input, { flex: 1 }]} />
          <Pressable onPress={() => void add()} disabled={busy} style={st.add}><AppText style={{ fontSize: 22, color: "#fff" }}>＋</AppText></Pressable>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pill active={filter === "all"} onPress={() => setFilter("all")}>Tout</Pill>
          <Pill active={filter === "todo"} onPress={() => setFilter("todo")}>À prendre</Pill>
          <Pill active={filter === "done"} onPress={() => setFilter("done")}>Déjà prêt</Pill>
        </View>
        {!!error && <AppText accessibilityRole="alert" style={st.error}>{error}</AppText>}
        {visible.map((item) => (
          <Surface key={item.id} style={st.item}>
            <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: item.is_packed }} onPress={() => void toggle(item)} style={[st.check, item.is_packed && st.checked]}>{item.is_packed && <AppText style={{ color: "#fff", fontSize: 12 }}>✓</AppText>}</Pressable>
            <Pressable onPress={() => void inspect(item)} style={{ flex: 1 }}><AppText style={[st.itemText, item.is_packed && st.itemDone]}>{item.title}</AppText><AppText style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{item.category || "À préparer"}{item.quantity > 1 ? ` · quantité ${item.quantity}` : ""} · Détails</AppText></Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={`Supprimer ${item.title}`} onPress={() => void remove(item)}><AppIcon name="close" size={17} color="#A1AAA2" /></Pressable>
          </Surface>
        ))}
        {!visible.length && <Surface><AppText style={{ fontSize: 11, color: C.muted }}>{items.length ? "Aucun élément dans ce filtre." : "Ta checklist est vide. Ajoute les premières choses à emporter."}</AppText></Surface>}
        <Surface style={st.tip}><AppIcon name="lightbulb" size={19} /><AppText style={{ fontSize: 11, color: C.ink, flex: 1, lineHeight: 17 }}>Les éléments et leur état sont partagés avec les voyageurs autorisés.</AppText></Surface>
      </Page>
      <BottomBar />
    </View>
  );
}
const st = StyleSheet.create({ progress: { gap: 9 }, top: { flexDirection: "row", justifyContent: "space-between" }, track: { height: 8, backgroundColor: C.pale, borderRadius: 8, overflow: "hidden" }, fill: { height: 8, backgroundColor: C.green, borderRadius: 8 }, addRow: { flexDirection: "row", gap: 8 }, add: { width: 48, height: 48, borderRadius: 15, backgroundColor: C.green, alignItems: "center", justifyContent: "center" }, item: { flexDirection: "row", alignItems: "center", gap: 12, padding: 13 }, check: { width: 23, height: 23, borderWidth: 1.5, borderColor: "#CDD5CA", borderRadius: 8, alignItems: "center", justifyContent: "center" }, checked: { backgroundColor: C.green, borderColor: C.green }, itemText: { fontSize: 12, color: C.ink, fontWeight: "700" }, itemDone: { textDecorationLine: "line-through", color: "#9CA59C" }, tip: { flexDirection: "row", gap: 10, alignItems: "center", backgroundColor: "#F1F4E9" }, error: { color: "#A7493C", fontSize: 11, fontWeight: "800" } });
