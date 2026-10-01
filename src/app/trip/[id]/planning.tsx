import { AppIcon } from "@/components/app-icon";
import { AppText, AppTextInput } from "@/components/app-text";
import { C, Header, Page, SectionTitle, Surface } from "@/components/app-ui";
import { useAppSelector } from "@/hooks/redux";
import { tripsService } from "@/services/tripsService";
import type { DestinationProposalRecord, PollAnswerRecord, PollOptionRecord, PollRecord, TripMemberRecord, TripRecord } from "@/interface/trips";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

export default function Planning() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAppSelector((state) => state.auth.user);
  const [members, setMembers] = useState<TripMemberRecord[]>([]);
  const [trip, setTrip] = useState<TripRecord | null>(null);
  const [selectedMember, setSelectedMember] = useState<TripMemberRecord | null>(null);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationBody, setNotificationBody] = useState("");
  const [notificationNotice, setNotificationNotice] = useState("");
  const [proposals, setProposals] = useState<DestinationProposalRecord[]>([]);
  const [polls, setPolls] = useState<PollRecord[]>([]);
  const [options, setOptions] = useState<PollOptionRecord[]>([]);
  const [answers, setAnswers] = useState<PollAnswerRecord[]>([]);
  const [proposalName, setProposalName] = useState("");
  const [proposalPitch, setProposalPitch] = useState("");
  const [editingProposal, setEditingProposal] = useState<DestinationProposalRecord | null>(null);
  const [proposalCost, setProposalCost] = useState("");
  const [pollTitle, setPollTitle] = useState("");
  const [pollChoices, setPollChoices] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const member = members.find((item) => item.user_id === user?.id && item.status === "active");
  const canManageTrip = trip?.creator_id === user?.id || ["creator", "co_organizer"].includes(member?.role ?? "");

  useEffect(() => {
    let active = true;
    Promise.all([
      tripsService.fetchTripMembers(id),
      tripsService.fetchTrip(id),
      tripsService.fetchDestinationProposals(),
      tripsService.fetchPolls(id),
      tripsService.fetchPollAnswers(),
    ]).then(async ([tripMembers, tripRecord, allProposals, loadedPolls, loadedAnswers]) => {
      const tripProposals = allProposals.filter((item) => item.trip_id === id);
      const loadedOptions = (await Promise.all(loadedPolls.map((poll) => tripsService.fetchPollOptions(poll.id)))).flat();
      if (active) {
        setMembers(tripMembers); setTrip(tripRecord); setProposals(tripProposals); setPolls(loadedPolls);
        setOptions(loadedOptions); setAnswers(loadedAnswers); setError("");
      }
    }).catch(() => { if (active) setError("Les décisions du voyage n’ont pas pu être chargées."); });
    return () => { active = false; };
  }, [id]);

  async function manageMember(id: string) {
    try { setSelectedMember(await tripsService.fetchTripMember(id)); setError(""); }
    catch { setError("Les informations de ce membre n’ont pas pu être chargées."); }
  }

  async function changeMemberRole(role: "member" | "co_organizer") {
    if (!selectedMember || !canManageTrip) return;
    setBusy(true);
    try {
      const updated = await tripsService.updateTripMember(selectedMember.id, { role });
      setMembers((current) => current.map((item) => item.id === updated.id ? updated : item)); setSelectedMember(updated); setError("");
    } catch { setError("Le rôle n’a pas pu être modifié. Seuls les organisateurs peuvent gérer les rôles."); }
    finally { setBusy(false); }
  }

  function confirmRemoveMember(target: TripMemberRecord) {
    const self = target.user_id === user?.id;
    Alert.alert(self ? "Quitter ce voyage ?" : "Retirer ce membre ?", self ? "Tu ne feras plus partie de ce voyage." : "Ce membre sera retiré du voyage.", [
      { text: "Annuler", style: "cancel" },
      { text: self ? "Quitter" : "Retirer", style: "destructive", onPress: () => { void (async () => {
        try { await tripsService.deleteTripMember(target.id); setMembers((current) => current.filter((item) => item.id !== target.id)); setSelectedMember(null); setError(""); }
        catch { setError("Ce membre n’a pas pu être retiré. Vérifie tes droits d’organisateur."); }
      })(); } },
    ]);
  }

  async function sendTripNotification() {
    if (!notificationTitle.trim() || !notificationBody.trim() || !canManageTrip || busy) return;
    setBusy(true);
    try {
      const result = await tripsService.notifyTrip(id, { title: notificationTitle.trim(), body: notificationBody.trim(), category: "normal" });
      setNotificationNotice(`Notification envoyée à ${result.recipients} membre(s) actif(s).`); setNotificationTitle(""); setNotificationBody(""); setError("");
    } catch { setError("La notification n’a pas pu être envoyée. Vérifie que tu es organisateur du voyage."); }
    finally { setBusy(false); }
  }

  async function addProposal() {
    if (!member) { setError("Ton compte doit être membre actif de ce voyage pour proposer une destination."); return; }
    if (!proposalName.trim() || busy) return;
    setBusy(true);
    try {
      const created = await tripsService.createDestinationProposal({ trip_id: id, proposed_by: member.id, name: proposalName.trim(), pitch: proposalPitch.trim() || null });
      setProposals((current) => [created, ...current]); setProposalName(""); setProposalPitch(""); setError("");
    } catch { setError("La proposition n’a pas pu être enregistrée."); }
    finally { setBusy(false); }
  }

  async function editProposal(proposal: DestinationProposalRecord) {
    try { const detail = await tripsService.fetchDestinationProposal(proposal.id); setEditingProposal(detail); setProposalName(detail.name); setProposalPitch(detail.pitch ?? ""); setProposalCost(detail.estimated_cost == null ? "" : String(detail.estimated_cost)); setError(""); }
    catch { setError("Le détail de cette proposition n’a pas pu être chargé."); }
  }
  async function saveProposal() {
    if (!editingProposal || !proposalName.trim()) return;
    const cost = proposalCost.trim() ? Number(proposalCost.replace(/\s/g, "")) : null;
    if (cost !== null && (!Number.isFinite(cost) || cost < 0)) { setError("Saisis un coût estimé valide."); return; }
    try { const saved = await tripsService.updateDestinationProposal(editingProposal.id, { name: proposalName.trim(), pitch: proposalPitch.trim() || null, estimated_cost: cost }); setProposals((xs) => xs.map((x) => x.id === saved.id ? saved : x)); setEditingProposal(null); setProposalName(""); setProposalPitch(""); setProposalCost(""); setError(""); }
    catch { setError("La proposition n’a pas pu être modifiée."); }
  }
  function deleteProposal(proposal: DestinationProposalRecord) { Alert.alert("Supprimer la proposition ?", proposal.name, [{ text: "Annuler", style: "cancel" }, { text: "Supprimer", style: "destructive", onPress: () => { void (async () => { try { await tripsService.deleteDestinationProposal(proposal.id); setProposals((xs) => xs.filter((x) => x.id !== proposal.id)); if (editingProposal?.id === proposal.id) setEditingProposal(null); } catch { setError("La proposition n’a pas pu être supprimée."); } })(); } }]); }

  async function createPoll() {
    if (!user || !pollTitle.trim() || busy) return;
    const labels = pollChoices.split(/\n|,/).map((value) => value.trim()).filter(Boolean);
    if (labels.length < 2) { setError("Ajoute au moins deux choix séparés par une virgule ou une nouvelle ligne."); return; }
    setBusy(true);
    try {
      const poll = await tripsService.createPoll({ trip_id: id, created_by: user.id, type: "trip_decision", title: pollTitle.trim() });
      const createdOptions = await Promise.all(labels.map((label, position) => tripsService.createPollOption({ poll_id: poll.id, label, position })));
      setPolls((current) => [poll, ...current]); setOptions((current) => [...current, ...createdOptions]); setPollTitle(""); setPollChoices(""); setError("");
    } catch { setError("Le sondage n’a pas pu être entièrement créé. Recharge la page pour vérifier son état."); }
    finally { setBusy(false); }
  }

  async function inspectPoll(poll: PollRecord) {
    try { const [detail, pollOptions] = await Promise.all([tripsService.fetchPoll(poll.id), tripsService.fetchPollOptions(poll.id)]); setPolls((items) => items.map((item) => item.id === poll.id ? detail : item)); setOptions((items) => [...items.filter((item) => item.poll_id !== poll.id), ...pollOptions]); setError(""); }
    catch { setError("Le sondage n’a pas pu être rechargé depuis le serveur."); }
  }
  function deletePoll(poll: PollRecord) {
    Alert.alert("Supprimer ce sondage ?", poll.title, [{ text: "Annuler", style: "cancel" }, { text: "Supprimer", style: "destructive", onPress: () => { void (async () => { try { await tripsService.deletePoll(poll.id); setPolls((items) => items.filter((item) => item.id !== poll.id)); setOptions((items) => items.filter((item) => item.poll_id !== poll.id)); const optionIds = new Set(options.filter((item) => item.poll_id === poll.id).map((item) => item.id)); setAnswers((items) => items.filter((item) => !optionIds.has(item.option_id))); } catch { setError("Le sondage n’a pas pu être supprimé."); } })(); } }]);
  }
  function deletePollAnswer(answer: PollAnswerRecord) {
    Alert.alert("Retirer ton vote ?", "Ton choix sera supprimé.", [{ text: "Annuler", style: "cancel" }, { text: "Retirer", style: "destructive", onPress: () => { void tripsService.deletePollAnswer(answer.id).then(() => setAnswers((items) => items.filter((item) => item.id !== answer.id))).catch(() => setError("Le vote n’a pas pu être retiré.")); } }]);
  }

  async function vote(option: PollOptionRecord) {
    if (!member || busy) { if (!member) setError("Ton compte doit être membre actif pour voter."); return; }
    const previous = answers.find((answer) => answer.member_id === member.id && options.some((item) => item.id === answer.option_id && item.poll_id === option.poll_id));
    setBusy(true);
    try {
      const saved = previous ? await tripsService.updatePollAnswer(previous.id, option.id) : await tripsService.createPollAnswer({ option_id: option.id, member_id: member.id });
      setAnswers((current) => previous ? current.map((answer) => answer.id === saved.id ? saved : answer) : [...current, saved]); setError("");
    } catch { setError("Ton vote n’a pas pu être enregistré."); }
    finally { setBusy(false); }
  }

  return (
    <Page>
      <Header back title="Organisation du groupe" />
      <AppText style={st.heading}>On décide ensemble.</AppText>
      <AppText style={st.sub}>Propositions et votes enregistrés sur ce voyage.</AppText>
      <SectionTitle title="Membres du voyage" action={`${members.length}`} />
      {members.map((person) => <Surface key={person.id} style={st.memberCard}>
        <View style={{ flex: 1 }}><AppText style={st.title}>{person.user?.first_name || person.user?.email || "Voyageur"}</AppText><AppText style={st.sub}>{person.role} · {person.status}</AppText></View>
        <Pressable onPress={() => void manageMember(person.id)} style={st.memberAction}><AppText style={st.memberActionText}>{selectedMember?.id === person.id ? "Sélectionné" : "Détails"}</AppText></Pressable>
        {(canManageTrip || person.user_id === user?.id) && <Pressable onPress={() => confirmRemoveMember(person)} style={st.memberRemove}><AppText style={st.memberRemoveText}>{person.user_id === user?.id ? "Quitter" : "Retirer"}</AppText></Pressable>}
      </Surface>)}
      {selectedMember && <Surface style={st.memberTools}>
        <AppText style={st.title}>Gérer {selectedMember.user?.first_name || "ce membre"}</AppText>
        <AppText style={st.sub}>Rôle actuel : {selectedMember.role}</AppText>
        {canManageTrip && selectedMember.user_id !== user?.id && <View style={st.memberActions}><Pressable disabled={busy} onPress={() => void changeMemberRole(selectedMember.role === "co_organizer" ? "member" : "co_organizer")} style={st.memberAction}><AppText style={st.memberActionText}>{selectedMember.role === "co_organizer" ? "Rétablir membre" : "Nommer co-organisateur"}</AppText></Pressable></View>}
      </Surface>}
      {!canManageTrip && <AppText style={st.sub}>Les rôles et notifications sont réservés aux organisateurs du voyage.</AppText>}
      {canManageTrip && <><SectionTitle title="Informer le groupe" /><Surface style={st.form}><AppTextInput value={notificationTitle} onChangeText={setNotificationTitle} placeholder="Titre de la notification" style={st.input} /><AppTextInput value={notificationBody} onChangeText={setNotificationBody} placeholder="Message aux voyageurs actifs" multiline style={[st.input, { minHeight: 70, textAlignVertical: "top" }]} /><Pressable disabled={busy || !notificationTitle.trim() || !notificationBody.trim()} onPress={() => void sendTripNotification()} style={st.action}><AppText style={st.actionText}>{busy ? "Envoi…" : "Envoyer au groupe"}</AppText></Pressable>{!!notificationNotice && <AppText style={st.notice}>{notificationNotice}</AppText>}</Surface></>}
      <SectionTitle title="Destinations proposées" />
      <Surface style={st.form}>
        <AppTextInput value={proposalName} onChangeText={setProposalName} placeholder="Ville ou destination" style={st.input} />
        <AppTextInput value={proposalPitch} onChangeText={setProposalPitch} placeholder="Pourquoi cette destination ? (facultatif)" style={st.input} />
        <AppTextInput value={proposalCost} onChangeText={setProposalCost} keyboardType="decimal-pad" placeholder="Coût estimé (facultatif)" style={st.input} />
        <View style={st.memberActions}><Pressable disabled={busy} onPress={() => editingProposal ? void saveProposal() : void addProposal()} style={[st.action, { flex: 1 }]}><AppText style={st.actionText}>{editingProposal ? "Enregistrer" : "Proposer la destination"}</AppText></Pressable>{editingProposal && <Pressable onPress={() => { setEditingProposal(null); setProposalName(""); setProposalPitch(""); setProposalCost(""); }}><AppText style={st.sub}>Annuler</AppText></Pressable>}</View>
      </Surface>
      {proposals.map((proposal) => <Surface key={proposal.id} style={st.proposal}><AppIcon name="pin" size={19} /><View style={{ flex: 1 }}><AppText style={st.title}>{proposal.name}</AppText><AppText style={st.sub}>{proposal.pitch || "Proposition du groupe"}</AppText>{proposal.estimated_cost !== null && <AppText style={st.cost}>{proposal.estimated_cost.toLocaleString("fr-FR")} XOF</AppText>}</View><Pressable onPress={() => void editProposal(proposal)}><AppText style={st.memberActionText}>Modifier</AppText></Pressable><Pressable onPress={() => deleteProposal(proposal)}><AppText style={st.memberRemoveText}>Supprimer</AppText></Pressable></Surface>)}
      {!proposals.length && <AppText style={st.sub}>Aucune destination proposée pour le moment.</AppText>}
      <SectionTitle title="Créer un sondage" />
      <Surface style={st.form}>
        <AppTextInput value={pollTitle} onChangeText={setPollTitle} placeholder="Ex. Quelle date vous arrange ?" style={st.input} />
        <AppTextInput value={pollChoices} onChangeText={setPollChoices} placeholder="Choix séparés par virgule ou nouvelle ligne" multiline style={[st.input, { minHeight: 72, textAlignVertical: "top" }]} />
        <Pressable disabled={busy} onPress={() => void createPoll()} style={st.action}><AppText style={st.actionText}>Créer le sondage</AppText></Pressable>
      </Surface>
      <SectionTitle title="Sondages du groupe" />
      {polls.map((poll) => {
        const pollOptions = options.filter((option) => option.poll_id === poll.id);
        const pollAnswers = answers.filter((answer) => pollOptions.some((option) => option.id === answer.option_id));
        return <Surface key={poll.id} style={st.poll}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}><Pressable onPress={() => void inspectPoll(poll)} style={{ flex: 1 }}><AppText style={st.title}>{poll.title}</AppText><AppText style={st.sub}>Recharger le détail</AppText></Pressable>{canManageTrip && <Pressable onPress={() => deletePoll(poll)}><AppText style={st.memberRemoveText}>Supprimer</AppText></Pressable>}</View>
          {pollOptions.map((option) => {
            const count = pollAnswers.filter((answer) => answer.option_id === option.id).length;
            const selected = answers.some((answer) => answer.member_id === member?.id && answer.option_id === option.id);
            return <Pressable key={option.id} disabled={busy} onPress={() => void vote(option)} onLongPress={() => { const myAnswer = pollAnswers.find((answer) => answer.member_id === member?.id && answer.option_id === option.id); if (myAnswer) deletePollAnswer(myAnswer); }} style={[st.option, selected && st.optionSelected]}><AppText style={[st.optionText, selected && st.optionTextSelected]}>{option.label}</AppText><AppText style={[st.votes, selected && st.optionTextSelected]}>{count} vote(s){selected ? " · Ton choix ✓" : ""}</AppText></Pressable>;
          })}
          {!pollOptions.length && <AppText style={st.sub}>Ce sondage n’a pas encore de choix.</AppText>}
        </Surface>;
      })}
      {!polls.length && <AppText style={st.sub}>Aucun sondage pour l’instant. Crée le premier ci-dessus.</AppText>}
      {!!error && <AppText accessibilityRole="alert" style={st.error}>{error}</AppText>}
    </Page>
  );
}
const st = StyleSheet.create({ heading: { fontSize: 27, fontWeight: "900", color: C.ink }, sub: { fontSize: 11, color: C.muted, lineHeight: 16 }, form: { gap: 9 }, memberCard: { flexDirection: "row", alignItems: "center", gap: 8 }, memberTools: { gap: 8, backgroundColor: "#EEF3E9" }, memberActions: { flexDirection: "row", gap: 8 }, memberAction: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 9, backgroundColor: "#EDF2E8" }, memberActionText: { color: C.green, fontSize: 9, fontWeight: "900" }, memberRemove: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 9, backgroundColor: "#F8EAE5" }, memberRemoveText: { color: "#A7493C", fontSize: 9, fontWeight: "900" }, notice: { color: C.green, fontSize: 10, fontWeight: "800" }, input: { minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: C.line, backgroundColor: C.white, paddingHorizontal: 12, color: C.ink }, action: { minHeight: 44, borderRadius: 12, backgroundColor: C.green, alignItems: "center", justifyContent: "center", padding: 10 }, actionText: { fontSize: 11, color: C.white, fontWeight: "900" }, proposal: { flexDirection: "row", alignItems: "center", gap: 10 }, title: { fontSize: 13, fontWeight: "900", color: C.ink }, cost: { fontSize: 9, color: C.green, fontWeight: "800" }, poll: { gap: 9 }, option: { minHeight: 42, paddingHorizontal: 11, borderRadius: 11, backgroundColor: "#F5F6F1", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }, optionSelected: { backgroundColor: C.green }, optionText: { flex: 1, fontSize: 11, color: C.ink, fontWeight: "700" }, votes: { fontSize: 9, color: C.muted }, optionTextSelected: { color: C.white }, error: { fontSize: 11, color: "#A7493C", fontWeight: "800" } });
