import { AppText, AppTextInput } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { C, Header, Page, SectionTitle, Surface, s } from "@/components/app-ui";
import { createCircle, deleteCircle, listCircles, suggestedFriends, updateCircle } from "@/data/circles";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

export default function Circles() {
  const [circles, setCircles] = useState(listCircles());
  const [name, setName] = useState("");
  const [friends, setFriends] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [managingId, setManagingId] = useState<string | null>(null);

  function saveCircle() {
    const circle = createCircle(name || "Mes proches", friends);
    setCircles(listCircles());
    setName("");
    setFriends([]);
    setNotice(`« ${circle.name} » est prêt avec ${circle.members.length} membres.`);
  }

  function removeFriend(circleId: string, friend: string) {
    updateCircle(circleId, (circle) => ({ ...circle, members: circle.members.filter((member) => member !== friend) }));
    setCircles(listCircles());
    setNotice(`${friend} a été retiré·e du cercle.`);
  }

  function addFriend(circleId: string, friend: string) {
    updateCircle(circleId, (circle) => ({ ...circle, members: [...circle.members, friend] }));
    setCircles(listCircles());
    setNotice(`${friend} a été ajouté·e au cercle.`);
  }

  function removeCircle(circleId: string, circleName: string) {
    deleteCircle(circleId);
    setCircles(listCircles());
    setManagingId(null);
    setNotice(`Le cercle « ${circleName} » a été supprimé.`);
  }

  return <Page>
    <Header back title="Mon cercle d’amis" />
    <AppText style={s.heroTitle}>Les bons moments se partagent.</AppText>
    <AppText style={s.heroSub}>Crée un groupe de proches pour préparer voyages et sorties ensemble.</AppText>
    <SectionTitle title="Créer un cercle" />
    <Surface style={st.form}>
      <AppText style={st.label}>NOM DU CERCLE</AppText>
      <AppTextInput value={name} onChangeText={setName} placeholder="Ex. Mes amis de Cotonou" style={st.input} />
      <AppText style={st.label}>AJOUTER DES AMIS · DÉMO</AppText>
      <View style={st.chips}>{suggestedFriends.map((friend) => {
        const selected = friends.includes(friend);
        return <Pressable key={friend} onPress={() => setFriends((old) => selected ? old.filter((item) => item !== friend) : [...old, friend])} style={[st.chip, selected && st.chipOn]}>
          <AppText style={[st.chipText, selected && st.chipTextOn]}>{selected ? "✓  " : "+  "}{friend}</AppText>
        </Pressable>;
      })}</View>
      <Pressable onPress={saveCircle} style={s.button}><AppText style={s.buttonText}>Créer le cercle →</AppText></Pressable>
      {!!notice && <AppText style={st.notice}>{notice}</AppText>}
      <AppText style={st.foot}>Invitations simulées ; aucun message n’est envoyé.</AppText>
    </Surface>
    <SectionTitle title="Tes cercles" action={`${circles.length}`} />
    {circles.length ? circles.map((circle) => <Surface key={circle.id} style={st.circleCard}>
      <View style={st.circle}>
        <View style={st.circleIcon}><AppIcon name="group" size={23} /></View>
        <View style={{ flex: 1, gap: 4 }}><AppText style={st.circleName}>{circle.name}</AppText><AppText style={st.meta}>{circle.members.length} membre(s) · créé {circle.createdAt.toLocaleLowerCase()}</AppText></View>
        <Pressable onPress={() => setManagingId(managingId === circle.id ? null : circle.id)} style={st.manageButton}><AppText style={st.manageText}>{managingId === circle.id ? "Fermer" : "Gérer"}</AppText></Pressable>
      </View>
      {managingId === circle.id && <View style={st.managePanel}>
        <AppText style={st.label}>MEMBRES DU CERCLE</AppText>
        <View style={st.memberList}>{circle.members.map((member) => <View key={member} style={st.memberRow}><AppText style={st.memberName}>{member}{member === "Toi" ? " · organisateur" : ""}</AppText>{member !== "Toi" && <Pressable onPress={() => removeFriend(circle.id, member)} style={st.removeMember}><AppText style={st.removeText}>Retirer</AppText></Pressable>}</View>)}</View>
        <AppText style={st.label}>AJOUTER UN AMI</AppText>
        <View style={st.chips}>{suggestedFriends.filter((friend) => !circle.members.includes(friend)).map((friend) => <Pressable key={friend} onPress={() => addFriend(circle.id, friend)} style={st.chip}><AppText style={st.chipText}>＋ {friend}</AppText></Pressable>)}</View>
        {!suggestedFriends.some((friend) => !circle.members.includes(friend)) && <AppText style={st.meta}>Tous les amis proposés sont déjà dans ce cercle.</AppText>}
        <Pressable onPress={() => removeCircle(circle.id, circle.name)} style={st.deleteButton}><AppText style={st.deleteText}>Supprimer ce cercle</AppText></Pressable>
      </View>}
    </Surface>) : <Surface style={st.empty}><AppIcon name="group" size={28} /><AppText style={st.circleName}>Ton premier cercle commence ici</AppText><AppText style={st.meta}>Choisis des amis ci-dessus et crée le groupe.</AppText></Surface>}
  </Page>;
}

const st = StyleSheet.create({
  form: { gap: 12 }, label: { fontSize: 10, color: C.muted, fontWeight: "900", letterSpacing: 1 },
  input: { height: 46, borderRadius: 13, borderWidth: 1, borderColor: C.line, backgroundColor: C.white, paddingHorizontal: 13, color: C.ink },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, chip: { backgroundColor: C.white, borderWidth: 1, borderColor: C.line, borderRadius: 16, paddingVertical: 9, paddingHorizontal: 12 },
  chipOn: { backgroundColor: C.green, borderColor: C.green }, chipText: { color: C.ink, fontSize: 11, fontWeight: "800" }, chipTextOn: { color: C.white },
  notice: { color: C.green, fontSize: 11, fontWeight: "800", textAlign: "center" }, foot: { fontSize: 10, color: C.muted, textAlign: "center" },
  circleCard: { gap: 12 }, circle: { flexDirection: "row", alignItems: "center", gap: 12 }, circleIcon: { width: 42, height: 42, borderRadius: 15, backgroundColor: "#EDF2E8", alignItems: "center", justifyContent: "center" },
  circleName: { color: C.ink, fontSize: 13, fontWeight: "900" }, meta: { color: C.muted, fontSize: 10, lineHeight: 15 }, empty: { alignItems: "center", gap: 8, padding: 22 },
  manageButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: "#EDF2E8" }, manageText: { color: C.green, fontSize: 10, fontWeight: "900" },
  managePanel: { gap: 10, paddingTop: 12, borderTopWidth: 1, borderColor: C.line }, memberList: { gap: 4 }, memberRow: { minHeight: 38, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderColor: C.line }, memberName: { color: C.ink, fontSize: 11, fontWeight: "700" },
  removeMember: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 9, backgroundColor: "#F8EAE5" }, removeText: { color: "#A7493C", fontSize: 10, fontWeight: "900" }, deleteButton: { alignSelf: "flex-start", paddingVertical: 9 }, deleteText: { color: "#A7493C", fontSize: 11, fontWeight: "900" },
});
