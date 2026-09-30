import { AppText } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { Link, router } from "expo-router";
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
import { trips } from "@/data/mock";
import { getDemoUser } from "@/data/demo-session";
import { getOuting } from "@/data/outings";
import { listGroupActivities } from "@/data/group-activity";

const people = [
  { name: "Amadou", color: "#D9E8D3", initial: "A" },
  { name: "Mariam", color: "#F2DCD2", initial: "M" },
  { name: "Yann", color: "#DFE5F0", initial: "Y" },
  { name: "Toi", color: "#EAE2C8", initial: "S" },
];
export default function HomeScreen() {
  const user = getDemoUser();
  const eveningOuting = getOuting("place-etoile-demo");
  const latestActivity = listGroupActivities()[0];
  return (
    <View style={{ flex: 1, backgroundColor: C.cream }}>
      <Page>
        <Header
          title=""
          right={
            <Pressable onPress={() => router.push("/notifications")} style={styles.bell}>
              <AppText style={{ fontSize: 18 }}>♧</AppText>
              <View style={styles.dot} />
            </Pressable>
          }
        />
        <View style={s.hero}>
          <Eyebrow>BIENVENUE, {user.firstName.toLocaleUpperCase()}</Eyebrow>
          <AppText style={s.heroTitle}>
            Prêt·e pour{"\n"}la prochaine{" "}
            <AppText style={{ color: C.green }}>aventure ?</AppText>
          </AppText>
          <AppText style={s.heroSub}>
            Les meilleurs souvenirs commencent à plusieurs.
          </AppText>
        </View>
        <Link href="/create-trip" asChild>
          <Pressable style={styles.prompt}>
            <View style={styles.promptIcon}>
              <AppText style={{ fontSize: 21 }}>✳</AppText>
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={styles.promptTitle}>On part où cette fois ?</AppText>
              <AppText style={styles.promptSub}>Crée un voyage avec tes amis</AppText>
            </View>
            <AppText style={{ fontSize: 20, color: C.green }}>›</AppText>
          </Pressable>
        </Link>
        <Link href="/create-outing?place=Place%20de%20l’Étoile%2C%20Cotonou" asChild>
          <Pressable style={styles.outingPrompt}>
            <AppIcon name="outing" size={23} />
            <View style={{flex:1}}><AppText style={styles.promptTitle}>Juste une sortie ce soir ?</AppText><AppText style={styles.promptSub}>Inviter les amis, fixer le rendez-vous, garder les photos.</AppText></View>
            <AppText style={{fontSize:19,color:C.green}}>›</AppText>
          </Pressable>
        </Link>
        {eveningOuting && <Link href={{pathname:"/outing/[id]",params:{id:eveningOuting.id}} as any} asChild><Pressable><Surface style={styles.outingCard}><View style={styles.outingPin}><AppIcon name="pin" size={19} /></View><View style={{flex:1}}><Eyebrow>SORTIE DÉMO · {eveningOuting.time}</Eyebrow><AppText style={styles.todayTitle}>{eveningOuting.title}</AppText><AppText style={styles.todaySub}>{eveningOuting.place} · {eveningOuting.attending.length} amis partants</AppText></View><AppText style={{color:C.green,fontSize:20}}>›</AppText></Surface></Pressable></Link>}
        <SectionTitle title="Le fil de ta bande" action="Tout voir" href={"/activity" as any} />
        <Link href={"/activity" as any} asChild><Pressable><Surface style={styles.activityCard}><View style={styles.activityIcon}><AppIcon name={latestActivity.icon} size={19} /></View><View style={{ flex: 1, gap: 4 }}><Eyebrow>{latestActivity.groupName.toLocaleUpperCase()}</Eyebrow><AppText style={styles.activityTitle}>{latestActivity.title}</AppText><AppText style={styles.activitySub}>{latestActivity.description}</AppText></View><AppText style={{ color: C.green, fontSize: 20 }}>›</AppText></Surface></Pressable></Link>
        <SectionTitle title="Retrouver tes moments" />
        <View style={styles.libraryLinks}>
          <Link href="/my-trips" asChild><Pressable style={styles.libraryTile}><AppIcon name="trip" size={20} /><AppText style={styles.libraryLabel}>Voyages</AppText></Pressable></Link>
          <Link href="/outings" asChild><Pressable style={styles.libraryTile}><AppIcon name="outing" size={20} /><AppText style={styles.libraryLabel}>Sorties</AppText></Pressable></Link>
          <Link href="/memories" asChild><Pressable style={styles.libraryTile}><AppIcon name="journal" size={20} /><AppText style={styles.libraryLabel}>Souvenirs</AppText></Pressable></Link>
          <Link href="/circles" asChild><Pressable style={styles.libraryTile}><AppIcon name="group" size={20} /><AppText style={styles.libraryLabel}>Mon cercle</AppText></Pressable></Link>
        </View>
        <SectionTitle title="Tes sorties" action="Tout voir" href="/outings" />
        <SectionTitle
          title="Ton voyage en cours"
          action="Voir tout"
          href="/my-trips"
        />
        <TripCard trip={trips[0]} />
        <View style={styles.stats}>
          <View style={styles.stat}>
            <AppText style={styles.statNum}>4</AppText>
            <AppText style={styles.statText}>voyageurs</AppText>
          </View>
          <View style={styles.vDivider} />
          <View style={styles.stat}>
            <AppText style={styles.statNum}>3 / 6</AppText>
            <AppText style={styles.statText}>jours écoulés</AppText>
          </View>
          <View style={styles.vDivider} />
          <View style={styles.stat}>
            <AppText style={styles.statNum}>40 %</AppText>
            <AppText style={styles.statText}>du budget</AppText>
          </View>
        </View>
        <Surface style={styles.today}>
          <View style={s.row}>
            <View style={styles.sun}>
              <AppText style={{ fontSize: 19 }}>☀</AppText>
            </View>
            <View style={{ flex: 1 }}>
              <Eyebrow>AU PROGRAMME AUJOURD’HUI</Eyebrow>
              <AppText style={styles.todayTitle}>Livraria Lello</AppText>
              <AppText style={styles.todaySub}>10:30 · 5 250 FCFA par personne</AppText>
            </View>
            <AppText style={{ color: C.green, fontSize: 21 }}>›</AppText>
          </View>
          <View style={s.divider} />
          <View style={styles.tripPeople}>
            <View style={{ flexDirection: "row" }}>
              {people.map((p) => (
                <View
                  key={p.name}
                  style={[
                    styles.avatar,
                    {
                      backgroundColor: p.color,
                      marginLeft: p.name === "Amadou" ? 0 : -7,
                    },
                  ]}
                >
                  <AppText
                    style={{ fontSize: 11, fontWeight: "800", color: C.ink }}
                  >
                    {p.initial}
                  </AppText>
                </View>
              ))}
            </View>
            <AppText style={styles.peopleText}>
              Vous êtes tous ensemble aujourd’hui
            </AppText>
          </View>
        </Surface>
        <SectionTitle
          title="Tes prochaines escapades"
          action="Tout voir"
          href="/explore"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 4 }}>
          {trips.slice(1).map((t) => (
            <TripCard key={t.id} trip={t} compact />
          ))}
        </ScrollView>
        <SectionTitle
          title="Un peu d’inspiration"
          action="Explorer"
          href="/explore"
        />
        <Surface style={styles.inspire}>
          <AppIcon name="star" size={28} />
          <View style={{ flex: 1 }}>
            <AppText style={{ fontSize: 14, fontWeight: "800", color: C.ink }}>
              Les couleurs de Chefchaouen
            </AppText>
            <AppText style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
              Maroc · 5 jours · 248 voyageurs inspirés
            </AppText>
          </View>
          <AppText style={{ color: C.green }}>♡</AppText>
        </Surface>
      </Page>
      <BottomBar active="home" />
    </View>
  );
}
const styles = StyleSheet.create({
  activityCard: { flexDirection: "row", alignItems: "center", gap: 11, padding: 13 },
  activityIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: "#EDF2E8", alignItems: "center", justifyContent: "center" },
  activityTitle: { color: C.ink, fontSize: 11, fontWeight: "900" },
  activitySub: { color: C.muted, fontSize: 9, lineHeight: 13 },
  bell: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    position: "absolute",
    right: 8,
    top: 7,
    width: 7,
    height: 7,
    backgroundColor: C.orange,
    borderRadius: 5,
  },
  prompt: {
    backgroundColor: C.lime,
    borderRadius: 19,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  promptIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  promptTitle: { fontWeight: "800", fontSize: 14, color: C.ink },
  outingPrompt: { backgroundColor: "#EEF3E9", borderRadius: 19, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  outingCard: { flexDirection: "row", alignItems: "center", gap: 11, padding: 13 },
  libraryLinks: { flexDirection: "row", gap: 8 },
  libraryTile: { flex: 1, minHeight: 74, borderRadius: 16, backgroundColor: C.white, alignItems: "center", justifyContent: "center", gap: 7, borderWidth: 1, borderColor: C.line },
  libraryLabel: { fontSize: 10, color: C.ink, fontWeight: "800" },
  outingPin: { width: 40, height: 40, borderRadius: 14, backgroundColor: "#EEF3E9", alignItems: "center", justifyContent: "center" },
  promptSub: { fontSize: 11, color: "#64715A", marginTop: 3 },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderRadius: 18,
  },
  stat: { alignItems: "center", gap: 3 },
  statNum: { fontSize: 16, fontWeight: "900", color: C.ink },
  statText: { fontSize: 10, color: C.muted },
  vDivider: { width: 1, backgroundColor: C.line },
  today: { gap: 13 },
  sun: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: "#FBEDC9",
    alignItems: "center",
    justifyContent: "center",
  },
  todayTitle: { fontSize: 16, fontWeight: "800", color: C.ink, marginTop: 5 },
  todaySub: { fontSize: 11, color: C.muted, marginTop: 3 },
  tripPeople: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  peopleText: { fontSize: 11, color: C.muted },
  inspire: { flexDirection: "row", alignItems: "center", gap: 12 },
});
