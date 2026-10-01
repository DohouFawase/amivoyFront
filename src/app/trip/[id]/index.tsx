import { AppText, AppTextInput } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { Link, router, useLocalSearchParams } from "expo-router";
import { Alert, ImageBackground, Pressable, StyleSheet, View } from "react-native";
import {
  BottomBar,
  C,
  Header,
  Page,
  SectionTitle,
  Surface,
} from "@/components/app-ui";
import { trips } from "@/data/mock";
import { formatXof } from "@/data/currency";
import { useEffect, useState } from "react";
import { fetchTrip } from "@/actions/tripActions";
import { tripsService } from "@/services/tripsService";
import type { ActivityRecord, BudgetLineRecord, BudgetRecord, TripPlaceRecord } from "@/interface/trips";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
export default function TripDetail() {
  const [inviteNotice, setInviteNotice] = useState(false);
  const [editingTrip, setEditingTrip] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDestination, setEditDestination] = useState("");
  const [editDates, setEditDates] = useState("");
  const [editBudget, setEditBudget] = useState("");
  const [editVisibility, setEditVisibility] = useState<"private" | "public">("private");
  const [tripBusy, setTripBusy] = useState(false);
  const [tripActionError, setTripActionError] = useState("");
  const [stops, setStops] = useState<TripPlaceRecord[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [budgets, setBudgets] = useState<BudgetRecord[]>([]);
  const [budgetLines, setBudgetLines] = useState<BudgetLineRecord[]>([]);
  const dispatch = useAppDispatch();
  const { trips: apiTrips, requestStatus, error } = useAppSelector((state) => state.trips);
  const { id, destination, title } = useLocalSearchParams<{ id: string; destination?: string; title?: string }>();
  const isDraft = id === 'draft';
  useEffect(() => {
    if (isDraft) return;
    void dispatch(fetchTrip(id));
    void Promise.all([
      tripsService.fetchTripPlaces(id),
      tripsService.fetchActivities(id),
      tripsService.fetchBudgets(),
      tripsService.fetchBudgetLines(),
    ]).then(([tripStops, tripActivities, allBudgets, allLines]) => {
      setStops(tripStops);
      setActivities(tripActivities);
      const tripBudgetIds = new Set(allBudgets.filter((item) => item.trip_id === id).map((item) => item.id));
      setBudgets(allBudgets.filter((item) => item.trip_id === id));
      setBudgetLines(allLines.filter((item) => tripBudgetIds.has(item.budget_id)));
    }).catch(() => undefined);
  }, [dispatch, id, isDraft]);
  async function saveTripChanges() {
    if (!apiTrip || tripBusy) return;
    const cleanBudget = editBudget.trim().replace(/\s/g, "");
    const budgetValue = cleanBudget ? Number(cleanBudget) : null;
    if (!editTitle.trim() || !editDestination.trim()) { setTripActionError("Le nom et la destination sont obligatoires."); return; }
    if (cleanBudget && (!Number.isFinite(budgetValue) || budgetValue! < 0)) { setTripActionError("Saisis un budget valide en XOF."); return; }
    setTripBusy(true);
    try {
      await tripsService.updateTrip(apiTrip.id, {
        title: editTitle.trim(),
        destination_label: editDestination.trim(),
        display_dates: editDates.trim() || null,
        planned_budget: budgetValue,
        visibility: editVisibility,
      });
      await dispatch(fetchTrip(apiTrip.id)).unwrap();
      setEditingTrip(false); setTripActionError("");
    } catch { setTripActionError("Les modifications du voyage n’ont pas pu être enregistrées. Vérifie que tu en es organisateur."); }
    finally { setTripBusy(false); }
  }

  function beginEditTrip() {
    if (!apiTrip) return;
    setEditTitle(apiTrip.title || apiTrip.name);
    setEditDestination(apiTrip.destination_label ?? "");
    setEditDates(apiTrip.display_dates ?? apiTrip.dates ?? "");
    setEditBudget(String(apiTrip.planned_budget ?? ""));
    setEditVisibility(apiTrip.visibility ?? "private");
    setEditingTrip(true); setTripActionError("");
  }

  function confirmDeleteTrip() {
    if (!apiTrip) return;
    Alert.alert("Supprimer ce voyage ?", `« ${apiTrip.title || apiTrip.name} » et son itinéraire seront supprimés.`, [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: () => { void (async () => {
        setTripBusy(true);
        try { await tripsService.deleteTrip(apiTrip.id); router.replace("/my-trips"); }
        catch { setTripActionError("Le voyage n’a pas pu être supprimé. Vérifie que tu en es organisateur."); }
        finally { setTripBusy(false); }
      })(); } },
    ]);
  }

  const draftDestination = typeof destination === 'string' ? destination : 'Destination à choisir';
  const draftTemplate = /bénin|benin/i.test(draftDestination) ? trips.find((item) => item.id === 'cotonou')! : trips[0];
  const apiTrip = apiTrips.find((item) => item.id === id);
  const trip = isDraft
    ? { ...draftTemplate, id: 'draft', title: typeof title === 'string' ? title : `Voyage à ${draftDestination}`, destination: draftDestination, dates: 'Dates à organiser', status: 'À préparer' }
    : apiTrip
      ? {
          id: apiTrip.id,
          title: apiTrip.title,
          destination: apiTrip.destination ?? 'Destination à organiser',
          dates: apiTrip.dates ?? 'Dates à organiser',
          days: apiTrip.days ?? 1,
          people: apiTrip.people,
          image: apiTrip.image ?? 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=85',
          color: apiTrip.color ?? '#789477',
          spent: apiTrip.spent ?? 0,
          budget: apiTrip.budget,
          next: apiTrip.next ?? 'À organiser',
          status: apiTrip.status ?? 'À préparer',
          circleName: apiTrip.circleName,
        }
      : null;
  if (!trip) {
    return <Page><Header back title="Détail du voyage" /><AppText style={{ color: C.muted }}>{requestStatus === 'loading' ? 'Chargement du voyage…' : error ?? 'Voyage introuvable ou accès refusé.'}</AppText></Page>;
  }
  return (
    <View style={{ flex: 1, backgroundColor: C.cream }}>
      <Page>
        <Header
          back
          title="Détail du voyage"
          right={!isDraft ? <Pressable onPress={beginEditTrip} accessibilityRole="button" accessibilityLabel="Modifier le voyage"><AppText style={{ color: C.green, fontSize: 12, fontWeight: "900" }}>Modifier</AppText></Pressable> : undefined}
        />
        <ImageBackground
          source={{ uri: trip.image }}
          style={x.heroImage}
          imageStyle={{ borderRadius: 23 }}
        >
          <View style={x.scrim} />
          <AppText style={x.status}>{trip.status}</AppText>
          <View>
            <AppText style={x.title}>{trip.title}</AppText>
            <AppText style={x.sub}>
              {trip.destination} · {trip.dates}
            </AppText>
          </View>
        </ImageBackground>
        {!!tripActionError && <AppText accessibilityRole="alert" style={{ color: "#A7493C", fontSize: 11, fontWeight: "800" }}>{tripActionError}</AppText>}
        {editingTrip && !isDraft && <Surface style={{ gap: 9 }}>
          <AppText style={{ fontSize: 13, fontWeight: "900", color: C.ink }}>Modifier le voyage</AppText>
          <AppTextInput value={editTitle} onChangeText={setEditTitle} placeholder="Nom du voyage" style={x.editInput} />
          <AppTextInput value={editDestination} onChangeText={setEditDestination} placeholder="Destination" style={x.editInput} />
          <AppTextInput value={editDates} onChangeText={setEditDates} placeholder="Dates affichées" style={x.editInput} />
          <AppTextInput value={editBudget} onChangeText={setEditBudget} keyboardType="numeric" placeholder="Budget prévu en XOF" style={x.editInput} />
          <Pressable onPress={() => setEditVisibility((value) => value === "private" ? "public" : "private")}><AppText style={{ color: C.green, fontSize: 11, fontWeight: "800" }}>Visibilité : {editVisibility === "private" ? "Privé" : "Public"} · toucher pour changer</AppText></Pressable>
          <View style={{ flexDirection: "row", gap: 8 }}><Pressable disabled={tripBusy} onPress={() => void saveTripChanges()} style={x.editSave}><AppText style={x.editSaveText}>{tripBusy ? "Enregistrement…" : "Enregistrer"}</AppText></Pressable><Pressable onPress={() => setEditingTrip(false)} style={x.editCancel}><AppText style={{ color: C.muted, fontSize: 10, fontWeight: "800" }}>Annuler</AppText></Pressable><Pressable disabled={tripBusy} onPress={confirmDeleteTrip} style={x.editDelete}><AppText style={x.editDeleteText}>Supprimer</AppText></Pressable></View>
        </Surface>}
        {isDraft ? (
          <Surface style={{ gap: 10, backgroundColor: '#EEF3E9' }}>
            <AppText style={{ fontSize: 12, fontWeight: '900', color: C.ink }}>Pays et destination retenus</AppText>
            <AppText style={{ fontSize: 14, fontWeight: '800', color: C.green }}>{trip.destination}</AppText>
            <AppText style={{ fontSize: 11, lineHeight: 16, color: C.muted }}>Ajoute des villes, des visites, des restaurants et des activités pour construire le voyage dans ce pays.</AppText>
            <Link href="/map" style={{ color: C.green, fontSize: 11, fontWeight: '900' }}>Continuer sur la carte →</Link>
            <Link href={`/trip/${trip.id}/planning` as any} style={{ color: C.green, fontSize: 11, fontWeight: '900' }}>Organiser le voyage en groupe →</Link>
            <Link href={`/trip/${trip.id}/safety` as any} style={{ color: C.green, fontSize: 11, fontWeight: '900' }}>Préparer la sécurité →</Link>
            <Link href={{pathname:'/trip/[id]/services',params:{id:trip.id,destination:trip.destination}} as any} style={{ color: C.green, fontSize: 11, fontWeight: '900' }}>Voir les logements et restaurants →</Link>
          </Surface>
        ) : (
          <>
        <View style={x.members}>
          <View style={x.avatar}><AppIcon name="group" size={17} /></View>
          <AppText style={{ fontSize: 12, color: C.muted, flex: 1 }}>
            {trip.circleName ? `${trip.circleName} · ${trip.people} voyageurs` : `${trip.people} voyageurs dans ce voyage`}
          </AppText>
          <Pressable onPress={() => { setInviteNotice(true); router.push("/circles"); }}>
            <AppText style={{ color: C.green, fontWeight: "800" }}>{inviteNotice ? "Invitations ✓" : "Inviter +"}</AppText>
          </Pressable>
        </View>
        <View style={x.quickGrid}>
          {[
            ["map", "Itinéraire", "/trip/" + trip.id + "/itinerary"],
            ["payments", "Budget", "/trip/" + trip.id + "/budget"],
            ["packing", "Valise", "/trip/" + trip.id + "/packing"],
            ["journal", "Carnet", "/trip/" + trip.id + "/journal"],
          ].map((a) => (
            <Link key={a[1]} href={a[2] as any} asChild>
              <Pressable style={x.quick}>
                <AppIcon name={a[0]} size={19} />
                <AppText style={x.quickLabel}>{a[1]}</AppText>
              </Pressable>
            </Link>
          ))}
        </View>
        <SectionTitle title="Voyager à plusieurs" />
        <View style={x.quickGrid}>
          {[["group", "Décisions", "planning"], ["shield", "Sécurité", "safety"], ["apartment", "Logements", "services"]].map(([icon, label, route]) => (
            <Link key={route} href={`/trip/${trip.id}/${route}` as any} asChild><Pressable style={x.quick}><AppIcon name={icon} size={19} /><AppText style={x.quickLabel}>{label}</AppText></Pressable></Link>
          ))}
        </View>
          </>
        )}
        {!isDraft && <>
        <SectionTitle title="Étapes et activités" action="Itinéraire" href={`/trip/${trip.id}/itinerary`} />
        {stops.slice(0, 2).map((stop) => (
          <Surface key={stop.id} style={x.event}>
            <AppIcon name="pin" size={18} />
            <View style={{ flex: 1 }}>
              <AppText style={{ fontSize: 13, fontWeight: "800", color: C.ink }}>{stop.city}{stop.country ? `, ${stop.country}` : ""}</AppText>
              <AppText style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{activities.filter((activity) => activity.trip_place_id === stop.id).map((activity) => activity.title).join(" · ") || "Aucune activité ajoutée"}</AppText>
            </View>
          </Surface>
        ))}
        {!stops.length && <AppText style={{ fontSize: 11, color: C.muted }}>Ajoute les villes de ton parcours dans l’itinéraire.</AppText>}
        <SectionTitle title="Budget prévu" action="Détails" href={`/trip/${trip.id}/budget`} />
        {(() => {
          const budget = budgets.find((item) => item.trip_id === trip.id);
          const total = budget?.total_planned ?? apiTrip?.planned_budget ?? 0;
          const planned = budget ? budgetLines.filter((line) => line.budget_id === budget.id).reduce((sum, line) => sum + line.planned_amount, 0) : 0;
          return <Surface style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <AppText style={{ color: C.muted, fontSize: 12 }}>Total prévu</AppText>
              <AppText style={{ fontSize: 12, fontWeight: "800", color: C.ink }}>{formatXof(total)}</AppText>
            </View>
            <View style={x.progress}><View style={[x.progressFill, { width: `${total > 0 ? Math.min(100, planned / total * 100) : 0}%` }]} /></View>
            <AppText style={{ fontSize: 11, color: C.muted }}>{formatXof(planned)} répartis dans les lignes de budget. Aucun paiement n’est comptabilisé ici.</AppText>
          </Surface>;
        })()}
        </>}
      </Page>
      <BottomBar />
    </View>
  );
}
const x = StyleSheet.create({
  heroImage: { height: 220, padding: 16, justifyContent: "space-between" },
  editInput: { minHeight: 43, borderRadius: 11, borderWidth: 1, borderColor: C.line, backgroundColor: C.white, paddingHorizontal: 11, color: C.ink },
  editSave: { minHeight: 40, paddingHorizontal: 12, borderRadius: 10, backgroundColor: C.green, justifyContent: "center" }, editSaveText: { color: C.white, fontSize: 10, fontWeight: "900" }, editCancel: { minHeight: 40, paddingHorizontal: 12, borderRadius: 10, backgroundColor: "#F1F2EE", justifyContent: "center" }, editDelete: { minHeight: 40, paddingHorizontal: 12, borderRadius: 10, backgroundColor: "#F8EAE5", justifyContent: "center" }, editDeleteText: { color: "#A7493C", fontSize: 10, fontWeight: "900" },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(20,30,24,.3)",
    borderRadius: 23,
  },
  status: {
    alignSelf: "flex-start",
    paddingHorizontal: 11,
    paddingVertical: 7,
    backgroundColor: "#fff",
    borderRadius: 20,
    color: C.green,
    fontSize: 10,
    fontWeight: "800",
    overflow: "hidden",
  },
  title: { fontSize: 25, fontWeight: "900", color: "#fff" },
  sub: { fontSize: 12, color: "#fff", marginTop: 5 },
  members: { flexDirection: "row", alignItems: "center", gap: 11 },
  avatar: {
    width: 31,
    height: 31,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: C.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  quickGrid: { flexDirection: "row", gap: 9 },
  quick: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    gap: 7,
  },
  quickIcon: { color: C.green, fontSize: 19, fontWeight: "800" },
  quickLabel: { fontSize: 10, color: C.ink, fontWeight: "700" },
  event: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12 },
  time: { fontSize: 11, fontWeight: "800", color: C.green, width: 39 },
  progress: {
    height: 9,
    backgroundColor: C.pale,
    borderRadius: 9,
    overflow: "hidden",
  },
  progressFill: { height: 9, backgroundColor: C.green, borderRadius: 9 },
  expense: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12 },
});
