import { AppText } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { Pressable, StyleSheet, View } from "react-native";
import { Link } from "expo-router";
import { useState } from "react";
import {
  BottomBar,
  C,
  Header,
  Page,
  SectionTitle,
  Surface,
} from "@/components/app-ui";
const notes = [
  {
    icon: "♡",
    color: "#F5E1DA",
    title: "Mariam a commenté une activité",
    body: "« On pourrait ajouter une pause glace ici »",
    time: "Il y a 12 min",
    unread: true,
  },
  {
    icon: "payments",
    color: "#E8EFDD",
    title: "Nouvelle dépense ajoutée",
    body: "Amadou a payé 15 750 FCFA au café Zenith.",
    time: "Il y a 1 h",
    unread: true,
  },
  {
    icon: "✦",
    color: "#F5EED8",
    title: "Un souvenir a été ajouté",
    body: "Yann a partagé une photo dans le carnet de Porto.",
    time: "Hier",
    unread: false,
  },
  {
    icon: "✓",
    color: "#E3E9EE",
    title: "Le sondage est terminé",
    body: "La visite de Livraria Lello est confirmée !",
    time: "Hier",
    unread: false,
  },
];
export default function Notifications() {
  const [read, setRead] = useState(false);
  return (
    <View style={{ flex: 1, backgroundColor: C.cream }}>
      <Page>
        <Header
          title="Notifications"
          right={
            <Pressable onPress={() => setRead(true)}><AppText style={{ fontSize: 10, color: C.green, fontWeight: "800" }}>Tout lire</AppText></Pressable>
          }
        />
        <AppText style={{ fontSize: 28, fontWeight: "900", color: C.ink }}>
          À ne pas manquer.
        </AppText>
        <AppText style={{ fontSize: 12, color: C.muted, marginTop: -13 }}>
          Les nouvelles de ta bande et de tes voyages.
        </AppText>
        <Link href={"/activity" as any} style={{ textAlign: "center", padding: 12, fontSize: 11, color: C.green, fontWeight: "800" }}>Voir le fil du groupe →</Link>
        <SectionTitle title="Aujourd’hui" />
        <View style={{ gap: 9 }}>
          {notes.slice(0, 2).map((n, i) => (
            <Surface
              key={n.title}
              style={[st.note, n.unread && !read && { borderColor: "#D9E6CB" }]}
            >
              <View style={[st.icon, { backgroundColor: n.color }]}>
                <AppIcon name={n.icon} size={18} color={C.green} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <AppText style={{ fontSize: 12, fontWeight: "800", color: C.ink }}>
                  {n.title}
                </AppText>
                <AppText style={{ fontSize: 11, color: C.muted, lineHeight: 16 }}>
                  {n.body}
                </AppText>
                <AppText style={{ fontSize: 9, color: "#9AA39A" }}>{n.time}</AppText>
              </View>
              {n.unread && !read && <View style={st.dot} />}
            </Surface>
          ))}
        </View>
        <SectionTitle title="Cette semaine" />
        <View style={{ gap: 9 }}>
          {notes.slice(2).map((n) => (
            <Surface key={n.title} style={st.note}>
              <View style={[st.icon, { backgroundColor: n.color }]}>
                <AppIcon name={n.icon} size={18} color={C.green} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <AppText style={{ fontSize: 12, fontWeight: "800", color: C.ink }}>
                  {n.title}
                </AppText>
                <AppText style={{ fontSize: 11, color: C.muted, lineHeight: 16 }}>
                  {n.body}
                </AppText>
                <AppText style={{ fontSize: 9, color: "#9AA39A" }}>{n.time}</AppText>
              </View>
            </Surface>
          ))}
        </View>
        <Link href="/settings" style={{ textAlign: "center", padding: 14, fontSize: 11, color: C.green, fontWeight: "800" }}>Gérer mes préférences de notification ›</Link>
      </Page>
      <BottomBar active="notifications" />
    </View>
  );
}
const st = StyleSheet.create({
  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    padding: 13,
  },
  icon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.green,
    marginTop: 4,
  },
  settings: { alignItems: "center", padding: 14 },
});
