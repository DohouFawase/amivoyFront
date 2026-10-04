import { AppIcon } from "@/components/app-icon";
import { AppText, AppTextInput } from "@/components/app-text";
import { BottomBar, C, Header, Page, Surface } from "@/components/app-ui";
import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/hooks/redux";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { tripsService } from "@/services/tripsService";
import type { ActivityAttendeeRecord, ActivityRecord, PlaceSearchRecord, RoutePlanResponse, TripMemberRecord, TripPlaceRecord, TripRecord } from "@/interface/trips";

export default function Itinerary() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAppSelector((state) => state.auth.user);
  const [trip, setTrip] = useState<TripRecord | null>(null);
  const [stops, setStops] = useState<TripPlaceRecord[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [members, setMembers] = useState<TripMemberRecord[]>([]);
  const [attendees, setAttendees] = useState<ActivityAttendeeRecord[]>([]);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [editActivityTitle, setEditActivityTitle] = useState("");
  const [editActivityCategory, setEditActivityCategory] = useState("");
  const [editActivityLocation, setEditActivityLocation] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceSearchRecord[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceSearchRecord | null>(null);
  const [editingStopId, setEditingStopId] = useState<string | null>(null);
  const [editCity, setEditCity] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [activityDrafts, setActivityDrafts] = useState<Record<string, string>>({});
  const [routePlan, setRoutePlan] = useState<RoutePlanResponse | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const currentMember = members.find((item) => item.user_id === user?.id && item.status === "active");
  useEffect(() => {
    const term = city.trim();
    if (term.length < 2 || selectedPlace?.name.toLocaleLowerCase() === term.toLocaleLowerCase()) return;
    let active = true;
    const timer = setTimeout(() => {
      const defaultCountry = /bénin|benin/i.test(trip?.destination_label ?? trip?.destination ?? "") ? "Bénin" : undefined;
      tripsService.searchPlaces(term, country.trim() || defaultCountry)
        .then((places) => { if (active) setPlaceSuggestions(places.filter((place) => !place.isCountry)); })
        .catch(() => { if (active) setPlaceSuggestions([]); });
    }, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [city, country, selectedPlace, trip?.destination_label, trip?.destination]);

  useEffect(() => {
    let active = true;
    Promise.all([
      tripsService.fetchTrip(id), tripsService.fetchTripPlaces(id), tripsService.fetchActivities(id), tripsService.fetchTripMembers(id), tripsService.fetchActivityAttendees(id),
    ]).then(([tripResult, stopResult, activityResult, tripMembers, activityAttendees]) => {
      if (active) { setTrip(tripResult); setStops(stopResult); setActivities(activityResult); setMembers(tripMembers); setAttendees(activityAttendees); setError(""); }
    }).catch(() => {
      if (active) setError("L’itinéraire n’a pas pu être chargé. Vérifie l’accès au voyage et réessaie.");
    });
    return () => { active = false; };
  }, [id]);

  async function addStop() {
    if (!city.trim() || busy) return;
    setBusy(true);
    try {
      const stop = await tripsService.createTripPlace({ trip_id: id, city: selectedPlace?.name ?? city.trim(), country: selectedPlace?.country ?? (country.trim() || trip?.destination_label || undefined), ...(selectedPlace?.id ? { place_id: selectedPlace.id } : {}), position: stops.length });
      setStops((current) => [...current, stop]); setCity(""); setCountry(""); setSelectedPlace(null); setPlaceSuggestions([]); setError(""); setRoutePlan(null);
    } catch { setError("Cette étape n’a pas pu être ajoutée."); }
    finally { setBusy(false); }
  }

  async function beginEditStop(stop: TripPlaceRecord) {
    setBusy(true);
    try {
      const current = await tripsService.fetchTripPlace(stop.id);
      setEditingStopId(current.id); setEditCity(current.city); setEditCountry(current.country ?? ""); setError("");
    } catch { setError("Cette étape n’a pas pu être chargée pour modification."); }
    finally { setBusy(false); }
  }

  async function saveStop(stop: TripPlaceRecord) {
    if (!editCity.trim() || busy) return;
    setBusy(true);
    try {
      const updated = await tripsService.updateTripPlace(stop.id, { city: editCity.trim(), country: editCountry.trim() || null });
      setStops((current) => current.map((item) => item.id === updated.id ? updated : item)); setEditingStopId(null); setError(""); setRoutePlan(null);
    } catch { setError("Les modifications de l’étape n’ont pas pu être enregistrées."); }
    finally { setBusy(false); }
  }

  function confirmDeleteStop(stop: TripPlaceRecord) {
    Alert.alert("Supprimer cette étape ?", `« ${stop.city} » sera retirée de l’itinéraire.`, [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: () => { void (async () => {
        try { await tripsService.deleteTripPlace(stop.id); setStops((current) => current.filter((item) => item.id !== stop.id)); setActivities((current) => current.filter((item) => item.trip_place_id !== stop.id)); setRoutePlan(null); setError(""); }
        catch { setError("Cette étape n’a pas pu être supprimée."); }
      })(); } },
    ]);
  }

  async function addActivity(stop: TripPlaceRecord) {
    const title = activityDrafts[stop.id]?.trim();
    if (!title || busy) return;
    setBusy(true);
    try {
      const activity = await tripsService.createActivity({ trip_id: id, trip_place_id: stop.id, title, category: "Visite", location_label: stop.city });
      setActivities((current) => [...current, activity]);
      setActivityDrafts((current) => ({ ...current, [stop.id]: "" })); setError("");
    } catch { setError("L’activité n’a pas pu être enregistrée."); }
    finally { setBusy(false); }
  }

  async function beginEditActivity(activity: ActivityRecord) {
    setBusy(true);
    try {
      const detail = await tripsService.fetchActivity(activity.id);
      setEditingActivityId(detail.id); setEditActivityTitle(detail.title); setEditActivityCategory(detail.category ?? ""); setEditActivityLocation(detail.location_label ?? ""); setError("");
    } catch { setError("Cette activité n’a pas pu être chargée pour modification."); }
    finally { setBusy(false); }
  }

  async function saveActivity(activity: ActivityRecord) {
    if (!editActivityTitle.trim() || busy) return;
    setBusy(true);
    try {
      const updated = await tripsService.updateActivity(activity.id, { title: editActivityTitle.trim(), category: editActivityCategory.trim() || null, location_label: editActivityLocation.trim() || null });
      setActivities((current) => current.map((item) => item.id === updated.id ? updated : item)); setEditingActivityId(null); setError("");
    } catch { setError("Les modifications de l’activité n’ont pas pu être enregistrées."); }
    finally { setBusy(false); }
  }

  async function toggleRsvp(activity: ActivityRecord) {
    if (!currentMember || busy) { if (!currentMember) setError("Ton compte doit être membre actif du voyage pour répondre."); return; }
    setBusy(true);
    const existing = attendees.find((item) => item.activity_id === activity.id && item.member_id === currentMember.id);
    try {
      let saved: ActivityAttendeeRecord;
      if (existing) {
        const detail = await tripsService.fetchActivityAttendee(existing.id);
        saved = await tripsService.updateActivityAttendee(detail.id, { rsvp: detail.rsvp === "yes" ? "no" : "yes" });
      } else {
        saved = await tripsService.createActivityAttendee({ activity_id: activity.id, member_id: currentMember.id, rsvp: "yes" });
      }
      setAttendees((current) => existing ? current.map((item) => item.id === saved.id ? saved : item) : [...current, saved]); setError("");
    } catch { setError("Ta réponse à cette activité n’a pas pu être enregistrée."); }
    finally { setBusy(false); }
  }

  function confirmRemoveRsvp(activity: ActivityRecord) {
    const existing = attendees.find((item) => item.activity_id === activity.id && item.member_id === currentMember?.id);
    if (!existing) return;
    Alert.alert("Retirer ta réponse ?", `Tu ne seras plus inscrit(e) à « ${activity.title} ».`, [
      { text: "Garder ma réponse", style: "cancel" },
      { text: "Retirer", style: "destructive", onPress: () => { void (async () => {
        try { await tripsService.deleteActivityAttendee(existing.id); setAttendees((current) => current.filter((item) => item.id !== existing.id)); setError(""); }
        catch { setError("Ta réponse n’a pas pu être retirée."); }
      })(); } },
    ]);
  }

  async function removeActivity(activity: ActivityRecord) {
    try { await tripsService.deleteActivity(activity.id); setActivities((current) => current.filter((item) => item.id !== activity.id)); }
    catch { setError("L’activité n’a pas pu être supprimée."); }
  }

  async function suggestRoute() {
    try { setRoutePlan(await tripsService.fetchRoutePlan(id)); setError(""); }
    catch { setError("L’ordre du trajet n’a pas pu être calculé."); }
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.cream }}>
      <Page>
        <Header back title="Itinéraire" />
        <AppText style={st.eyebrow}>{(trip?.destination_label || trip?.destination || "VOYAGE").toLocaleUpperCase()}</AppText>
        <AppText style={st.heading}>Construis ton parcours.</AppText>
        <AppText style={st.sub}>Les étapes et activités sont enregistrées sur le voyage et visibles par ses membres.</AppText>
        <Surface style={st.form}>
          <AppText style={st.formTitle}>Ajouter une étape</AppText>
          <AppTextInput value={city} onChangeText={(value) => { setCity(value); setSelectedPlace(null); setPlaceSuggestions([]); }} placeholder="Ville ou étape" style={st.input} />
          {placeSuggestions.map((place) => <Pressable key={place.id} onPress={() => { setSelectedPlace(place); setCity(place.name); setCountry(place.country ?? ""); setPlaceSuggestions([]); }} style={st.placeOption}><AppText style={st.stopName}>{place.name}</AppText><AppText style={st.sub}>{[place.region, place.country].filter(Boolean).join(" · ")}</AppText></Pressable>)}
          {placeSuggestions.some((place) => place.source === "Geoapify") && <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><Link href="https://www.geoapify.com/" style={st.sub}>Powered by Geoapify</Link><AppText style={st.sub}>· © OpenStreetMap contributors</AppText></View>}
          <View style={st.addRow}><AppTextInput value={country} onChangeText={setCountry} placeholder="Pays (facultatif)" style={[st.input, { flex: 1 }]} /><Pressable disabled={busy} onPress={() => void addStop()} style={st.addButton}><AppText style={st.addText}>Ajouter</AppText></Pressable></View>
        </Surface>
        <Pressable onPress={() => void suggestRoute()} style={st.routeButton}><AppIcon name="map" size={17} /><AppText style={st.routeButtonText}>Calculer l’ordre des étapes géolocalisées</AppText></Pressable>
        {!!routePlan && <Surface style={st.routeResult}><AppText style={st.formTitle}>Distance estimée : {routePlan.estimated_total_distance_km} km</AppText><AppText style={st.sub}>Distance en ligne droite · {routePlan.stops_without_coordinates} étape(s) sans coordonnées ignorée(s).</AppText>{routePlan.stops.map((stop, index) => <AppText key={stop.trip_place_id} style={st.routeStop}>{index + 1}. {stop.name} · {stop.distance_from_previous_km} km</AppText>)}</Surface>}
        {!!error && <AppText accessibilityRole="alert" style={st.error}>{error}</AppText>}
        {!stops.length && !error && <Surface><AppText style={st.sub}>Aucune étape pour l’instant. Ajoute les villes de ton parcours.</AppText></Surface>}
        {stops.map((stop, index) => (
          <Surface key={stop.id} style={st.stop}>
            <View style={st.stopHeading}><View style={st.number}><AppText style={st.numberText}>{index + 1}</AppText></View><View style={{ flex: 1 }}><AppText style={st.stopName}>{stop.city}{stop.country ? `, ${stop.country}` : ""}</AppText><AppText style={st.sub}>{stop.stay_start ? `Arrivée ${stop.stay_start}` : "Étape du voyage"}</AppText></View><Pressable disabled={busy} onPress={() => void beginEditStop(stop)}><AppText style={st.stopAction}>Modifier</AppText></Pressable><Pressable onPress={() => confirmDeleteStop(stop)}><AppText style={st.remove}>×</AppText></Pressable></View>
            {editingStopId === stop.id && <View style={st.editStop}><AppTextInput value={editCity} onChangeText={setEditCity} placeholder="Ville" style={st.input} /><AppTextInput value={editCountry} onChangeText={setEditCountry} placeholder="Pays" style={st.input} /><View style={st.addRow}><Pressable disabled={busy} onPress={() => void saveStop(stop)} style={st.smallAdd}><AppText style={st.addText}>Enregistrer</AppText></Pressable><Pressable onPress={() => setEditingStopId(null)} style={st.cancel}><AppText style={st.cancelText}>Annuler</AppText></Pressable></View></View>}
            {activities.filter((activity) => activity.trip_place_id === stop.id).map((activity) => {
              const rsvp = attendees.find((item) => item.activity_id === activity.id && item.member_id === currentMember?.id);
              return <View key={activity.id} style={st.activityBlock}>
                <View style={st.activity}><AppIcon name={activity.icon || "pin"} size={17} /><View style={{ flex: 1 }}><AppText style={st.activityTitle}>{activity.title}</AppText><AppText style={st.sub}>{activity.time_label || activity.category || stop.city}</AppText></View><Pressable disabled={busy} onPress={() => void beginEditActivity(activity)}><AppText style={st.stopAction}>Modifier</AppText></Pressable><Pressable onPress={() => void removeActivity(activity)} accessibilityRole="button" accessibilityLabel={`Supprimer ${activity.title}`}><AppText style={st.remove}>×</AppText></Pressable></View>
                {editingActivityId === activity.id && <View style={st.editStop}><AppTextInput value={editActivityTitle} onChangeText={setEditActivityTitle} placeholder="Activité" style={st.input} /><AppTextInput value={editActivityCategory} onChangeText={setEditActivityCategory} placeholder="Catégorie" style={st.input} /><AppTextInput value={editActivityLocation} onChangeText={setEditActivityLocation} placeholder="Lieu" style={st.input} /><View style={st.addRow}><Pressable disabled={busy} onPress={() => void saveActivity(activity)} style={st.smallAdd}><AppText style={st.addText}>Enregistrer</AppText></Pressable><Pressable onPress={() => setEditingActivityId(null)} style={st.cancel}><AppText style={st.cancelText}>Annuler</AppText></Pressable></View></View>}
                <View style={st.rsvpRow}><AppText style={st.sub}>{attendees.filter((item) => item.activity_id === activity.id).length} participant(s) · {rsvp ? `Ta réponse : ${rsvp.rsvp}` : "Pas encore de réponse"}</AppText><Pressable disabled={busy} onPress={() => void toggleRsvp(activity)}><AppText style={st.stopAction}>{rsvp?.rsvp === "yes" ? "Je ne participe plus" : "Je participe"}</AppText></Pressable>{!!rsvp && <Pressable onPress={() => confirmRemoveRsvp(activity)}><AppText style={st.remove}>Retirer</AppText></Pressable>}</View>
              </View>;
            })}
            <View style={st.addRow}><AppTextInput value={activityDrafts[stop.id] || ""} onChangeText={(value) => setActivityDrafts((current) => ({ ...current, [stop.id]: value }))} onSubmitEditing={() => void addActivity(stop)} placeholder="Ajouter une activité…" style={[st.input, { flex: 1 }]} /><Pressable disabled={busy} onPress={() => void addActivity(stop)} style={st.smallAdd}><AppText style={st.addText}>＋</AppText></Pressable></View>
          </Surface>
        ))}
        <Surface style={st.note}><AppIcon name="lightbulb" size={19} /><AppText style={[st.sub, { flex: 1 }]}>L’ordre automatique s’appuie sur les coordonnées connues des lieux enregistrés. Les distances affichées sont des estimations à vol d’oiseau.</AppText></Surface>
      </Page>
      <BottomBar />
    </View>
  );
}
const st = StyleSheet.create({ eyebrow: { fontSize: 9, fontWeight: "900", letterSpacing: 1.3, color: C.green }, heading: { fontSize: 27, fontWeight: "900", color: C.ink }, sub: { fontSize: 11, color: C.muted, lineHeight: 16 }, form: { gap: 9 }, formTitle: { fontSize: 13, fontWeight: "900", color: C.ink }, input: { minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: C.line, backgroundColor: C.white, paddingHorizontal: 12, color: C.ink }, addRow: { flexDirection: "row", alignItems: "center", gap: 8 }, addButton: { minHeight: 44, paddingHorizontal: 14, borderRadius: 12, backgroundColor: C.green, alignItems: "center", justifyContent: "center" }, addText: { fontSize: 10, color: C.white, fontWeight: "900" }, routeButton: { minHeight: 42, borderRadius: 12, backgroundColor: "#EDF2E7", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }, routeButtonText: { fontSize: 10, color: C.green, fontWeight: "900" }, routeResult: { gap: 7, backgroundColor: "#EEF3E9" }, placeOption: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: C.white, borderWidth: 1, borderColor: C.line }, stopAction: { color: C.green, fontSize: 10, fontWeight: "900" }, activityBlock: { gap: 5, borderRadius: 12, backgroundColor: "#F7F8F4", padding: 8 }, rsvpRow: { flexDirection: "row", alignItems: "center", gap: 8 }, editStop: { gap: 7 }, cancel: { minHeight: 42, paddingHorizontal: 14, alignItems: "center", justifyContent: "center", borderRadius: 11, backgroundColor: "#F1F2EE" }, cancelText: { color: C.muted, fontSize: 10, fontWeight: "800" }, routeStop: { fontSize: 10, fontWeight: "700", color: C.ink }, stop: { gap: 10 }, stopHeading: { flexDirection: "row", alignItems: "center", gap: 10 }, number: { width: 32, height: 32, borderRadius: 11, backgroundColor: C.lime, alignItems: "center", justifyContent: "center" }, numberText: { fontSize: 13, color: C.green, fontWeight: "900" }, stopName: { fontSize: 14, color: C.ink, fontWeight: "900" }, activity: { flexDirection: "row", alignItems: "center", gap: 9, padding: 9, borderRadius: 10, backgroundColor: "#F6F7F2" }, activityTitle: { fontSize: 11, color: C.ink, fontWeight: "800" }, remove: { fontSize: 20, color: C.muted, paddingHorizontal: 5 }, smallAdd: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.green, alignItems: "center", justifyContent: "center" }, note: { flexDirection: "row", alignItems: "center", gap: 9 }, error: { fontSize: 11, color: "#A7493C", fontWeight: "800" } });
