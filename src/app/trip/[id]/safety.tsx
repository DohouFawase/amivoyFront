import { AppText, AppTextInput } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { C, Header, Page, SectionTitle, Surface } from "@/components/app-ui";
import { useEffect, useState } from "react";
import { Alert as NativeAlert, Pressable, StyleSheet, Switch, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { createExclusionRequest, fetchExclusionRequests, fetchTripMembers, updateExclusionRequest } from "@/actions/tripActions";
import type { EmergencyAlertRecord, EmergencyAlertRecipientRecord, ExclusionRequestRecord, LocationShareRecord, LocationPointRecord, MeetingPointRecord } from "@/interface/trips";
import { tripsService } from "@/services/tripsService";

type SafetyState = "idle" | "safe" | "help";

export default function Safety() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const allMembers = useAppSelector((state) => state.trips.members);
  const allRequests = useAppSelector((state) => state.trips.exclusionRequests);
  const members = allMembers.filter((member) => member.trip_id === id && member.status === "active");
  const requests = allRequests.filter((request) => request.trip_id === id);
  const currentMember = members.find((member) => member.user_id === user?.id);
  const [targetMemberId, setTargetMemberId] = useState("");
  const [reason, setReason] = useState("");
  const [requestError, setRequestError] = useState("");
  const [requestBusy, setRequestBusy] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [checkin, setCheckin] = useState(true);
  const [state, setState] = useState<SafetyState>("idle");
  const [alert, setAlert] = useState(false);
  const [alerts, setAlerts] = useState<EmergencyAlertRecord[]>([]);
  const [recipients, setRecipients] = useState<EmergencyAlertRecipientRecord[]>([]);
  const [alertLat, setAlertLat] = useState("");
  const [alertLng, setAlertLng] = useState("");
  const [alertError, setAlertError] = useState("");
  const [selectedAlert, setSelectedAlert] = useState<EmergencyAlertRecord | null>(null);
  const [locationShares, setLocationShares] = useState<LocationShareRecord[]>([]);
  const [locationPoints, setLocationPoints] = useState<LocationPointRecord[]>([]);
  const [activeShare, setActiveShare] = useState<LocationShareRecord | null>(null);
  const [pointLat, setPointLat] = useState("");
  const [pointLng, setPointLng] = useState("");
  const [editingPoint, setEditingPoint] = useState<LocationPointRecord | null>(null);
  const [meetingPoints, setMeetingPoints] = useState<MeetingPointRecord[]>([]);
  const [meetingName, setMeetingName] = useState("");
  const [meetingInstructions, setMeetingInstructions] = useState("");
  const [meetingLat, setMeetingLat] = useState("");
  const [meetingLng, setMeetingLng] = useState("");
  const [editingMeeting, setEditingMeeting] = useState<MeetingPointRecord | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ExclusionRequestRecord | null>(null);

  useEffect(() => {
    if (!id || id === "draft") return;
    let active = true;
    void Promise.all([
      dispatch(fetchTripMembers()).unwrap(),
      dispatch(fetchExclusionRequests()).unwrap(),
      tripsService.fetchEmergencyAlerts(id),
      tripsService.fetchEmergencyAlertRecipients(),
      tripsService.fetchLocationShares(id),
      tripsService.fetchLocationPoints(),
      tripsService.fetchMeetingPoints(id),
    ]).then(([, , loadedAlerts, loadedRecipients, loadedShares, loadedPoints, loadedMeetings]) => { if (active) { setAlerts(loadedAlerts); setRecipients(loadedRecipients); setLocationShares(loadedShares); setLocationPoints(loadedPoints); setMeetingPoints(loadedMeetings); setActiveShare(loadedShares.find((x) => x.member_id === currentMember?.id && !x.stopped_at && new Date(x.expires_at) > new Date()) ?? null); } }).catch(() => {
      if (active) setRequestError("Les membres ou les demandes du voyage n’ont pas pu être chargés.");
    });
    return () => { active = false; };
  }, [dispatch, id, currentMember?.id]);

  async function saveMeetingPoint() {
    if (!meetingName.trim()) { setAlertError("Donne un nom au point de rendez-vous."); return; }
    const lat = meetingLat.trim() ? Number(meetingLat.replace(",", ".")) : null; const lng = meetingLng.trim() ? Number(meetingLng.replace(",", ".")) : null;
    if ((lat !== null && (!Number.isFinite(lat) || lat < -90 || lat > 90)) || (lng !== null && (!Number.isFinite(lng) || lng < -180 || lng > 180))) { setAlertError("Coordonnées invalides."); return; }
    try {
      const saved = editingMeeting ? await tripsService.updateMeetingPoint(editingMeeting.id, { name: meetingName.trim(), lat, lng, instructions: meetingInstructions.trim() || null }) : await tripsService.createMeetingPoint({ trip_id: id, name: meetingName.trim(), lat, lng, instructions: meetingInstructions.trim() || null });
      setMeetingPoints((xs) => editingMeeting ? xs.map((x) => x.id === saved.id ? saved : x) : [saved, ...xs]); setEditingMeeting(null); setMeetingName(""); setMeetingInstructions(""); setMeetingLat(""); setMeetingLng(""); setAlertError("");
    } catch { setAlertError("Le point de rendez-vous n’a pas pu être enregistré."); }
  }
  async function editMeetingPoint(item: MeetingPointRecord) { try { const detail = await tripsService.fetchMeetingPoint(item.id); setEditingMeeting(detail); setMeetingName(detail.name); setMeetingInstructions(detail.instructions ?? ""); setMeetingLat(detail.lat == null ? "" : String(detail.lat)); setMeetingLng(detail.lng == null ? "" : String(detail.lng)); } catch { setAlertError("Le point de rendez-vous n’a pas pu être chargé."); } }
  function removeMeetingPoint(item: MeetingPointRecord) { NativeAlert.alert("Supprimer ce point ?", item.name, [{ text: "Annuler", style: "cancel" }, { text: "Supprimer", style: "destructive", onPress: () => { void tripsService.deleteMeetingPoint(item.id).then(() => setMeetingPoints((xs) => xs.filter((x) => x.id !== item.id))).catch(() => setAlertError("Le point n’a pas pu être supprimé.")); } }]); }
  async function inspectLocationShare(item: LocationShareRecord) { try { const detail = await tripsService.fetchLocationShare(item.id); setLocationShares((xs) => xs.map((x) => x.id === detail.id ? detail : x)); setActiveShare(detail); setSharing(!detail.stopped_at && new Date(detail.expires_at) > new Date()); } catch { setAlertError("Le détail du partage n’a pas pu être chargé."); } }
  function removeLocationShare(item: LocationShareRecord) { NativeAlert.alert("Supprimer ce partage ?", "Ses positions ne seront plus accessibles.", [{ text: "Annuler", style: "cancel" }, { text: "Supprimer", style: "destructive", onPress: () => { void tripsService.deleteLocationShare(item.id).then(() => { setLocationShares((xs) => xs.filter((x) => x.id !== item.id)); setLocationPoints((xs) => xs.filter((x) => x.share_id !== item.id)); if (activeShare?.id === item.id) { setActiveShare(null); setSharing(false); } }).catch(() => setAlertError("Le partage n’a pas pu être supprimé.")); } }]); }

  async function toggleLocationSharing(enabled: boolean) {
    if (!currentMember) { setAlertError("Ton compte doit être membre actif pour partager ta position."); return; }
    if (enabled) {
      try { const start = new Date(); const share = await tripsService.createLocationShare({ trip_id: id, member_id: currentMember.id, duration_mode: "24_hours", started_at: start.toISOString(), expires_at: new Date(start.getTime() + 24 * 60 * 60 * 1000).toISOString() }); setLocationShares((xs) => [share, ...xs]); setActiveShare(share); setSharing(true); }
      catch { setAlertError("Le partage n’a pas pu être activé."); }
    } else if (activeShare) {
      try { const stopped = await tripsService.updateLocationShare(activeShare.id, { stopped_at: new Date().toISOString() }); setLocationShares((xs) => xs.map((x) => x.id === stopped.id ? stopped : x)); setActiveShare(null); setSharing(false); }
      catch { setAlertError("Le partage n’a pas pu être arrêté."); }
    }
  }
  async function saveLocationPoint() {
    if (!activeShare) { setAlertError("Active d’abord le partage de position."); return; }
    const lat = Number(pointLat.replace(",", ".")); const lng = Number(pointLng.replace(",", "."));
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) { setAlertError("Saisis une latitude entre -90 et 90 et une longitude entre -180 et 180."); return; }
    try { const point = await tripsService.createLocationPoint({ share_id: activeShare.id, lat, lng, recorded_at: new Date().toISOString() }); setLocationPoints((xs) => [point, ...xs]); setPointLat(""); setPointLng(""); setAlertError(""); }
    catch { setAlertError("La coordonnée n’a pas pu être enregistrée."); }
  }
  async function loadLocationPoint(item: LocationPointRecord) { try { const detail = await tripsService.fetchLocationPoint(item.id); setEditingPoint(detail); setPointLat(String(detail.lat)); setPointLng(String(detail.lng)); } catch { setAlertError("Le détail de la coordonnée n’a pas pu être chargé."); } }
  async function saveEditedLocationPoint() { if (!editingPoint) return; const lat = Number(pointLat.replace(",", ".")); const lng = Number(pointLng.replace(",", ".")); if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) { setAlertError("Coordonnées invalides."); return; } try { const saved = await tripsService.updateLocationPoint(editingPoint.id, { lat, lng }); setLocationPoints((xs) => xs.map((x) => x.id === saved.id ? saved : x)); setEditingPoint(null); setPointLat(""); setPointLng(""); } catch { setAlertError("La coordonnée n’a pas pu être modifiée."); } }
  function removeLocationPoint(item: LocationPointRecord) { NativeAlert.alert("Supprimer cette position ?", "Cette coordonnée sera retirée de l’historique partagé.", [{ text: "Annuler", style: "cancel" }, { text: "Supprimer", style: "destructive", onPress: () => { void tripsService.deleteLocationPoint(item.id).then(() => setLocationPoints((xs) => xs.filter((x) => x.id !== item.id))).catch(() => setAlertError("La coordonnée n’a pas pu être supprimée.")); } }]); }

  async function submitEmergencyAlert() {
    if (!currentMember) return;
    const lat = Number(alertLat.replace(",", ".")); const lng = Number(alertLng.replace(",", "."));
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) { setAlertError("Saisis une latitude entre -90 et 90 et une longitude entre -180 et 180."); return; }
    setRequestBusy(true); setAlertError("");
    try {
      const created = await tripsService.createEmergencyAlert({ trip_id: id, member_id: currentMember.id, lat, lng, position_is_last_known: false, status: "active", triggered_at: new Date().toISOString() });
      const otherMembers = members.filter((m) => m.id !== currentMember.id);
      const createdRecipients = await Promise.all(otherMembers.map((m) => tripsService.createEmergencyAlertRecipient({ alert_id: created.id, member_id: m.id })));
      setAlerts((xs) => [created, ...xs]); setRecipients((xs) => [...createdRecipients, ...xs]); setAlertLat(""); setAlertLng("");
      if (createdRecipients.length < 1) setAlertError("Alerte enregistrée, mais aucun autre membre actif n’a pu être associé.");
    } catch { setAlertError("L’alerte ou ses destinataires n’ont pas pu être entièrement enregistrés. Vérifie les droits et recharge la page."); }
    finally { setRequestBusy(false); }
  }
  async function openEmergencyAlert(item: EmergencyAlertRecord) {
    try { const detail = await tripsService.fetchEmergencyAlert(item.id); const loaded = await tripsService.fetchEmergencyAlertRecipients(); setSelectedAlert(detail); setAlerts((xs) => xs.map((x) => x.id === detail.id ? detail : x)); setRecipients(loaded); }
    catch { setAlertError("Le détail de l’alerte n’a pas pu être chargé."); }
  }
  async function resolveEmergencyAlert(item: EmergencyAlertRecord) {
    try { const updated = await tripsService.updateEmergencyAlert(item.id, { status: "resolved", resolved_at: new Date().toISOString() }); setAlerts((xs) => xs.map((x) => x.id === updated.id ? updated : x)); if (selectedAlert?.id === updated.id) setSelectedAlert(updated); }
    catch { setAlertError("L’alerte n’a pas pu être résolue."); }
  }
  function removeEmergencyAlert(item: EmergencyAlertRecord) { NativeAlert.alert("Supprimer cette alerte ?", "Cette action la retire du voyage.", [{ text: "Annuler", style: "cancel" }, { text: "Supprimer", style: "destructive", onPress: () => { void tripsService.deleteEmergencyAlert(item.id).then(() => { setAlerts((xs) => xs.filter((x) => x.id !== item.id)); setRecipients((xs) => xs.filter((x) => x.alert_id !== item.id)); if (selectedAlert?.id === item.id) setSelectedAlert(null); }).catch(() => setAlertError("L’alerte n’a pas pu être supprimée.")); } }]); }
  async function acknowledgeRecipient(item: EmergencyAlertRecipientRecord) { try { const updated = await tripsService.updateEmergencyAlertRecipient(item.id, { acknowledged_at: new Date().toISOString() }); setRecipients((xs) => xs.map((x) => x.id === updated.id ? updated : x)); } catch { setAlertError("La confirmation n’a pas pu être enregistrée."); } }
  function removeRecipient(item: EmergencyAlertRecipientRecord) { NativeAlert.alert("Retirer ce destinataire ?", "Il sera dissocié de l’alerte.", [{ text: "Annuler", style: "cancel" }, { text: "Retirer", style: "destructive", onPress: () => { void tripsService.deleteEmergencyAlertRecipient(item.id).then(() => setRecipients((xs) => xs.filter((x) => x.id !== item.id))).catch(() => setAlertError("Le destinataire n’a pas pu être retiré.")); } }]); }

  async function submitExclusionRequest() {
    if (!currentMember) {
      setRequestError("Tu dois être membre actif de ce voyage pour envoyer une demande.");
      return;
    }
    if (!targetMemberId || !reason.trim() || requestBusy) return;
    setRequestBusy(true);
    try {
      await dispatch(createExclusionRequest({
        trip_id: id,
        target_member_id: targetMemberId,
        requested_by: currentMember.id,
        reason: reason.trim(),
      })).unwrap();
      setTargetMemberId("");
      setReason("");
      setRequestError("");
    } catch (error) {
      setRequestError(typeof error === "object" && error !== null && "message" in error
        ? String(error.message)
        : typeof error === "string" ? error : "La demande n’a pas pu être envoyée.");
    } finally {
      setRequestBusy(false);
    }
  }

  async function openExclusionRequest(request: ExclusionRequestRecord) { try { const detail = await tripsService.fetchExclusionRequest(request.id); setSelectedRequest(detail); } catch { setRequestError("Le détail de la demande n’a pas pu être chargé."); } }
  function removeExclusionRequest(request: ExclusionRequestRecord) { NativeAlert.alert("Supprimer cette demande ?", "Elle sera retirée du voyage.", [{ text: "Annuler", style: "cancel" }, { text: "Supprimer", style: "destructive", onPress: () => { void tripsService.deleteExclusionRequest(request.id).then(() => { setSelectedRequest(null); return dispatch(fetchExclusionRequests()).unwrap(); }).catch(() => setRequestError("La demande n’a pas pu être supprimée.")); } }]); }

  async function decideExclusionRequest(request: ExclusionRequestRecord, status: "approved" | "rejected") {
    if (requestBusy) return;
    setRequestBusy(true);
    try {
      await dispatch(updateExclusionRequest({ id: request.id, status, decided_at: new Date().toISOString() })).unwrap();
      setRequestError("");
    } catch (error) {
      setRequestError(typeof error === "object" && error !== null && "message" in error
        ? String(error.message)
        : typeof error === "string" ? error : "La décision n’a pas pu être enregistrée.");
    } finally {
      setRequestBusy(false);
    }
  }

  function memberLabel(memberId: string) {
    const member = members.find((item) => item.id === memberId);
    return member?.user?.first_name || member?.user?.email || "Membre du voyage";
  }

  return (
    <Page>
      <Header back title="Sécurité du voyage" />
      <AppText style={st.heading}>Voyage serein, ensemble.</AppText>
      <AppText style={st.sub}>Les alertes sont enregistrées sur l’API. Saisis tes coordonnées actuelles et vérifie-les avant l’envoi.</AppText>
      <Pressable onPress={() => router.push("/circles")}>
        <Surface style={st.banner}>
          <AppIcon name="shield" size={26} />
          <View style={{ flex: 1 }}><AppText style={st.title}>Tes contacts de confiance</AppText><AppText style={st.sub}>Voir et créer ton cercle d’amis</AppText></View>
          <AppText style={st.arrow}>›</AppText>
        </Surface>
      </Pressable>
      <SectionTitle title="Pendant le voyage" />
      <Surface style={st.card}>
        <View style={st.row}><View style={{ flex: 1 }}><AppText style={st.title}>Partager ma position</AppText><AppText style={st.sub}>{activeShare ? `Partage actif jusqu’au ${new Date(activeShare.expires_at).toLocaleString()}` : "Aucune coordonnée n’est lue automatiquement."}</AppText></View><Switch value={sharing} onValueChange={(value) => { setState("idle"); void toggleLocationSharing(value); }} trackColor={{ true: C.green }} /></View>
        <View style={st.row}><View style={{ flex: 1 }}><AppText style={st.title}>Pointage quotidien</AppText><AppText style={st.sub}>Rappel de démonstration pour rassurer le groupe</AppText></View><Switch value={checkin} onValueChange={setCheckin} trackColor={{ true: C.green }} /></View>
      </Surface>
      <SectionTitle title="Alertes d’urgence enregistrées" action={`${alerts.length}`} />
      {currentMember && <Surface style={st.requestCard}>
        <AppText style={st.title}>Signaler une urgence</AppText>
        <AppText style={st.sub}>Saisis ta position actuelle en latitude et longitude. L’application ne lit pas le GPS. Les membres actifs du voyage seront associés comme destinataires; la création n’envoie pas forcément une notification push.</AppText>
        <AppTextInput value={alertLat} onChangeText={setAlertLat} keyboardType="decimal-pad" placeholder="Latitude" style={st.reasonInput} />
        <AppTextInput value={alertLng} onChangeText={setAlertLng} keyboardType="decimal-pad" placeholder="Longitude" style={st.reasonInput} />
        <Pressable disabled={requestBusy} onPress={() => void submitEmergencyAlert()} style={[st.submitRequest, requestBusy && st.disabled]}><AppText style={st.submitRequestText}>{requestBusy ? "Enregistrement…" : "Enregistrer l’alerte"}</AppText></Pressable>
        {!!alertError && <AppText accessibilityRole="alert" style={st.requestError}>{alertError}</AppText>}
      </Surface>}
      {alerts.map((item) => <Surface key={item.id} style={st.requestRow}>
        <View style={{ flex: 1, gap: 3 }}><AppText style={st.title}>Alerte · {item.status || "active"}</AppText><AppText style={st.sub}>{item.lat}, {item.lng} · {item.position_is_last_known ? "dernière position connue" : "coordonnées saisies"}</AppText><AppText style={st.sub}>{recipients.filter((r) => r.alert_id === item.id).length} destinataire(s) associé(s)</AppText></View>
        <Pressable onPress={() => void openEmergencyAlert(item)}><AppText style={st.memberChoiceText}>Détails</AppText></Pressable>
        {item.status !== "resolved" && <Pressable onPress={() => void resolveEmergencyAlert(item)}><AppText style={st.memberChoiceText}>Résoudre</AppText></Pressable>}
        <Pressable onPress={() => removeEmergencyAlert(item)}><AppText style={st.memberSelectedText}>Supprimer</AppText></Pressable>
      </Surface>)}
      {!!selectedAlert && <Surface style={st.requestCard}><AppText style={st.title}>Destinataires de l’alerte</AppText>{recipients.filter((r) => r.alert_id === selectedAlert.id).map((recipient) => <View key={recipient.id} style={st.requestRow}><View style={{ flex: 1 }}><AppText style={st.sub}>{memberLabel(recipient.member_id)} · {recipient.acknowledged_at ? "a confirmé la réception" : "en attente de confirmation"}</AppText></View>{recipient.member_id === currentMember?.id && !recipient.acknowledged_at && <Pressable onPress={() => void acknowledgeRecipient(recipient)}><AppText style={st.memberChoiceText}>Confirmer</AppText></Pressable>}<Pressable onPress={() => removeRecipient(recipient)}><AppText style={st.memberChoiceText}>Retirer</AppText></Pressable></View>)}<Pressable onPress={() => setSelectedAlert(null)}><AppText style={st.memberChoiceText}>Fermer</AppText></Pressable></Surface>}
      <SectionTitle title="Points de rendez-vous" action={`${meetingPoints.length}`} />
      {currentMember && <Surface style={st.requestCard}><AppText style={st.title}>{editingMeeting ? "Modifier le point" : "Ajouter un point de rendez-vous"}</AppText><AppTextInput value={meetingName} onChangeText={setMeetingName} placeholder="Nom du lieu" style={st.reasonInput} /><AppTextInput value={meetingInstructions} onChangeText={setMeetingInstructions} placeholder="Consignes (facultatif)" style={st.reasonInput} /><View style={st.actions}><AppTextInput value={meetingLat} onChangeText={setMeetingLat} keyboardType="decimal-pad" placeholder="Latitude (facultatif)" style={[st.reasonInput, { flex: 1 }]} /><AppTextInput value={meetingLng} onChangeText={setMeetingLng} keyboardType="decimal-pad" placeholder="Longitude" style={[st.reasonInput, { flex: 1 }]} /></View><Pressable onPress={() => void saveMeetingPoint()} style={st.submitRequest}><AppText style={st.submitRequestText}>{editingMeeting ? "Enregistrer" : "Créer le point"}</AppText></Pressable></Surface>}
      {meetingPoints.map((item) => <Surface key={item.id} style={st.requestRow}><View style={{ flex: 1 }}><AppText style={st.title}>{item.name}</AppText><AppText style={st.sub}>{item.instructions || (item.lat !== null && item.lng !== null ? `${item.lat}, ${item.lng}` : "Coordonnées non précisées")}</AppText></View><Pressable onPress={() => void editMeetingPoint(item)}><AppText style={st.memberChoiceText}>Modifier</AppText></Pressable><Pressable onPress={() => removeMeetingPoint(item)}><AppText style={st.requestError}>Supprimer</AppText></Pressable></Surface>)}
      <SectionTitle title="Positions partagées" action={`${locationPoints.filter((p) => locationShares.some((sh) => sh.id === p.share_id)).length}`} />
      {activeShare && <Surface style={st.requestCard}><AppText style={st.title}>Enregistrer ma position actuelle</AppText><AppText style={st.sub}>La position est saisie manuellement et visible aux membres autorisés du voyage.</AppText><AppTextInput value={pointLat} onChangeText={setPointLat} keyboardType="decimal-pad" placeholder="Latitude" style={st.reasonInput} /><AppTextInput value={pointLng} onChangeText={setPointLng} keyboardType="decimal-pad" placeholder="Longitude" style={st.reasonInput} /><Pressable onPress={() => void (editingPoint ? saveEditedLocationPoint() : saveLocationPoint())} style={st.submitRequest}><AppText style={st.submitRequestText}>{editingPoint ? "Enregistrer les changements" : "Partager cette position"}</AppText></Pressable>{editingPoint && <Pressable onPress={() => { setEditingPoint(null); setPointLat(""); setPointLng(""); }}><AppText style={st.sub}>Annuler la modification</AppText></Pressable>}</Surface>}
      {locationShares.filter((share) => share.member_id === currentMember?.id).map((share) => <Surface key={share.id} style={st.requestRow}><View style={{ flex: 1 }}><AppText style={st.title}>Partage · {share.stopped_at ? "arrêté" : new Date(share.expires_at) > new Date() ? "actif" : "expiré"}</AppText><AppText style={st.sub}>Expire {new Date(share.expires_at).toLocaleString()}</AppText></View><Pressable onPress={() => void inspectLocationShare(share)}><AppText style={st.memberChoiceText}>Détails</AppText></Pressable>{!share.stopped_at && new Date(share.expires_at) > new Date() && <Pressable onPress={() => void toggleLocationSharing(false)}><AppText style={st.requestError}>Arrêter</AppText></Pressable>}<Pressable onPress={() => removeLocationShare(share)}><AppText style={st.requestError}>Supprimer</AppText></Pressable></Surface>)}
      {locationPoints.filter((point) => locationShares.some((share) => share.id === point.share_id && share.member_id === currentMember?.id)).map((point) => <Surface key={point.id} style={st.requestRow}><View style={{ flex: 1 }}><AppText style={st.title}>{point.lat}, {point.lng}</AppText><AppText style={st.sub}>{new Date(point.recorded_at).toLocaleString()}</AppText></View><Pressable onPress={() => void loadLocationPoint(point)}><AppText style={st.memberChoiceText}>Modifier</AppText></Pressable><Pressable onPress={() => removeLocationPoint(point)}><AppText style={st.requestError}>Supprimer</AppText></Pressable></Surface>)}
      <SectionTitle title="Demandes concernant les membres" />
      <Surface style={st.requestCard}>
        <AppText style={st.title}>Demander le retrait d’un membre</AppText>
        <AppText style={st.sub}>La demande est transmise au groupe pour examen. Elle ne retire pas automatiquement la personne du voyage.</AppText>
        {members.filter((member) => member.id !== currentMember?.id).map((member) => (
          <Pressable key={member.id} accessibilityRole="button" accessibilityState={{ selected: targetMemberId === member.id }} onPress={() => setTargetMemberId(member.id)} style={[st.memberChoice, targetMemberId === member.id && st.memberSelected]}>
            <AppText style={[st.memberChoiceText, targetMemberId === member.id && st.memberSelectedText]}>{member.user?.first_name || member.user?.email || "Membre du voyage"}</AppText>
            <AppText style={[st.memberChoiceText, targetMemberId === member.id && st.memberSelectedText]}>{targetMemberId === member.id ? "✓" : "Choisir"}</AppText>
          </Pressable>
        ))}
        {members.filter((member) => member.id !== currentMember?.id).length === 0 && <AppText style={st.sub}>Aucun autre membre actif à sélectionner.</AppText>}
        <AppTextInput value={reason} onChangeText={setReason} placeholder="Explique la raison de ta demande" multiline style={st.reasonInput} />
        <Pressable disabled={requestBusy || !targetMemberId || !reason.trim()} onPress={() => void submitExclusionRequest()} style={[st.submitRequest, (requestBusy || !targetMemberId || !reason.trim()) && st.disabled]}><AppText style={st.submitRequestText}>{requestBusy ? "Enregistrement…" : "Envoyer la demande"}</AppText></Pressable>
        {requests.map((request) => {
          const pending = !request.status || request.status === "pending";
          return <View key={request.id} style={st.requestRow}>
            <View style={{ flex: 1, gap: 3 }}>
              <AppText style={st.title}>{memberLabel(request.target_member_id)}</AppText>
              <AppText style={st.sub}>{request.reason}</AppText>
              <AppText style={st.requestStatus}>{request.status === "approved" ? "Demande approuvée" : request.status === "rejected" ? "Demande refusée" : "En attente d’examen"}</AppText>
              <Pressable onPress={() => void openExclusionRequest(request)}><AppText style={st.memberChoiceText}>Charger le détail complet</AppText></Pressable>
              {selectedRequest?.id === request.id && <AppText style={st.sub}>Créée le {new Date(selectedRequest.created_at).toLocaleString()} · {selectedRequest.decided_at ? `décidée le ${new Date(selectedRequest.decided_at).toLocaleString()}` : "non décidée"}</AppText>}
            </View>
            <Pressable onPress={() => removeExclusionRequest(request)}><AppText style={st.requestError}>Supprimer</AppText></Pressable>
            {pending && currentMember?.role === "organizer" && <View style={st.decisionButtons}>
              <Pressable disabled={requestBusy} onPress={() => void decideExclusionRequest(request, "approved")} style={st.approveButton}><AppText style={st.decisionText}>Approuver</AppText></Pressable>
              <Pressable disabled={requestBusy} onPress={() => void decideExclusionRequest(request, "rejected")} style={st.rejectButton}><AppText style={st.decisionText}>Refuser</AppText></Pressable>
            </View>}
          </View>;
        })}
        {!!requestError && <AppText accessibilityRole="alert" style={st.requestError}>{requestError}</AppText>}
      </Surface>
      <SectionTitle title="Simulation d’écart de trajet" />
      <Surface style={st.scenario}>
        <View style={st.scenarioHead}><AppIcon name="pin" size={22} /><View style={{ flex: 1 }}><AppText style={st.title}>Tu t’es éloigné·e du groupe ?</AppText><AppText style={st.sub}>{sharing ? "Point de trajet fictif · Cotonou" : "Active le partage simulé pour essayer ce parcours."}</AppText></View></View>
        <Pressable disabled={!sharing} onPress={() => { setState("idle"); setAlert(true); }} style={[st.outlineButton, !sharing && st.disabled]}><AppText style={st.outlineText}>Simuler un écart de trajet</AppText></Pressable>
        {!!alert && <View style={st.prompt}><AppText style={st.promptTitle}>Tout va bien ?</AppText><AppText style={st.sub}>Le groupe attend ton pointage. Choisis une réponse pour voir ce qui se passerait.</AppText><View style={st.actions}><Pressable onPress={() => { setState("safe"); setAlert(false); }} style={st.safeButton}><AppText style={st.safeText}>Tout va bien</AppText></Pressable><Pressable onPress={() => { setState("help"); setAlert(false); }} style={st.helpButton}><AppText style={st.helpText}>Je suis perdu·e</AppText></Pressable></View></View>}
        {state === "safe" && <AppText style={st.success}>Pointage enregistré · le groupe est rassuré ✓</AppText>}
        {state === "help" && <View style={st.helpNotice}><AppText style={st.helpText}>Demande d’aide simulée</AppText><AppText style={st.sub}>Dans la vraie application, il faudrait confirmer la position et prévenir les contacts choisis. Rien n’a été envoyé ici.</AppText></View>}
        {!sharing && <AppText style={st.hint}>Active le bouton « Partager ma position » pour débloquer la simulation.</AppText>}
      </Surface>
      <SectionTitle title="Point de rendez-vous" />
      <Surface style={st.row}><AppIcon name="pin" size={22} /><View style={{ flex: 1 }}><AppText style={st.title}>Place de l’Étoile</AppText><AppText style={st.sub}>Lieu de rencontre de démonstration</AppText></View><AppText style={st.arrow}>›</AppText></Surface>
      <SectionTitle title="Besoin d’aide ?" />
      <Surface style={st.help}><AppText style={st.title}>Numéros utiles du voyage</AppText><AppText style={st.sub}>Ambassade · contact d’urgence du groupe · services locaux</AppText><AppText style={st.note}>Vérifie les numéros officiels de ta destination avant le départ. Cette maquette n’appelle aucun service.</AppText></Surface>
      <Pressable style={st.sos} onPress={() => { setAlert(false); setState("help"); }}><AppText style={st.sosText}>{state === "help" ? "Demande d’aide simulée ✓" : "Déclencher une alerte de test"}</AppText></Pressable>
      <AppText style={st.foot}>Aucune position n’est lue automatiquement. Les coordonnées sont transmises uniquement après saisie et action explicite.</AppText>
    </Page>
  );
}

