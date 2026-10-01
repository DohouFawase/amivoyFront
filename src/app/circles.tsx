import { AppText, AppTextInput } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { createCircle as createCircleAction, createInvitation, deleteCircle as deleteCircleAction, fetchCircles, fetchInvitations, fetchOutings, respondInvitationById } from "@/actions/groupActions";
import { AuthInput } from "@/components/auth-input";
import { groupsService } from "@/services/groupsService";
import type { CircleRecord, InvitationRecord } from "@/interface/groups";
import { C, Header, Page, SectionTitle, Surface, s } from "@/components/app-ui";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useEffect, useState } from "react";
import { Alert, Pressable, Share, StyleSheet, View } from "react-native";

export default function Circles() {
  const dispatch = useAppDispatch();
  const { circles, invitations, error, requestStatus } = useAppSelector((state) => state.groups);
  const currentUser = useAppSelector((state) => state.auth.user);
  const [name, setName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [lastInviteUrl, setLastInviteUrl] = useState("");
  const [notice, setNotice] = useState("");
  const [managingId, setManagingId] = useState<string | null>(null);
  const [circleDetails, setCircleDetails] = useState<Record<string, CircleRecord>>({});
  const [editingInviteId, setEditingInviteId] = useState<string | null>(null);
  const [editingInviteTarget, setEditingInviteTarget] = useState("");
  const [inviteDetails, setInviteDetails] = useState<Record<string, InvitationRecord>>({});

  useEffect(() => {
    void dispatch(fetchCircles());
    void dispatch(fetchInvitations());
  }, [dispatch]);

  async function sendCircleInvitation(circleId: string, email: string) {
    if (!email.trim() || !email.includes("@")) {
      setNotice("Saisis une adresse e-mail valide.");
      return;
    }

    try {
      const invitation = await dispatch(createInvitation({
        circle_id: circleId,
        channel: "email",
        target: email.trim(),
      })).unwrap();
      setLastInviteUrl(invitation.invite_url ?? "");
      setInviteEmail("");
      setNotice(invitation.email_sent === false
        ? `Invitation créée pour ${email.trim()}, mais le courriel n’a pas pu être envoyé. Partage le lien généré.`
        : `Invitation créée et courriel envoyé à ${email.trim()}.`);
      void dispatch(fetchInvitations());
    } catch {
      return;
    }
  }

  async function saveCircle() {
    if (!name.trim()) {
      setNotice("Donne un nom à ton cercle.");
      return;
    }

    try {
      const circle = await dispatch(createCircleAction({ name: name.trim() })).unwrap();
    setName("");
      setNotice(`Le cercle « ${circle.name} » a été créé.`);
      if (inviteEmail.trim()) {
        await sendCircleInvitation(circle.id, inviteEmail);
      }
    } catch {
      return;
    }
  }

  async function toggleManageCircle(circle: CircleRecord) {
    if (managingId === circle.id) { setManagingId(null); return; }
    try {
      const detail = await groupsService.fetchCircle(circle.id);
      setCircleDetails((current) => ({ ...current, [circle.id]: detail })); setManagingId(circle.id); setNotice("");
    } catch { setNotice("Les informations de ce cercle n’ont pas pu être chargées."); }
  }

  async function removeCircle(circleId: string, circleName: string) {
    try {
      await dispatch(deleteCircleAction(circleId)).unwrap();
      setManagingId(null);
      setNotice(`Le cercle « ${circleName} » a été supprimé.`);
    } catch {
      return;
    }
  }

  async function shareInviteLink() {
    if (!lastInviteUrl) return;
    try {
      await Share.share({ message: lastInviteUrl });
    } catch {
      setNotice("Copie ce lien pour le partager : "+lastInviteUrl);
    }
  }

  async function openInvite(id: string) {
    try {
      const detail = await groupsService.fetchInvitation(id);
      setInviteDetails((items) => ({ ...items, [id]: detail }));
      setEditingInviteId(detail.invited_by === currentUser?.id ? id : null);
      setEditingInviteTarget(detail.target ?? "");
      setNotice("");
    } catch {
      setNotice("Le détail de l’invitation n’a pas pu être chargé.");
    }
  }
  async function saveInvite(id: string) {
    try { await groupsService.updateInvitation(id, { target: editingInviteTarget.trim() || null }); await dispatch(fetchInvitations()); setEditingInviteId(null); setNotice("Invitation mise à jour."); }
    catch { setNotice("L’invitation n’a pas pu être modifiée."); }
  }
  function removeInvite(id: string) { Alert.alert("Supprimer cette invitation ?", "Le lien d’invitation ne sera plus utilisable.", [{ text: "Annuler", style: "cancel" }, { text: "Supprimer", style: "destructive", onPress: () => { void groupsService.deleteInvitation(id).then(() => dispatch(fetchInvitations())).catch(() => setNotice("L’invitation n’a pas pu être supprimée.")); } }]); }

  async function respondToInvite(id: string, status: "accepted" | "declined") {
    try {
      await dispatch(respondInvitationById({ id, status })).unwrap();
      await dispatch(fetchInvitations());
      if (status === "accepted") {
        await dispatch(fetchCircles());
        await dispatch(fetchOutings());
      }
    } catch {
      return;
    }
  }

  const incomingInvitations = invitations.filter(
    (invitation) => invitation.invited_by !== currentUser?.id,
  );
  const sentCircleInvitations = invitations.filter(
    (invitation) => invitation.invited_by === currentUser?.id && invitation.circle_id,
  );

  return <Page>
    <Header back title="Mon cercle d’amis" />
    <AppText style={s.heroTitle}>Les bons moments se partagent.</AppText>
    <AppText style={s.heroSub}>Crée un groupe de proches pour préparer voyages et sorties ensemble.</AppText>
    <SectionTitle title="Créer un cercle" />
    <Surface style={st.form}>
      <AppText style={st.label}>NOM DU CERCLE</AppText>
      <AppTextInput value={name} onChangeText={setName} placeholder="Ex. Mes amis de Cotonou" style={st.input} />
      <AuthInput label="INVITER PAR E-MAIL · FACULTATIF" value={inviteEmail} onChangeText={setInviteEmail} autoCapitalize="none" keyboardType="email-address" placeholder="ami@example.com" />
      <Pressable onPress={() => void saveCircle()} disabled={requestStatus === "loading"} style={[s.button, requestStatus === "loading" && st.disabled]}>
        <AppText style={s.buttonText}>{requestStatus === "loading" ? "Création…" : inviteEmail.trim() ? "Créer le cercle et inviter" : "Créer le cercle"}</AppText>
      </Pressable>
      {!!(notice || error) && <AppText style={error ? st.error : st.notice}>{error || notice}</AppText>}
      {!!lastInviteUrl && <Pressable onPress={() => void shareInviteLink()} style={st.shareLink}><AppIcon name="share" size={16} /><AppText style={st.shareText}>Partager le lien d’invitation</AppText></Pressable>}
      <AppText style={st.foot}>Le courriel d’invitation est envoyé automatiquement quand son adresse est valide.</AppText>
    </Surface>
    <SectionTitle title="Invitations envoyées" action={`${sentCircleInvitations.length}`} />
    {sentCircleInvitations.length ? sentCircleInvitations.map((invitation) => {
      const detail = inviteDetails[invitation.id];
      return <Surface key={invitation.id} style={st.circleCard}>
        <AppText style={st.circleName}>{invitation.destination ?? "Invitation de cercle"}</AppText>
        <AppText style={st.meta}>À {invitation.target ?? invitation.name ?? "Membre invité"} · {invitation.status}</AppText>
        <AppText style={st.meta}>Envoyée le {new Date(invitation.created_at).toLocaleDateString("fr-FR")}</AppText>
        {detail && <View style={st.inviteDetail}>
          <AppText style={st.meta}>Canal : {detail.channel}</AppText>
          <AppText style={st.meta}>Destinataire : {detail.target ?? "Lien sans destinataire"}</AppText>
          <AppText style={st.meta}>État : {detail.status}</AppText>
          {!!detail.expires_at && <AppText style={st.meta}>Expire le {new Date(detail.expires_at).toLocaleDateString("fr-FR")}</AppText>}
        </View>}
        <View style={st.inviteActions}>
          <Pressable onPress={() => void openInvite(invitation.id)}><AppText style={st.manageText}>{detail ? "Actualiser les détails" : "Voir les détails"}</AppText></Pressable>
          <Pressable onPress={() => removeInvite(invitation.id)}><AppText style={st.deleteText}>Annuler l’invitation</AppText></Pressable>
        </View>
      </Surface>;
    }) : <Surface style={st.empty}><AppText style={st.meta}>Les invitations envoyées à tes cercles apparaîtront ici.</AppText></Surface>}
    {incomingInvitations.length > 0 && <>
      <SectionTitle title="Invitations reçues" action={`${incomingInvitations.length}`} />
      {incomingInvitations.map((invitation) => {
        const detail = inviteDetails[invitation.id];
        return <Surface key={invitation.id} style={st.circleCard}>
        <AppText style={st.circleName}>{invitation.destination ?? "Invitation de groupe"}</AppText>
        <AppText style={st.meta}>{invitation.name} · {invitation.status}</AppText>
        {detail && <View style={st.inviteDetail}><AppText style={st.meta}>Canal : {detail.channel}</AppText><AppText style={st.meta}>État : {detail.status}</AppText>{detail.expires_at && <AppText style={st.meta}>Expire le {new Date(detail.expires_at).toLocaleDateString("fr-FR")}</AppText>}</View>}
        {editingInviteId === invitation.id && <View style={st.inviteEdit}><AppTextInput value={editingInviteTarget} onChangeText={setEditingInviteTarget} placeholder="Adresse ou cible" style={st.input} /><Pressable onPress={() => void saveInvite(invitation.id)}><AppText style={st.manageText}>Enregistrer</AppText></Pressable></View>}
        <View style={st.inviteActions}><Pressable onPress={() => void openInvite(invitation.id)}><AppText style={st.manageText}>{invitation.invited_by === currentUser?.id ? "Détails / modifier" : "Détails"}</AppText></Pressable>{invitation.invited_by === currentUser?.id && <Pressable onPress={() => removeInvite(invitation.id)}><AppText style={st.deleteText}>Supprimer</AppText></Pressable>}</View>
        {invitation.statusCode === "pending" && <View style={st.inviteActions}>
          <Pressable onPress={() => void respondToInvite(invitation.id, "accepted")} disabled={requestStatus === "loading"} style={st.acceptButton}><AppText style={st.acceptText}>Accepter</AppText></Pressable>
          <Pressable onPress={() => void respondToInvite(invitation.id, "declined")} disabled={requestStatus === "loading"} style={st.declineButton}><AppText style={st.declineText}>Refuser</AppText></Pressable>
        </View>}
      </Surface>;
      })}
    </>}
    <SectionTitle title="Tes cercles" action={`${circles.length}`} />
    {circles.length ? circles.map((circle) => <Surface key={circle.id} style={st.circleCard}>
      <View style={st.circle}>
        <View style={st.circleIcon}><AppIcon name="group" size={23} /></View>
        <View style={{ flex: 1, gap: 4 }}><AppText style={st.circleName}>{circle.name}</AppText><AppText style={st.meta}>{circle.members.length} membre(s) · créé {new Date(circle.created_at).toLocaleDateString()}</AppText></View>
        <Pressable onPress={() => void toggleManageCircle(circle)} style={st.manageButton}><AppText style={st.manageText}>{managingId === circle.id ? "Fermer" : "Gérer"}</AppText></Pressable>
      </View>
      {managingId === circle.id && <View style={st.managePanel}>
        <AppText style={st.label}>MEMBRES DU CERCLE</AppText>
        <View style={st.memberList}>{(circleDetails[circle.id]?.members ?? circle.members).map((member) => <View key={member} style={st.memberRow}><AppText style={st.memberName}>{member}</AppText></View>)}</View>
        <AuthInput label="INVITER UN MEMBRE PAR E-MAIL" value={inviteEmail} onChangeText={setInviteEmail} autoCapitalize="none" keyboardType="email-address" placeholder="ami@example.com" />
        <Pressable onPress={() => void sendCircleInvitation(circle.id, inviteEmail)} disabled={requestStatus === "loading"} style={st.inviteButton}><AppText style={st.inviteButtonText}>{requestStatus === "loading" ? "Envoi…" : "Créer l’invitation"}</AppText></Pressable>
        {invitations.filter((invitation) => invitation.circle_id === circle.id).map((invitation) => <View key={invitation.id} style={st.inviteManage}><AppText style={[st.meta, { flex: 1 }]}>{invitation.name} · {invitation.status}</AppText><Pressable onPress={() => void openInvite(invitation.id)}><AppText style={st.manageText}>Détails</AppText></Pressable>{invitation.invited_by === currentUser?.id && <Pressable onPress={() => removeInvite(invitation.id)}><AppText style={st.deleteText}>Supprimer</AppText></Pressable>}</View>)}
        <Pressable onPress={() => void removeCircle(circle.id, circle.name)} style={st.deleteButton}><AppText style={st.deleteText}>Supprimer ce cercle</AppText></Pressable>
      </View>}
    </Surface>) : <Surface style={st.empty}><AppIcon name="group" size={28} /><AppText style={st.circleName}>Ton premier cercle commence ici</AppText><AppText style={st.meta}>Choisis des amis ci-dessus et crée le groupe.</AppText></Surface>}
  </Page>;
}

const st = StyleSheet.create({
  form: { gap: 12 }, label: { fontSize: 10, color: C.muted, fontWeight: "900", letterSpacing: 1 },
  input: { height: 46, borderRadius: 13, borderWidth: 1, borderColor: C.line, backgroundColor: C.white, paddingHorizontal: 13, color: C.ink },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, chip: { backgroundColor: C.white, borderWidth: 1, borderColor: C.line, borderRadius: 16, paddingVertical: 9, paddingHorizontal: 12 },
  chipOn: { backgroundColor: C.green, borderColor: C.green }, chipText: { color: C.ink, fontSize: 11, fontWeight: "800" }, chipTextOn: { color: C.white },
  notice: { color: C.green, fontSize: 11, fontWeight: "800", textAlign: "center" }, error: { color: "#A7493C", fontSize: 11, fontWeight: "800", textAlign: "center" }, foot: { fontSize: 10, color: C.muted, textAlign: "center" }, disabled: { opacity: 0.55 },
  shareLink: { minHeight: 42, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 }, shareText: { color: C.green, fontSize: 11, fontWeight: "900" }, inviteButton: { alignSelf: "flex-start", paddingHorizontal: 13, paddingVertical: 10, borderRadius: 10, backgroundColor: "#EDF2E8" }, inviteButtonText: { color: C.green, fontSize: 10, fontWeight: "900" },
  inviteEdit: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }, inviteDetail: { gap: 3, padding: 10, borderRadius: 9, backgroundColor: "#F5F6F2" }, inviteManage: { flexDirection: "row", alignItems: "center", gap: 8 },
  inviteActions: { flexDirection: "row", gap: 8 }, acceptButton: { minHeight: 38, paddingHorizontal: 13, borderRadius: 10, backgroundColor: C.green, alignItems: "center", justifyContent: "center" }, acceptText: { color: C.white, fontSize: 10, fontWeight: "900" }, declineButton: { minHeight: 38, paddingHorizontal: 13, borderRadius: 10, backgroundColor: "#F8EAE5", alignItems: "center", justifyContent: "center" }, declineText: { color: "#A7493C", fontSize: 10, fontWeight: "900" },
  circleCard: { gap: 12 }, circle: { flexDirection: "row", alignItems: "center", gap: 12 }, circleIcon: { width: 42, height: 42, borderRadius: 15, backgroundColor: "#EDF2E8", alignItems: "center", justifyContent: "center" },
  circleName: { color: C.ink, fontSize: 13, fontWeight: "900" }, meta: { color: C.muted, fontSize: 10, lineHeight: 15 }, empty: { alignItems: "center", gap: 8, padding: 22 },
  manageButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: "#EDF2E8" }, manageText: { color: C.green, fontSize: 10, fontWeight: "900" },
  managePanel: { gap: 10, paddingTop: 12, borderTopWidth: 1, borderColor: C.line }, memberList: { gap: 4 }, memberRow: { minHeight: 38, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderColor: C.line }, memberName: { color: C.ink, fontSize: 11, fontWeight: "700" },
  removeMember: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 9, backgroundColor: "#F8EAE5" }, removeText: { color: "#A7493C", fontSize: 10, fontWeight: "900" }, deleteButton: { alignSelf: "flex-start", paddingVertical: 9 }, deleteText: { color: "#A7493C", fontSize: 11, fontWeight: "900" },
});
