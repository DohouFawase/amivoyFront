import { AppText, AppTextInput } from "@/components/app-text";
import { C, Header, Page, SectionTitle, Surface } from "@/components/app-ui";
import { useAppSelector } from "@/hooks/redux";
import type { ModerationActionRecord, OfflineSyncQueueRecord, PartnerRecord, TripRecord } from "@/interface/trips";
import { tripsService } from "@/services/tripsService";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

export default function AdminTools() {
  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.platform_role === "admin";
  const canModerate = isAdmin || user?.platform_role === "moderator";
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [queue, setQueue] = useState<OfflineSyncQueueRecord[]>([]);
  const [queueTrip, setQueueTrip] = useState("");
  const [operation, setOperation] = useState("");
  const [payload, setPayload] = useState("{}");
  const [editingQueue, setEditingQueue] = useState<OfflineSyncQueueRecord | null>(null);
  const [queueStatus, setQueueStatus] = useState("pending");
  const [partnerRows, setPartnerRows] = useState<PartnerRecord[]>([]);
  const [partnerName, setPartnerName] = useState("");
  const [partnerType, setPartnerType] = useState("");
  const [partnerCountry, setPartnerCountry] = useState("");
  const [editingPartner, setEditingPartner] = useState<PartnerRecord | null>(null);
  const [moderationRows, setModerationRows] = useState<ModerationActionRecord[]>([]);
  const [reportId, setReportId] = useState("");
  const [moderationAction, setModerationAction] = useState("");
  const [moderationNote, setModerationNote] = useState("");
  const [editingModeration, setEditingModeration] = useState<ModerationActionRecord | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    void tripsService.fetchTrips().then((items) => { setTrips(items); if (items[0]) setQueueTrip(items[0].id); }).catch(() => undefined);
    void tripsService.fetchOfflineSyncQueue().then(setQueue).catch(() => setError("La file de synchronisation n’a pas pu être chargée."));
    if (isAdmin) void tripsService.fetchPartners().then(setPartnerRows).catch(() => setError("Le catalogue partenaires est réservé aux administrateurs."));
    if (canModerate) void tripsService.fetchModerationActions().then(setModerationRows).catch(() => setError("Les actions de modération sont réservées à l’équipe autorisée."));
  }, [canModerate, isAdmin]);

  async function inspectQueue(item: OfflineSyncQueueRecord) {
    try { const detail = await tripsService.fetchOfflineSyncItem(item.id); setEditingQueue(detail); setOperation(detail.operation); setPayload(JSON.stringify(detail.payload, null, 2)); setQueueStatus(detail.status ?? "pending"); setError(""); }
    catch { setError("Le détail de cette opération n’a pas pu être chargé."); }
  }
  async function saveQueueItem() {
    if (!user || !queueTrip || !operation.trim()) { setError("Choisis un voyage et renseigne une opération."); return; }
    let parsed: Record<string, unknown>;
    try { const raw: unknown = JSON.parse(payload); if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error(); parsed = raw as Record<string, unknown>; }
    catch { setError("Le contenu doit être un objet JSON valide."); return; }
    try {
      if (editingQueue) {
        const saved = await tripsService.updateOfflineSyncItem(editingQueue.id, { operation: operation.trim(), payload: parsed, status: queueStatus });
        setQueue((items) => items.map((item) => item.id === saved.id ? saved : item));
      } else {
        const saved = await tripsService.createOfflineSyncQueue({ user_id: user.id, trip_id: queueTrip, operation: operation.trim(), payload: parsed, client_op_id: `${user.id}-${Date.now()}`, status: queueStatus });
        setQueue((items) => [saved, ...items]);
      }
      setEditingQueue(null); setOperation(""); setPayload("{}"); setError(""); setNotice("Opération enregistrée dans la file serveur.");
    } catch { setError("L’opération n’a pas pu être enregistrée. Cette API conserve des entrées, elle ne rejoue pas leur contenu automatiquement."); }
  }
  function deleteQueueItem(item: OfflineSyncQueueRecord) { Alert.alert("Supprimer cette entrée ?", item.operation, [{ text: "Annuler", style: "cancel" }, { text: "Supprimer", style: "destructive", onPress: () => { void tripsService.deleteOfflineSyncItem(item.id).then(() => setQueue((items) => items.filter((x) => x.id !== item.id))).catch(() => setError("L’entrée n’a pas pu être supprimée.")); } }]); }

  async function savePartner() {
    if (!partnerName.trim() || !partnerType.trim() || !partnerCountry.trim()) { setError("Nom, type et pays sont requis."); return; }
    try {
      const saved = editingPartner
        ? await tripsService.updatePartner(editingPartner.id, { name: partnerName.trim(), type: partnerType.trim(), country: partnerCountry.trim() })
        : await tripsService.createPartner({ name: partnerName.trim(), type: partnerType.trim(), country: partnerCountry.trim(), commission_rate: null, contact_email: null, status: "active" });
      setPartnerRows((items) => editingPartner ? items.map((x) => x.id === saved.id ? saved : x) : [saved, ...items]); setEditingPartner(null); setPartnerName(""); setPartnerType(""); setPartnerCountry(""); setError("");
    } catch { setError("Le partenaire n’a pas pu être enregistré."); }
  }
  async function editPartner(item: PartnerRecord) { try { const detail = await tripsService.fetchPartner(item.id); setEditingPartner(detail); setPartnerName(detail.name); setPartnerType(detail.type); setPartnerCountry(detail.country); } catch { setError("Le partenaire n’a pas pu être chargé."); } }
  function deletePartner(item: PartnerRecord) { Alert.alert("Supprimer ce partenaire ?", item.name, [{ text: "Annuler", style: "cancel" }, { text: "Supprimer", style: "destructive", onPress: () => { void tripsService.deletePartner(item.id).then(() => setPartnerRows((xs) => xs.filter((x) => x.id !== item.id))).catch(() => setError("Le partenaire n’a pas pu être supprimé.")); } }]); }

  async function saveModeration() {
    if (!user || !reportId.trim() || !moderationAction.trim()) { setError("L’identifiant du signalement et l’action sont requis."); return; }
    try {
      const saved = editingModeration
        ? await tripsService.updateModerationAction(editingModeration.id, { action: moderationAction.trim(), note: moderationNote.trim() || null })
        : await tripsService.createModerationAction({ report_id: reportId.trim(), moderator_id: user.id, action: moderationAction.trim(), note: moderationNote.trim() || undefined });
      setModerationRows((xs) => editingModeration ? xs.map((x) => x.id === saved.id ? saved : x) : [saved, ...xs]); setEditingModeration(null); setReportId(""); setModerationAction(""); setModerationNote(""); setError("");
    } catch { setError("L’action n’a pas été enregistrée. Vérifie ton rôle et l’identifiant du signalement."); }
  }
  async function editModeration(item: ModerationActionRecord) { try { const detail = await tripsService.fetchModerationAction(item.id); setEditingModeration(detail); setReportId(detail.report_id); setModerationAction(detail.action); setModerationNote(detail.note ?? ""); } catch { setError("Le détail de modération n’a pas pu être chargé."); } }
  function deleteModeration(item: ModerationActionRecord) { Alert.alert("Supprimer cette action ?", item.action, [{ text: "Annuler", style: "cancel" }, { text: "Supprimer", style: "destructive", onPress: () => { void tripsService.deleteModerationAction(item.id).then(() => setModerationRows((xs) => xs.filter((x) => x.id !== item.id))).catch(() => setError("L’action n’a pas pu être supprimée.")); } }]); }

  return <Page>
    <Header back title="Outils et synchronisation" />
    <AppText style={st.heading}>Outils du compte</AppText>
    <SectionTitle title="File de synchronisation serveur" action={`${queue.length}`} />
    <AppText style={st.sub}>Ces entrées stockent une opération et son statut côté serveur. Leur contenu n’est pas rejoué automatiquement.</AppText>
    <Surface style={st.form}>
      <View style={st.wrap}>{trips.map((trip) => <Pressable key={trip.id} onPress={() => setQueueTrip(trip.id)} style={[st.chip, queueTrip === trip.id && st.chipOn]}><AppText style={[st.chipText, queueTrip === trip.id && st.chipTextOn]}>{trip.title || trip.name}</AppText></Pressable>)}</View>
      <AppTextInput value={operation} onChangeText={setOperation} placeholder="Nom de l’opération" style={st.input} />
      <AppTextInput value={payload} onChangeText={setPayload} multiline placeholder="Payload JSON" style={[st.input, st.json]} />
      {!!editingQueue && <AppTextInput value={queueStatus} onChangeText={setQueueStatus} placeholder="Statut" style={st.input} />}
      <Pressable onPress={() => void saveQueueItem()} style={st.button}><AppText style={st.buttonText}>{editingQueue ? "Mettre à jour l’entrée" : "Ajouter à la file"}</AppText></Pressable>
      {queue.map((item) => <View key={item.id} style={st.row}><View style={{ flex: 1 }}><AppText style={st.title}>{item.operation} · {item.status || "pending"}</AppText><AppText style={st.sub}>{trips.find((t) => t.id === item.trip_id)?.title || item.client_op_id}</AppText></View><Pressable onPress={() => void inspectQueue(item)}><AppText style={st.link}>Détails / modifier</AppText></Pressable><Pressable onPress={() => deleteQueueItem(item)}><AppText style={st.danger}>Supprimer</AppText></Pressable></View>)}
    </Surface>
    {isAdmin && <>
      <SectionTitle title="Partenaires" action={`${partnerRows.length}`} />
      <Surface style={st.form}><AppTextInput value={partnerName} onChangeText={setPartnerName} placeholder="Nom du partenaire" style={st.input} /><AppTextInput value={partnerType} onChangeText={setPartnerType} placeholder="Type" style={st.input} /><AppTextInput value={partnerCountry} onChangeText={setPartnerCountry} placeholder="Pays" style={st.input} /><Pressable onPress={() => void savePartner()} style={st.button}><AppText style={st.buttonText}>{editingPartner ? "Enregistrer" : "Créer le partenaire"}</AppText></Pressable>{partnerRows.map((item) => <View key={item.id} style={st.row}><View style={{ flex: 1 }}><AppText style={st.title}>{item.name}</AppText><AppText style={st.sub}>{item.type} · {item.country} · {item.status}</AppText></View><Pressable onPress={() => void editPartner(item)}><AppText style={st.link}>Modifier</AppText></Pressable><Pressable onPress={() => deletePartner(item)}><AppText style={st.danger}>Supprimer</AppText></Pressable></View>)}</Surface>
    </>}
    {canModerate && <>
      <SectionTitle title="Actions de modération" action={`${moderationRows.length}`} />
      <Surface style={st.form}><AppTextInput value={reportId} onChangeText={setReportId} autoCapitalize="none" placeholder="ID du signalement" style={st.input} /><AppTextInput value={moderationAction} onChangeText={setModerationAction} placeholder="Action" style={st.input} /><AppTextInput value={moderationNote} onChangeText={setModerationNote} placeholder="Note (facultatif)" style={st.input} /><Pressable onPress={() => void saveModeration()} style={st.button}><AppText style={st.buttonText}>{editingModeration ? "Modifier l’action" : "Enregistrer l’action"}</AppText></Pressable>{moderationRows.map((item) => <View key={item.id} style={st.row}><View style={{ flex: 1 }}><AppText style={st.title}>{item.action}</AppText><AppText style={st.sub}>Signalement {item.report_id}</AppText></View><Pressable onPress={() => void editModeration(item)}><AppText style={st.link}>Détails / modifier</AppText></Pressable><Pressable onPress={() => deleteModeration(item)}><AppText style={st.danger}>Supprimer</AppText></Pressable></View>)}</Surface>
    </>}
    {!!error && <AppText accessibilityRole="alert" style={st.danger}>{error}</AppText>}{!!notice && <AppText style={st.link}>{notice}</AppText>}
  </Page>;
}
const st = StyleSheet.create({ heading: { fontSize: 27, fontWeight: "900", color: C.ink }, sub: { fontSize: 10, color: C.muted, lineHeight: 15 }, title: { fontSize: 11, fontWeight: "900", color: C.ink }, form: { gap: 8 }, input: { minHeight: 42, borderRadius: 10, borderWidth: 1, borderColor: C.line, backgroundColor: C.white, paddingHorizontal: 11, color: C.ink, fontSize: 10 }, json: { minHeight: 110, textAlignVertical: "top", paddingVertical: 9 }, wrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 }, chip: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: "#EFF2EB" }, chipOn: { backgroundColor: C.green }, chipText: { color: C.ink, fontSize: 9 }, chipTextOn: { color: C.white }, button: { minHeight: 42, borderRadius: 10, backgroundColor: C.green, alignItems: "center", justifyContent: "center" }, buttonText: { color: C.white, fontSize: 10, fontWeight: "900" }, row: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, borderTopWidth: 1, borderColor: C.line }, link: { color: C.green, fontSize: 9, fontWeight: "900" }, danger: { color: "#A7493C", fontSize: 9, fontWeight: "900" } });
