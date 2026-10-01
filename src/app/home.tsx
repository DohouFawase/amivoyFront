import { fetchGroupActivities, fetchNotifications, fetchTrips } from "@/actions/tripActions";
import { fetchOutings } from "@/actions/groupActions";
import { AppIcon } from "@/components/app-icon";
import { AppText } from "@/components/app-text";
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
import { formatXof } from "@/data/currency";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import type { ActivityRecord, PublicTripRecord, TripRecord } from "@/interface/trips";
import { tripsService } from "@/services/tripsService";
import { Link, router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

const avatarColors = ["#D9E8D3", "#F2DCD2", "#DFE5F0", "#EAE2C8"];
const fallbackTripImage = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=85";

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isTripActive(trip: TripRecord, today: string) {
  if (trip.start_date && trip.end_date) return trip.start_date <= today && trip.end_date >= today;
  return /en cours|active/i.test(trip.status ?? "");
}

function isTripUpcoming(trip: TripRecord, today: string) {
  if (trip.start_date) return trip.start_date > today;
  return /à venir|préparer|planifi/i.test(trip.status ?? "");
}

function tripCardData(trip: TripRecord) {
  return {
    id: trip.id,
    title: trip.title || trip.name,
    destination: trip.destination ?? trip.destination_label ?? "Destination à définir",
    dates: trip.dates ?? trip.display_dates ?? "Dates à définir",
    days: trip.duration_days ?? trip.days ?? 1,
    people: trip.people ?? trip.members.length,
    image: trip.cover_url ?? trip.image ?? fallbackTripImage,
    status: trip.status ?? "À préparer",
  };
}

function tripActivities(trip: TripRecord): ActivityRecord[] {
  return (trip.stops ?? []).flatMap((stop) => stop.activityItems ?? []);
}

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const trips = useAppSelector((state) => state.trips.trips);
  const tripError = useAppSelector((state) => state.trips.error);
  const groupActivities = useAppSelector((state) => state.trips.groupActivities);
  const notifications = useAppSelector((state) => state.trips.notifications);
  const outings = useAppSelector((state) => state.groups.outings);
  const groupError = useAppSelector((state) => state.groups.error);
  const [discoverTrips, setDiscoverTrips] = useState<PublicTripRecord[]>([]);
  const [discoverError, setDiscoverError] = useState("");
  const [loading, setLoading] = useState(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    const discoveryLoad = tripsService.fetchDiscoverTrips().then((items) => {
      if (active) {
        setDiscoverTrips(items);
        setDiscoverError("");
      }
    }).catch(() => {
      if (active) setDiscoverError("Les voyages publics ne sont pas disponibles pour le moment.");
    });
    void Promise.allSettled([
      dispatch(fetchTrips()).unwrap(),
      dispatch(fetchOutings()).unwrap(),
      dispatch(fetchGroupActivities()).unwrap(),
      dispatch(fetchNotifications()).unwrap(),
      discoveryLoad,
    ]).then(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [dispatch]));

  const today = localDateKey();
  const activeTrip = trips.find((trip) => isTripActive(trip, today));
  const nextTrip = trips
    .filter((trip) => isTripUpcoming(trip, today))
    .sort((a, b) => (a.start_date ?? "9999-12-31").localeCompare(b.start_date ?? "9999-12-31"))[0];
  const focusTrip = activeTrip ?? nextTrip;
  const nextOutings = useMemo(() => outings.filter((outing) => !outing.ended).slice(0, 2), [outings]);
  const upcomingTrips = useMemo(
    () => trips.filter((trip) => trip.id !== focusTrip?.id && isTripUpcoming(trip, today)).slice(0, 5),
    [trips, focusTrip?.id, today],
  );
  const latestActivity = groupActivities[0];
  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const activities = focusTrip ? tripActivities(focusTrip) : [];
  const todaysActivity = activities.find((activity) => activity.starts_at?.slice(0, 10) === today)
    ?? activities.filter((activity) => activity.starts_at && activity.starts_at.slice(0, 10) >= today)
      .sort((a, b) => (a.starts_at ?? "").localeCompare(b.starts_at ?? ""))[0]
    ?? activities[0];
  const activeDays = focusTrip?.duration_days ?? focusTrip?.days ?? null;
  const elapsedDays = focusTrip?.start_date && activeDays
    ? Math.max(0, Math.min(activeDays, Math.floor((new Date(`${today}T00:00:00`).getTime() - new Date(`${focusTrip.start_date}T00:00:00`).getTime()) / 86_400_000) + 1))
    : null;
  const plannedBudget = focusTrip?.planned_budget ?? focusTrip?.budget ?? 0;
  const spent = focusTrip?.spent;
  const budgetPercent = plannedBudget > 0 && spent !== null && spent !== undefined
    ? `${Math.round((spent / plannedBudget) * 100)} %`
    : "—";
  const memberNames = focusTrip?.members ?? [];
  const displayedOutings = nextOutings;

  return (
    <View style={{ flex: 1, backgroundColor: C.cream }}>
      <Page>
        <Header
          title=""
          right={
            <Pressable onPress={() => router.push("/notifications")} style={styles.bell} accessibilityRole="button" accessibilityLabel={`Notifications${unreadCount ? `, ${unreadCount} non lue(s)` : ""}`}>
              <AppIcon name="bell" size={19} />
              {unreadCount > 0 && <View style={styles.dot} />}
            </Pressable>
          }
        />
        <View style={s.hero}>
          <Eyebrow>BIENVENUE, {(user?.first_name ?? "VOYAGEUR").toLocaleUpperCase()}</Eyebrow>
          <AppText style={s.heroTitle}>
            Prêt·e pour{"\n"}la prochaine{" "}
            <AppText style={{ color: C.green }}>aventure ?</AppText>
          </AppText>
          <AppText style={s.heroSub}>Les meilleurs souvenirs commencent à plusieurs.</AppText>
        </View>
        <Link href="/create-trip" asChild>
          <Pressable style={styles.prompt}>
            <View style={styles.promptIcon}><AppText style={{ fontSize: 21 }}>✳</AppText></View>
            <View style={{ flex: 1 }}>
              <AppText style={styles.promptTitle}>On part où cette fois ?</AppText>
              <AppText style={styles.promptSub}>Crée un voyage avec tes amis</AppText>
            </View>
            <AppText style={{ fontSize: 20, color: C.green }}>›</AppText>
          </Pressable>
        </Link>
        <Link href="/create-outing" asChild>
          <Pressable style={styles.outingPrompt}>
            <AppIcon name="outing" size={23} />
            <View style={{ flex: 1 }}><AppText style={styles.promptTitle}>Juste une sortie ce soir ?</AppText><AppText style={styles.promptSub}>Inviter les amis, fixer le rendez-vous, garder les photos.</AppText></View>
            <AppText style={{ fontSize: 19, color: C.green }}>›</AppText>
          </Pressable>
        </Link>

        <SectionTitle title="Le fil de ta bande" action="Tout voir" href="/activity" />
        {latestActivity ? (
          <Link href={(latestActivity.href || "/activity") as never} asChild>
            <Pressable><Surface style={styles.activityCard}>
              <View style={styles.activityIcon}><AppIcon name={latestActivity.icon ?? "group"} size={19} /></View>
              <View style={{ flex: 1, gap: 4 }}>
                <Eyebrow>{(latestActivity.group_name || latestActivity.groupName).toLocaleUpperCase()}</Eyebrow>
                <AppText style={styles.activityTitle}>{latestActivity.title}</AppText>
                <AppText style={styles.activitySub}>{latestActivity.description || "Une nouvelle activité de ton groupe."}</AppText>
              </View>
              <AppText style={{ color: C.green, fontSize: 20 }}>›</AppText>
            </Surface></Pressable>
          </Link>
        ) : <Surface style={styles.empty}><AppText style={styles.emptyText}>{loading ? "Chargement du fil…" : "Les nouvelles de ta bande apparaîtront ici."}</AppText></Surface>}

        <SectionTitle title="Retrouver tes moments" />
        <View style={styles.libraryLinks}>
          <Link href="/my-trips" asChild><Pressable style={styles.libraryTile}><AppIcon name="trip" size={20} /><AppText style={styles.libraryLabel}>Voyages</AppText></Pressable></Link>
          <Link href="/outings" asChild><Pressable style={styles.libraryTile}><AppIcon name="outing" size={20} /><AppText style={styles.libraryLabel}>Sorties</AppText></Pressable></Link>
          <Link href="/memories" asChild><Pressable style={styles.libraryTile}><AppIcon name="journal" size={20} /><AppText style={styles.libraryLabel}>Souvenirs</AppText></Pressable></Link>
          <Link href="/circles" asChild><Pressable style={styles.libraryTile}><AppIcon name="group" size={20} /><AppText style={styles.libraryLabel}>Mon cercle</AppText></Pressable></Link>
        </View>

        <SectionTitle title="Tes sorties" action="Tout voir" href="/outings" />
        {displayedOutings.map((outing) => (
          <Link key={outing.id} href={{ pathname: "/outing/[id]", params: { id: outing.id } }} asChild>
            <Pressable><Surface style={styles.outingCard}>
              <View style={styles.outingPin}><AppIcon name="pin" size={19} /></View>
              <View style={{ flex: 1 }}>
                <Eyebrow>{outing.category} · {outing.date || "Date à confirmer"} · {outing.time || "Heure à confirmer"}</Eyebrow>
                <AppText style={styles.todayTitle}>{outing.title}</AppText>
                <AppText style={styles.todaySub}>{outing.place} · {outing.attending.length} participant(s)</AppText>
              </View>
              <AppText style={{ color: C.green, fontSize: 20 }}>›</AppText>
            </Surface></Pressable>
          </Link>
        ))}
        {!displayedOutings.length && <Surface style={styles.empty}><AppText style={styles.emptyText}>{loading ? "Chargement des sorties…" : "Aucune sortie à venir. Organise la prochaine avec ta bande."}</AppText></Surface>}

        <SectionTitle
          title={activeTrip ? "Ton voyage en cours" : "Ton prochain voyage"}
          action="Voir tout"
          href="/my-trips"
        />
        {focusTrip ? <>
          <TripCard trip={tripCardData(focusTrip)} />
          <View style={styles.stats}>
            <View style={styles.stat}><AppText style={styles.statNum}>{focusTrip.people}</AppText><AppText style={styles.statText}>voyageurs</AppText></View>
            <View style={styles.vDivider} />
            <View style={styles.stat}><AppText style={styles.statNum}>{elapsedDays !== null ? `${elapsedDays} / ${activeDays}` : "—"}</AppText><AppText style={styles.statText}>jours écoulés</AppText></View>
            <View style={styles.vDivider} />
            <View style={styles.stat}><AppText style={styles.statNum}>{budgetPercent}</AppText><AppText style={styles.statText}>du budget</AppText></View>
          </View>
          <Surface style={styles.today}>
            <View style={s.row}>
              <View style={styles.sun}><AppText style={{ fontSize: 19 }}>☀</AppText></View>
              <View style={{ flex: 1 }}>
                <Eyebrow>{todaysActivity ? "AU PROGRAMME / PROCHAINE ACTIVITÉ" : "ITINÉRAIRE DU VOYAGE"}</Eyebrow>
                <AppText style={styles.todayTitle}>{todaysActivity?.title ?? "Aucune activité planifiée"}</AppText>
                <AppText style={styles.todaySub}>
                  {todaysActivity
                    ? [todaysActivity.time_label ?? todaysActivity.starts_at?.slice(11, 16), todaysActivity.location_label, todaysActivity.estimated_cost != null ? formatXof(todaysActivity.estimated_cost) : null].filter(Boolean).join(" · ") || "Détails à confirmer"
                    : focusTrip.destination ?? focusTrip.destination_label ?? "Ajoute des activités à l’itinéraire."}
                </AppText>
              </View>
              <Link href={{ pathname: "/trip/[id]/itinerary", params: { id: focusTrip.id } }}><AppText style={{ color: C.green, fontSize: 21 }}>›</AppText></Link>
            </View>
            <View style={s.divider} />
            <View style={styles.tripPeople}>
              <View style={{ flexDirection: "row" }}>
                {memberNames.slice(0, 4).map((name, index) => (
                  <View key={`${focusTrip.id}-${name}`} style={[styles.avatar, { backgroundColor: avatarColors[index % avatarColors.length], marginLeft: index === 0 ? 0 : -7 }]}>
                    <AppText style={{ fontSize: 11, fontWeight: "800", color: C.ink }}>{name.slice(0, 1).toLocaleUpperCase()}</AppText>
                  </View>
                ))}
              </View>
              <AppText style={styles.peopleText}>{memberNames.length ? `${memberNames.length} membre(s) dans ce voyage` : `${focusTrip.people} voyageur(s) prévu(s)`}</AppText>
            </View>
          </Surface>
          {spent !== null && spent !== undefined && <AppText style={styles.spent}>Dépenses enregistrées : {formatXof(spent)}{plannedBudget > 0 ? ` sur ${formatXof(plannedBudget)}` : ""}</AppText>}
        </> : <Surface style={styles.empty}><AppText style={styles.emptyText}>{loading ? "Chargement de tes voyages…" : "Tu n’as pas encore de voyage en cours ou à venir."}</AppText><Link href="/create-trip" style={styles.emptyLink}>Créer un voyage ›</Link></Surface>}

        <SectionTitle title="Tes prochaines escapades" action="Tout voir" href="/my-trips" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 4 }}>
          {upcomingTrips.map((trip) => <TripCard key={trip.id} trip={tripCardData(trip)} compact />)}
          {!upcomingTrips.length && <AppText style={styles.emptyText}>{loading ? "Chargement…" : "Aucune autre escapade prévue pour le moment."}</AppText>}
        </ScrollView>

        <SectionTitle title="Un peu d’inspiration" action="Explorer" href="/explore" />
        {discoverTrips.length ? discoverTrips.slice(0, 3).map((trip) => (
          <Link key={trip.id} href="/explore" asChild>
            <Pressable><Surface style={styles.inspire}>
              <AppIcon name="star" size={28} />
              <View style={{ flex: 1 }}>
                <AppText style={{ fontSize: 14, fontWeight: "800", color: C.ink }}>{trip.name}</AppText>
                <AppText style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{[trip.destination_label, trip.start_date && trip.end_date ? `${trip.start_date} — ${trip.end_date}` : null].filter(Boolean).join(" · ") || trip.description || "Voyage partagé par la communauté"}</AppText>
              </View>
              <AppText style={{ color: C.green }}>›</AppText>
            </Surface></Pressable>
          </Link>
        )) : <Surface style={styles.empty}><AppText style={styles.emptyText}>{discoverError || (loading ? "Chargement des voyages à découvrir…" : "Aucun voyage public à découvrir pour le moment.")}</AppText></Surface>}
        {!!tripError && <AppText style={styles.error}>{tripError}</AppText>}
        {!!groupError && <AppText style={styles.error}>{groupError}</AppText>}
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
  bell: { width: 38, height: 38, borderRadius: 14, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  dot: { position: "absolute", right: 8, top: 7, width: 7, height: 7, backgroundColor: C.orange, borderRadius: 5 },
  prompt: { backgroundColor: C.lime, borderRadius: 19, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  promptIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: "rgba(255,255,255,.55)", alignItems: "center", justifyContent: "center" },
  promptTitle: { fontWeight: "800", fontSize: 14, color: C.ink },
  outingPrompt: { backgroundColor: "#EEF3E9", borderRadius: 19, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  outingCard: { flexDirection: "row", alignItems: "center", gap: 11, padding: 13 },
  libraryLinks: { flexDirection: "row", gap: 8 },
  libraryTile: { flex: 1, minHeight: 74, borderRadius: 16, backgroundColor: C.white, alignItems: "center", justifyContent: "center", gap: 7, borderWidth: 1, borderColor: C.line },
  libraryLabel: { fontSize: 10, color: C.ink, fontWeight: "800" },
  outingPin: { width: 40, height: 40, borderRadius: 14, backgroundColor: "#EEF3E9", alignItems: "center", justifyContent: "center" },
  promptSub: { fontSize: 11, color: "#64715A", marginTop: 3 },
  stats: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 16, backgroundColor: "#fff", borderRadius: 18 },
  stat: { alignItems: "center", gap: 3 },
  statNum: { fontSize: 16, fontWeight: "900", color: C.ink },
  statText: { fontSize: 10, color: C.muted },
  vDivider: { width: 1, backgroundColor: C.line },
  today: { gap: 13 },
  sun: { width: 43, height: 43, borderRadius: 15, backgroundColor: "#FBEDC9", alignItems: "center", justifyContent: "center" },
  todayTitle: { fontSize: 16, fontWeight: "800", color: C.ink, marginTop: 5 },
  todaySub: { fontSize: 11, color: C.muted, marginTop: 3 },
  tripPeople: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 30, height: 30, borderRadius: 12, borderWidth: 2, borderColor: "#fff", alignItems: "center", justifyContent: "center" },
  peopleText: { fontSize: 11, color: C.muted },
  inspire: { flexDirection: "row", alignItems: "center", gap: 12 },
  empty: { gap: 8, padding: 14 },
  emptyText: { color: C.muted, fontSize: 11, lineHeight: 16 },
  emptyLink: { color: C.green, fontSize: 11, fontWeight: "900" },
  spent: { color: C.muted, fontSize: 10, textAlign: "right" },
  error: { color: "#A7493C", fontSize: 11, fontWeight: "800" },
});