const st = StyleSheet.create({
  heading: { fontSize: 27, fontWeight: "900", color: C.ink },
  requestCard: { gap: 10 },
  memberChoice: { minHeight: 42, paddingHorizontal: 11, borderRadius: 11, backgroundColor: "#F5F6F1", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  memberSelected: { backgroundColor: C.green },
  memberChoiceText: { fontSize: 11, color: C.ink, fontWeight: "700" },
  memberSelectedText: { color: C.white },
  reasonInput: { minHeight: 82, borderRadius: 12, borderWidth: 1, borderColor: C.line, backgroundColor: C.white, padding: 12, color: C.ink, textAlignVertical: "top" },
  submitRequest: { minHeight: 44, borderRadius: 12, backgroundColor: C.green, alignItems: "center", justifyContent: "center", padding: 10 },
  submitRequestText: { color: C.white, fontSize: 11, fontWeight: "900" },
  requestRow: { borderTopWidth: 1, borderColor: C.line, paddingTop: 10, gap: 8 },
  requestStatus: { fontSize: 10, color: C.green, fontWeight: "800" },
  decisionButtons: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  approveButton: { flex: 1, minHeight: 40, borderRadius: 10, backgroundColor: C.green, alignItems: "center", justifyContent: "center", padding: 8 },
  rejectButton: { flex: 1, minHeight: 40, borderRadius: 10, backgroundColor: "#A7493C", alignItems: "center", justifyContent: "center", padding: 8 },
  decisionText: { color: C.white, fontSize: 10, fontWeight: "900" },
  requestError: { fontSize: 11, color: "#A7493C", fontWeight: "800" },
  sub: { fontSize: 11, color: C.muted, lineHeight: 16 },
  banner: { flexDirection: "row", gap: 12, alignItems: "center", backgroundColor: "#EDF3E8" },
  title: { fontSize: 12, fontWeight: "900", color: C.ink },
  card: { gap: 0 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13, borderBottomWidth: 1, borderColor: C.line, flex: 1 },
  arrow: { fontSize: 20, color: C.green },
  scenario: { gap: 12 }, scenarioHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  outlineButton: { minHeight: 44, borderWidth: 1, borderColor: C.green, borderRadius: 13, alignItems: "center", justifyContent: "center", paddingHorizontal: 12 },
  outlineText: { color: C.green, fontSize: 11, fontWeight: "900" }, disabled: { opacity: 0.4 },
  prompt: { gap: 9, borderRadius: 14, backgroundColor: "#F4F2E8", padding: 13 }, promptTitle: { color: C.ink, fontSize: 14, fontWeight: "900" },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, safeButton: { flex: 1, minWidth: 120, alignItems: "center", padding: 11, borderRadius: 11, backgroundColor: C.green }, safeText: { color: C.white, fontSize: 10, fontWeight: "900" },
  helpButton: { flex: 1, minWidth: 120, alignItems: "center", padding: 11, borderRadius: 11, backgroundColor: "#A7493C" }, helpText: { color: "#A7493C", fontSize: 10, fontWeight: "900" },
  success: { color: C.green, fontSize: 11, fontWeight: "900" }, helpNotice: { gap: 6, backgroundColor: "#F9EAE6", padding: 12, borderRadius: 12 },
  hint: { fontSize: 10, lineHeight: 15, color: C.muted }, help: { gap: 8, backgroundColor: "#F1F3EC" }, note: { fontSize: 10, color: C.muted, lineHeight: 15 },
  sos: { minHeight: 52, backgroundColor: "#A7493C", borderRadius: 16, alignItems: "center", justifyContent: "center", paddingHorizontal: 12 }, sosText: { color: C.white, fontWeight: "900", fontSize: 12 },
  foot: { fontSize: 9, color: C.muted, lineHeight: 14, textAlign: "center" },
});
