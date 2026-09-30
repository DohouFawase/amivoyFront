import { AppText, AppTextInput } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  BottomBar,
  C,
  Header,
  Page,
  Pill,
  Surface,
  s,
} from "@/components/app-ui";
import { initialPacking } from "@/data/mock";
type Item = { id: string; label: string; category: string; done: boolean };
export default function Packing() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [items, setItems] = useState<Item[]>(initialPacking);
  const [value, setValue] = useState("");
  const done = items.filter((x) => x.done).length;
  function add() {
    if (!value.trim()) return;
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        label: value.trim(),
        category: "À préparer",
        done: false,
      },
    ]);
    setValue("");
  }
  return (
    <View style={{ flex: 1, backgroundColor: C.cream }}>
      <Page>
        <Header back title="Liste de voyage" />
        <AppText style={{ fontSize: 27, fontWeight: "900", color: C.ink }}>
          On n’oublie rien.
        </AppText>
        <AppText style={{ fontSize: 12, color: C.muted, marginTop: -13 }}>
          Voyage {id} · checklist partagée
        </AppText>
        <Surface style={st.progress}>
          <View style={st.top}>
            <AppText style={{ fontSize: 13, fontWeight: "800", color: C.ink }}>
              La valise de l’équipe
            </AppText>
            <AppText style={{ fontSize: 12, fontWeight: "800", color: C.green }}>
              {done}/{items.length}
            </AppText>
          </View>
          <View style={st.track}>
            <View
              style={[st.fill, { width: `${(done / items.length) * 100}%` }]}
            />
          </View>
          <AppText style={{ fontSize: 10, color: C.muted, marginTop: 7 }}>
            {done === items.length
              ? "Tout est prêt !"
              : `${items.length - done} choses restent à préparer`}
          </AppText>
        </Surface>
        <View style={st.addRow}>
          <AppTextInput
            value={value}
            onChangeText={setValue}
            onSubmitEditing={add}
            placeholder="Ajouter quelque chose…"
            placeholderTextColor="#98A198"
            style={[s.input, { flex: 1 }]}
          />
          <Pressable onPress={add} style={st.add}>
            <AppText style={{ fontSize: 22, color: "#fff" }}>＋</AppText>
          </Pressable>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pill active>Tout</Pill>
          <Pill>À prendre</Pill>
          <Pill>Déjà prêt</Pill>
        </View>
        {items.map((item) => (
          <Pressable
            key={item.id}
            onPress={() =>
              setItems(
                items.map((x) =>
                  x.id === item.id ? { ...x, done: !x.done } : x,
                ),
              )
            }
          >
            <Surface style={st.item}>
              <View style={[st.check, item.done && st.checked]}>
                {item.done && (
                  <AppText style={{ color: "#fff", fontSize: 12 }}>✓</AppText>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <AppText style={[st.itemText, item.done && st.itemDone]}>
                  {item.label}
                </AppText>
                <AppText style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>
                  {item.category}
                </AppText>
              </View>
              <AppText style={{ fontSize: 15, color: "#A1AAA2" }}>⋮</AppText>
            </Surface>
          </Pressable>
        ))}
        <Surface style={st.tip}>
          <AppIcon name="lightbulb" size={19} />
          <AppText style={{ fontSize: 11, color: C.ink, flex: 1, lineHeight: 17 }}>
            Astuce : les éléments cochés sont visibles par tous les voyageurs.
          </AppText>
        </Surface>
      </Page>
      <BottomBar />
    </View>
  );
}
const st = StyleSheet.create({
  progress: { gap: 9 },
  top: { flexDirection: "row", justifyContent: "space-between" },
  track: {
    height: 8,
    backgroundColor: C.pale,
    borderRadius: 8,
    overflow: "hidden",
  },
  fill: { height: 8, backgroundColor: C.green, borderRadius: 8 },
  addRow: { flexDirection: "row", gap: 8 },
  add: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: C.green,
    alignItems: "center",
    justifyContent: "center",
  },
  item: { flexDirection: "row", alignItems: "center", gap: 12, padding: 13 },
  check: {
    width: 23,
    height: 23,
    borderWidth: 1.5,
    borderColor: "#CDD5CA",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checked: { backgroundColor: C.green, borderColor: C.green },
  itemText: { fontSize: 12, color: C.ink, fontWeight: "700" },
  itemDone: { textDecorationLine: "line-through", color: "#9CA59C" },
  tip: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    backgroundColor: "#F1F4E9",
  },
});
