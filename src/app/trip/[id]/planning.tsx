import { AppText, AppTextInput } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { recordGroupActivity } from "@/data/group-activity";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { C, Header, Page, SectionTitle, Surface } from "@/components/app-ui";

const pollTypes = [
  { id: "date", title: "Quelle date vous arrange ?", icon: "clock", options: ["Vendredi 18 h", "Samedi 10 h", "Dimanche 16 h"] },
  { id: "restaurant", title: "Où est-ce qu’on mange ?", icon: "restaurant", options: ["La table du marché", "Chez Awa", "Terrasse des voyageurs"] },
  { id: "activity", title: "Quelle activité choisir ?", icon: "star", options: ["Visite guidée", "Balade et photos", "Atelier de cuisine"] },
];
const ideas = [{ name: "Porto-Novo", detail: "Architecture, musées et marchés", emoji: "🏛️" }, { name: "Ouidah", detail: "Route des Esclaves et plage", emoji: "🌊" }, { name: "Ganvié", detail: "Balade en pirogue sur le lac", emoji: "🛶" }];

export default function Planning() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [votes, setVotes] = useState<Record<string, string>>({ "date": "Samedi 10 h", restaurant: "Chez Awa" });
  const [proposed, setProposed] = useState<Record<string, string[]>>({});
  const [proposalText, setProposalText] = useState<Record<string, string>>({});
  const [activities, setActivities] = useState(["Visite du marché local", "Dîner tous ensemble"]);
  const [text, setText] = useState("");
  const [invited, setInvited] = useState(false);
  const [reminder, setReminder] = useState(false);
  const [meeting, setMeeting] = useState(false);
  function vote(pollId: string, choice: string) {
    setVotes((current) => ({ ...current, [pollId]: choice }));
    const poll = pollTypes.find((item) => item.id === pollId);
    recordGroupActivity({ category: "trip", groupId: id, groupName: "Organisation du voyage", title: "Un vote a été enregistré", description: `${poll?.title ?? "Sondage"} · ${choice}`, actor: "Toi", icon: "check", href: `/trip/${id}/planning` });
  }
  function addProposal(pollId: string) {
    const value = proposalText[pollId]?.trim();
    if (!value) return;
    setProposed((old) => ({ ...old, [pollId]: [...(old[pollId] ?? []), value] }));
    setProposalText((old) => ({ ...old, [pollId]: "" }));
  }
  return <Page><Header back title="Organisation du groupe" /><AppText style={st.heading}>On décide ensemble.</AppText><AppText style={st.sub}>Sondages, propositions et activités · données simulées localement.</AppText>
    <SectionTitle title="Voyageurs et invitations" /><Surface style={st.card}><AppText style={st.copy}>Samira, Amadou, Mariam et Yann</AppText><AppText style={st.sub}>4 membres · organisatrice : Samira</AppText><Pressable style={st.action} onPress={() => setInvited(true)}><AppText style={st.actionText}>{invited ? "Invitation copiée ✓" : "＋  Inviter un voyageur"}</AppText></Pressable></Surface>
    <SectionTitle title="Sondages du groupe" action="Date · repas · activité" />
    {pollTypes.map((poll) => {
      const options = [...poll.options, ...(proposed[poll.id] ?? [])];
      const selected = votes[poll.id];
      return <Surface key={poll.id} style={st.poll}>
        <View style={st.pollTitleRow}><AppIcon name={poll.icon} size={19} /><AppText style={st.title}>{poll.title}</AppText></View>
        {options.map((option) => <Pressable key={option} onPress={() => vote(poll.id, option)} style={[st.pollOption, selected === option && st.pollOptionOn]}><AppText style={[st.pollOptionText, selected === option && st.pollOptionTextOn]}>{option}</AppText><AppText style={[st.pollVote, selected === option && st.pollOptionTextOn]}>{selected === option ? "Ton vote ✓" : "Voter"}</AppText></Pressable>)}
        <View style={st.addRow}><AppTextInput value={proposalText[poll.id] ?? ""} onChangeText={(value) => setProposalText((old) => ({ ...old, [poll.id]: value }))} placeholder="Proposer une autre option…" style={st.input} /><Pressable onPress={() => addProposal(poll.id)}><AppText style={st.actionText}>＋</AppText></Pressable></View>
      </Surface>;
    })}
    <SectionTitle title="Choisir les étapes" action="Vote de groupe" /><AppText style={st.sub}>Quelle ville ou quelle visite on ajoute au voyage ?</AppText>
    {ideas.map((idea) => <Surface key={idea.name} style={st.row}><AppText style={{ fontSize: 22 }}>{idea.emoji}</AppText><View style={{ flex: 1 }}><AppText style={st.title}>{idea.name}</AppText><AppText style={st.sub}>{idea.detail}</AppText></View><Pressable onPress={() => setActivities((old) => old.includes(idea.name) ? old.filter((name) => name !== idea.name) : [...old, idea.name])} style={[st.vote, activities.includes(idea.name) && st.voteOn]}><AppText style={[st.voteText, activities.includes(idea.name) && st.voteTextOn]}>{activities.includes(idea.name) ? "Ajoutée ✓" : "Ajouter"}</AppText></Pressable></Surface>)}
    <SectionTitle title="Activités proposées" /><Surface style={st.card}>{activities.map((activity, index) => <View key={`${activity}-${index}`} style={st.activity}><AppText style={st.bullet}>✓</AppText><AppText style={{ flex: 1, color: C.ink, fontSize: 12 }}>{activity}</AppText><AppText style={st.sub}>À confirmer</AppText></View>)}<View style={st.addRow}><AppTextInput value={text} onChangeText={setText} placeholder="Ajouter une activité…" style={st.input} /><Pressable onPress={() => { if (text.trim()) { setActivities([...activities, text.trim()]); setText(""); } }}><AppText style={st.actionText}>＋</AppText></Pressable></View></Surface>
    <SectionTitle title="Infos pratiques" /><Surface style={st.card}><View style={st.infoRow}><AppIcon name="pin" size={22} /><View style={{ flex: 1 }}><AppText style={st.title}>Point de rendez-vous</AppText><AppText style={st.sub}>{meeting ? "Place de l’Étoile · défini pour la démo" : "À choisir avec le groupe"}</AppText></View><Pressable onPress={() => setMeeting(!meeting)}><AppText style={st.actionText}>{meeting ? "Modifier" : "Choisir"}</AppText></Pressable></View><View style={st.infoRow}><AppIcon name="clock" size={22} /><View style={{ flex: 1 }}><AppText style={st.title}>Rappels du voyage</AppText><AppText style={st.sub}>{reminder ? "Rappel simulé activé" : "Départ, réservations et votes"}</AppText></View><Pressable onPress={() => setReminder(!reminder)}><AppText style={st.actionText}>{reminder ? "✓ Activé" : "Activer"}</AppText></Pressable></View></Surface>
  </Page>;
}
const st = StyleSheet.create({ heading: { fontSize: 27, fontWeight: "900", color: C.ink }, sub: { fontSize: 11, color: C.muted, lineHeight: 16 }, card: { gap: 10 }, copy: { fontSize: 12, color: C.ink, fontWeight: "800" }, action: { alignSelf: "flex-start", paddingVertical: 8 }, actionText: { fontSize: 11, fontWeight: "900", color: C.green }, row: { flexDirection: "row", alignItems: "center", gap: 10, padding: 11 }, title: { fontSize: 12, color: C.ink, fontWeight: "900" }, vote: { borderRadius: 12, backgroundColor: "#F2F4EE", padding: 9 }, voteOn: { backgroundColor: C.green }, voteText: { fontSize: 10, color: C.green, fontWeight: "900" }, voteTextOn: { color: C.white }, poll: { gap: 8 }, pollTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 }, pollOption: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, borderWidth: 1, borderColor: C.line, borderRadius: 11, padding: 10 }, pollOptionOn: { backgroundColor: C.green, borderColor: C.green }, pollOptionText: { color: C.ink, fontSize: 10, fontWeight: "700", flex: 1 }, pollOptionTextOn: { color: C.white }, pollVote: { color: C.green, fontSize: 9, fontWeight: "900" }, addRow: { flexDirection: "row", alignItems: "center", gap: 8 }, input: { flex: 1, height: 42, borderRadius: 12, backgroundColor: "#F8F8F3", paddingHorizontal: 11, fontSize: 11, color: C.ink }, activity: { flexDirection: "row", gap: 9, alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderColor: C.line }, bullet: { color: C.green, fontWeight: "900" }, infoRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderColor: C.line } });
