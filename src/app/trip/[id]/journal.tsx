import { AppText, AppTextInput } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { BottomBar, C, Header, Page, Surface, s } from "@/components/app-ui";
import { journal } from "@/data/mock";
export default function Journal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [customEntries, setCustomEntries] = useState<{day:string;title:string;body:string;emoji:string}[]>([]);
  return (
    <View style={{ flex: 1, backgroundColor: C.cream }}>
      <Page>
        <Header
          back
          title="Carnet de voyage"
          right={
            <Pressable onPress={() => setAdding(!adding)}>
              <AppText style={{ color: C.green, fontSize: 22 }}>＋</AppText>
            </Pressable>
          }
        />
        <AppText style={{ fontSize: 27, fontWeight: "900", color: C.ink }}>
          Nos petits moments.
        </AppText>
        <AppText style={{ fontSize: 12, color: C.muted, marginTop: -13 }}>
          Voyage {id} · écrit à plusieurs, gardé pour toujours.
        </AppText>
        <Surface style={st.cover}>
          <AppIcon name="journal" size={35} />
          <AppText
            style={{
              fontSize: 16,
              fontWeight: "900",
              color: "#fff",
              marginTop: 12,
            }}
          >
            Le carnet de Porto
          </AppText>
          <AppText style={{ fontSize: 11, color: "#E9EDE6", marginTop: 4 }}>
            12 — 17 juin · 4 voyageurs
          </AppText>
        </Surface>
        {adding && (
          <Surface style={{ gap: 10 }}>
            <AppTextInput placeholder="Le titre du souvenir" style={s.input} value={title} onChangeText={setTitle} />
            <AppTextInput
              placeholder="Raconte ce moment…"
              multiline
              style={[s.input, { height: 90, textAlignVertical: "top" }]}
              value={body} onChangeText={setBody}
            />
            <Pressable onPress={() => { if (title.trim()) { setCustomEntries([{day:"NOUVEAU SOUVENIR · AUJOURD’HUI", title:title.trim(), body:body.trim() || "Un beau moment à garder avec le groupe.", emoji:"✨"}, ...customEntries]); setTitle(""); setBody(""); setAdding(false); } }} style={s.button}>
              <AppText style={s.buttonText}>Enregistrer le souvenir · démo</AppText>
            </Pressable>
          </Surface>
        )}
        <View style={st.timeline}>
          {[...customEntries, ...journal].map((entry, i) => (
            <View key={entry.day} style={st.entry}>
              <View style={st.rail}>
                <View style={st.dot} />
                {i < journal.length - 1 && <View style={st.line} />}
              </View>
              <View style={{ flex: 1, gap: 9 }}>
                <AppText
                  style={{
                    fontSize: 9,
                    color: C.green,
                    fontWeight: "900",
                    letterSpacing: 1.3,
                  }}
                >
                  {entry.day}
                </AppText>
                <Surface style={{ padding: 0, overflow: "hidden" }}>
                  <View style={st.photo}>
                    <AppIcon name={entry.emoji} size={42} color={C.white} />
                    <AppText
                      style={{
                        position: "absolute",
                        right: 12,
                        bottom: 12,
                        color: "#fff",
                        fontWeight: "700",
                      }}
                    >
                      Ribeira, Porto
                    </AppText>
                  </View>
                  <View style={{ padding: 14 }}>
                    <AppText
                      style={{ fontSize: 15, fontWeight: "900", color: C.ink }}
                    >
                      {entry.title}
                    </AppText>
                    <AppText
                      style={{
                        fontSize: 12,
                        color: C.muted,
                        lineHeight: 18,
                        marginTop: 7,
                      }}
                    >
                      {entry.body}
                    </AppText>
                    <View style={st.author}>
                      <View style={st.avatar}>
                        <AppText style={{ fontWeight: "800", fontSize: 10 }}>
                          A
                        </AppText>
                      </View>
                      <AppText style={{ fontSize: 10, color: C.muted }}>
                        Amadou · il y a 2 jours
                      </AppText>
                      <AppText style={{ marginLeft: "auto", color: C.green }}>
                        ♡ 12
                      </AppText>
                    </View>
                  </View>
                </Surface>
              </View>
            </View>
          ))}
        </View>
      </Page>
      <BottomBar />
    </View>
  );
}
const st = StyleSheet.create({
  cover: {
    height: 155,
    backgroundColor: C.green,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22,
  },
  timeline: { gap: 5 },
  entry: { flexDirection: "row", gap: 12 },
  rail: { width: 12, alignItems: "center" },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 6,
    backgroundColor: C.green,
    marginTop: 1,
  },
  line: { width: 2, backgroundColor: "#DCE5D5", flex: 1 },
  photo: {
    height: 145,
    backgroundColor: "#A6B9A1",
    alignItems: "center",
    justifyContent: "center",
  },
  author: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  avatar: {
    width: 25,
    height: 25,
    borderRadius: 9,
    backgroundColor: "#D9E8D3",
    alignItems: "center",
    justifyContent: "center",
  },
});
