import { AppText, AppTextInput } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { useState } from "react"
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Alert, Image, Pressable, Share, StyleSheet, View } from "react-native";
import { C, Header, Page, SectionTitle, Surface } from "@/components/app-ui";
import { getOuting, updateOuting, type MockOuting } from "@/data/outings";
import MapSurface from "@/components/map-surface";
export default function OutingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [outing, setOuting] = useState<MockOuting | undefined>(() =>
    getOuting(id),
  );
  const [caption, setCaption] = useState("");
  const [contributionAmount, setContributionAmount] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  function change(update: (item: MockOuting) => MockOuting) {
    const next = updateOuting(id, update);
    setOuting(next);
  }
  async function capture(source: "camera" | "library") {
    try {
      if (source === "camera") {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(
            "Autorisation nécessaire",
            "Autorise l’accès à la caméra pour prendre une photo de la sortie.",
          );
          return;
        }
      }
      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ["images"],
              quality: 0.85,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              quality: 0.85,
            });
      if (result.canceled || !result.assets[0]) return;
      const photo = {
        id: `photo-${Date.now()}`,
        uri: result.assets[0].uri,
        caption: caption.trim() || "Un souvenir de notre sortie",
        createdAt: "À l’instant",
        by: "Toi",
        sharedToStory: false,
      };
      change((item) => ({ ...item, photos: [photo, ...item.photos] }));
      setCaption("");
      setNotice("Photo ajoutée au carnet de la sortie sur cet appareil ✓");
    } catch {
      setNotice(
        "La caméra n’est pas disponible ici. Essaie depuis un téléphone.",
      );
    }
  }
  if (!outing)
    return (
      <Page>
        <Header back title="Sortie" />
        <AppText style={st.title}>
          Cette sortie n’existe plus dans la session démo.
        </AppText>
      </Page>
    );
  const going = (name: string) => outing.attending.includes(name);
  const contributed = outing.contributions.reduce((sum, item) => sum + item.amount, 0);
  const friends = ["Amadou", "Mariam", "Yann", "Inès", "Koffi"].filter((name) => !outing.guests.includes(name));
  const participants = [...new Set(["Toi", ...outing.attending])];
  const participantShare = (name: string) => {
    if (!outing.budgetTarget || participants.length === 0) return 0;
    const base = Math.floor(outing.budgetTarget / participants.length);
    const remainder = outing.budgetTarget - base * participants.length;
    return base + (participants.indexOf(name) === participants.length - 1 ? remainder : 0);
  };
  const paidBy = (name: string) => outing.contributions.filter((item) => item.by === name).reduce((sum, item) => sum + item.amount, 0);
  const myRemaining = Math.max(0, participantShare("Toi") - paidBy("Toi"));
  const balances = participants.map((name) => ({ name, amount: paidBy(name) - participantShare(name) }));
  const debtors = balances.filter((item) => item.amount < 0).map((item) => ({ name: item.name, amount: -item.amount }));
  const creditors = balances.filter((item) => item.amount > 0).map((item) => ({ name: item.name, amount: item.amount }));
  const settlements: { from: string; to: string; amount: number }[] = [];
  for (const debtor of debtors) {
    for (const creditor of creditors) {
      if (debtor.amount <= 0 || creditor.amount <= 0) continue;
      const amount = Math.min(debtor.amount, creditor.amount);
      settlements.push({ from: debtor.name, to: creditor.name, amount });
      debtor.amount -= amount;
      creditor.amount -= amount;
    }
  }
  function addContribution(amountOverride?: number) {
    const amount = Math.floor(amountOverride ?? Number(contributionAmount));
    if (!Number.isFinite(amount) || amount <= 0) {
      setNotice("Entre un montant valide en XOF pour cotiser.");
      return;
    }
    change((item) => ({ ...item, contributions: [{ id: `contrib-${Date.now()}`, by: "Toi", amount, createdAt: "À l’instant" }, ...item.contributions] }));
    setContributionAmount("");
    setNotice("Ta cotisation a été ajoutée à la cagnotte de démonstration ✓");
  }
  function removeGuest(name: string) {
    change((item) => ({ ...item, guests: item.guests.filter((guest) => guest !== name), attending: item.attending.filter((guest) => guest !== name), checkedIn: item.checkedIn.filter((guest) => guest !== name) }));
    setNotice(`${name} a été retiré·e de la sortie.`);
  }
  function toggleStory(photoId: string) {
    const photo = outing?.photos.find((item) => item.id === photoId);
    const willShare = !photo?.sharedToStory;
    change((item) => ({ ...item, photos: item.photos.map((entry) => entry.id === photoId ? { ...entry, sharedToStory: willShare } : entry) }));
    setNotice(willShare ? "Souvenir publié dans la Story Amivoy · fil de démonstration ✓" : "Souvenir retiré de la Story Amivoy.");
  }
  async function shareAmivoy(photo: { caption: string }) {
    try {
      await Share.share({ title: "Amivoy", message: `${photo.caption} — Un souvenir ${outing?.locationType === "private" ? "de notre sortie entre amis" : `de ${outing?.title}`} partagé avec Amivoy ✨` });
    } catch {
      setNotice("Le partage externe n’est pas disponible ici. Tu peux toujours publier dans la Story Amivoy.");
    }
  }
  const here = (name: string) => outing.checkedIn.includes(name);
  return (
    <Page>
      <Header
        back
        title="La sortie"
        right={
          <AppText style={st.live}>
            {outing.ended
              ? "TERMINÉE"
              : outing.started
                ? "EN COURS"
                : "À VENIR"}
          </AppText>
        }
      />
      <Surface style={st.hero}>
        <AppIcon name={outing.category === "Restaurant" ? "restaurant" : outing.category === "Fête" ? "outing" : outing.category === "Balade" ? "nature" : "star"} size={30} />
        <AppText style={st.title}>{outing.title}</AppText>
        <AppText style={st.sub}>
          {outing.category} · {outing.date} à {outing.time}
        </AppText>
        {!!outing.activity && <AppText style={st.activityPlan}>✨  Au programme : {outing.activity}</AppText>}
      </Surface>
      <SectionTitle title="Le rendez-vous" />
      <Surface style={st.meet}>
        {outing.locationType === "private" ? (
          <View style={st.privatePlace}>
            <AppIcon name="apartment" size={28} />
            <View style={{ flex: 1, gap: 4 }}>
              <AppText style={st.mapCaption}>ADRESSE PRIVÉE · INVITÉS UNIQUEMENT</AppText>
              <AppText style={st.place}>{outing.place}</AppText>
              <AppText style={st.sub}>Retrouve le groupe à cette adresse. Elle n’est montrée qu’aux participants de la sortie.</AppText>
            </View>
          </View>
        ) : outing.latitude != null && outing.longitude != null ? (
          <View style={st.map}>
            <MapSurface latitude={outing.latitude} longitude={outing.longitude} zoom={15} points={[{ id: `meet-${outing.id}`, name: outing.place, latitude: outing.latitude, longitude: outing.longitude }]} />
            <View pointerEvents="none" style={st.mapBadge}><View style={{flexDirection:"row",alignItems:"center",gap:5}}><AppIcon name="pin" size={13} /><AppText style={st.mapCaption}>POINT DE RENDEZ-VOUS</AppText></View></View>
          </View>
        ) : (
          <View style={st.privatePlace}><AppIcon name="pin" size={25} /><View style={{flex:1,gap:4}}><AppText style={st.mapCaption}>POINT DE RENDEZ-VOUS</AppText><AppText style={st.place}>{outing.place}</AppText><AppText style={st.sub}>Adresse indiquée par l’organisateur.</AppText></View></View>
        )}
        <AppText style={st.place}>{outing.place}</AppText>
        <AppText style={st.sub}>{outing.note}</AppText>
        <Pressable
          onPress={() => {
            change((item) => ({
              ...item,
              checkedIn: item.checkedIn.includes("Toi")
                ? item.checkedIn
                : [...item.checkedIn, "Toi"],
            }));
            setNotice("Tu es marqué·e comme arrivé·e au rendez-vous ✓");
          }}
          style={st.secondary}
        >
          <AppText style={st.secondaryText}>
            {here("Toi")
              ? "Tu es bien arrivé·e ✓"
              : "Je suis arrivé·e au rendez-vous"}
          </AppText>
        </Pressable>
      </Surface>
      {outing.circleName && <AppText style={st.notice}>Cercle invité · {outing.circleName}</AppText>}
      <SectionTitle
        title="La bande"
        action={`${outing.attending.length} présents`}
      />
      <Surface style={st.card}>
        {outing.guests.map((name) => (
          <View key={name} style={st.person}>
            <View style={st.avatar}>
              <AppText style={st.avatarText}>{name[0]}</AppText>
            </View>
            <AppText
              style={{ flex: 1, color: C.ink, fontSize: 11, fontWeight: "800" }}
            >
              {name}
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={going(name) ? `Retirer ${name} de la sortie` : `${name} confirme sa présence`}
              onPress={() => change((item) => ({ ...item, attending: item.attending.includes(name) ? item.attending.filter((x) => x !== name) : [...item.attending, name] }))}
              style={[st.pill, going(name) && st.pillOn]}
            >
              <AppText style={[st.pillText, going(name) && st.pillTextOn]}>{going(name) ? "Présent·e ✓" : "À confirmer"}</AppText>
            </Pressable>
            {name !== "Toi" && <Pressable accessibilityRole="button" accessibilityLabel={`Retirer ${name} du groupe`} onPress={() => removeGuest(name)} style={st.removeGuest}><AppText style={st.removeGuestText}>Retirer</AppText></Pressable>}
          </View>
        ))}
      </Surface>
      <Surface style={st.reminderCard}>
        <View style={st.reminderHeader}><AppIcon name="clock" size={21} /><View style={{ flex: 1, gap: 3 }}><AppText style={st.actionTitle}>Rappel de sortie</AppText><AppText style={st.sub}>{outing.date} · {outing.time} · {outing.place}</AppText></View></View>
        <AppText style={st.sub}>Confirmés : {outing.attending.filter((name) => name !== "Toi").join(", ") || "personne pour le moment"}{outing.attending.includes("Toi") ? ", Toi" : ""}</AppText>
        <Pressable onPress={() => { setReminderEnabled((enabled) => !enabled); setNotice(reminderEnabled ? "Rappel désactivé dans cette démo." : "Rappel de démonstration activé pour l’heure et le lieu de la sortie."); }} style={[st.primary, reminderEnabled && st.reminderOn]}><AppText style={st.primaryText}>{reminderEnabled ? "Rappel activé ✓" : "Me rappeler avant la sortie"}</AppText></Pressable>
        <AppText style={st.disclaimer}>Rappel local de démonstration · aucune notification système n’est programmée.</AppText>
      </Surface>
      <Surface style={st.inviteCard}>
        <AppText style={st.actionTitle}>Inviter des amis</AppText>
        <AppText style={st.sub}>Ajoute des amis à cette sortie. Les invitations restent simulées dans la démo.</AppText>
        <View style={st.inviteChips}>{friends.map((name) => <Pressable key={name} onPress={() => setSelectedFriends((old) => old.includes(name) ? old.filter((x) => x !== name) : [...old, name])} style={[st.inviteChip, selectedFriends.includes(name) && st.inviteChipOn]}><AppText style={[st.inviteChipText, selectedFriends.includes(name) && st.inviteChipTextOn]}>{selectedFriends.includes(name) ? "✓  " : "+  "}{name}</AppText></Pressable>)}</View>
        {!!selectedFriends.length && <Pressable style={st.primary} onPress={() => { const invited = [...selectedFriends]; change((item) => ({ ...item, guests: [...item.guests, ...invited] })); setSelectedFriends([]); setNotice(`${invited.length} ami${invited.length > 1 ? "s" : ""} ajouté${invited.length > 1 ? "s" : "e"} à la sortie.`); }}><AppText style={st.primaryText}>Ajouter {selectedFriends.length} ami{selectedFriends.length > 1 ? "s" : ""}</AppText></Pressable>}
      </Surface>
      <SectionTitle title="Budget partagé" action={`${outing.contributions.length} cotisation${outing.contributions.length === 1 ? "" : "s"}`} />
      <Surface style={st.fundCard}>
        <View style={st.fundSummary}><View><AppText style={st.fundLabel}>BUDGET TOTAL</AppText><AppText style={st.fundTotal}>{(outing.budgetTarget ?? 0).toLocaleString("fr-FR")} XOF</AppText></View><View style={st.fundTargetBox}><AppText style={st.fundLabel}>DÉJÀ COTISÉ</AppText><AppText style={st.fundTarget}>{contributed.toLocaleString("fr-FR")} XOF</AppText></View></View>
        {outing.budgetTarget ? <><View style={st.progressTrack}><View style={[st.progressFill, { width: `${Math.min(100, (contributed / outing.budgetTarget) * 100)}%` }]} /></View><AppText style={st.sub}>Reste {Math.max(0, outing.budgetTarget - contributed).toLocaleString("fr-FR")} XOF · {participants.length} participants · environ {Math.ceil(outing.budgetTarget / participants.length).toLocaleString("fr-FR")} XOF par personne</AppText></> : <AppText style={st.sub}>Ajoute un budget total pour calculer automatiquement la part de chacun.</AppText>}
        <View style={st.personalShare}><View><AppText style={st.fundLabel}>TA PART</AppText><AppText style={st.personalAmount}>{participantShare("Toi").toLocaleString("fr-FR")} XOF</AppText></View><View style={st.fundTargetBox}><AppText style={st.fundLabel}>IL TE RESTE À PAYER</AppText><AppText style={[st.personalAmount, { color: myRemaining ? "#9B5146" : C.green }]}>{myRemaining.toLocaleString("fr-FR")} XOF</AppText></View></View>
        <AppText style={st.actionTitle}>Part de chaque participant</AppText>
        <View style={st.contributionList}>{participants.map((name) => { const due = participantShare(name); const paid = paidBy(name); const remaining = Math.max(0, due - paid); return <View key={name} style={st.contributionLine}><View style={{ flex: 1, gap: 3 }}><AppText style={st.contributionName}>{name}{name === "Toi" ? " · Toi" : ""}</AppText><AppText style={st.sub}>Cotisé {paid.toLocaleString("fr-FR")} / {due.toLocaleString("fr-FR")} XOF</AppText></View><AppText style={[st.contributionStatus, { color: remaining ? "#9B5146" : C.green }]}>{remaining ? `Reste ${remaining.toLocaleString("fr-FR")}` : "À jour ✓"}</AppText></View>; })}</View>
        <AppText style={st.actionTitle}>Qui rembourse qui ?</AppText>
        {settlements.length ? settlements.map((item) => <View key={`${item.from}-${item.to}`} style={st.settlement}><AppText style={st.contributionName}>{item.from}</AppText><AppIcon name="arrow" size={15} /><AppText style={st.contributionName}>{item.to}</AppText><AppText style={st.settlementAmount}>{item.amount.toLocaleString("fr-FR")} XOF</AppText></View>) : <AppText style={st.sub}>Les remboursements apparaîtront dès que les cotisations et les parts seront renseignées.</AppText>}
        {!!myRemaining && <Pressable onPress={() => addContribution(myRemaining)} style={st.primary}><AppText style={st.primaryText}>Cotiser ma part · {myRemaining.toLocaleString("fr-FR")} XOF</AppText></Pressable>}
        <View style={st.contributeRow}><AppTextInput value={contributionAmount} onChangeText={setContributionAmount} keyboardType="number-pad" placeholder="Autre montant en XOF" style={[st.input, { flex: 1 }]} /><Pressable onPress={() => addContribution()} style={st.contributeButton}><AppText style={st.primaryText}>Ajouter</AppText></Pressable></View>
        <AppText style={st.disclaimer}>Suivi fictif pour la maquette : aucune collecte ni aucun paiement réel.</AppText>
      </Surface>
      <Pressable onPress={() => { removeGuest("Toi"); router.back(); }} style={st.leaveButton}><AppText style={st.leaveText}>Quitter cette sortie</AppText></Pressable>
      {!!notice && <AppText style={st.notice}>{notice}</AppText>}
      <SectionTitle title="Pendant la sortie" />
      <Surface style={st.actionCard}>
        <AppText style={st.actionTitle}>
          {outing.ended
            ? "Merci pour ce moment !"
            : outing.started
              ? "Profitez bien de la sortie ✨"
              : "Quand tout le monde est prêt…"}
        </AppText>
        <AppText style={st.sub}>
          {outing.started
            ? "Ajoute les photos au fur et à mesure, elles apparaissent aussitôt dans le carnet partagé de démonstration."
            : "Le groupe peut confirmer sa présence puis lancer la sortie au point de rendez-vous."}
        </AppText>
        <Pressable
          onPress={() => change((item) => ({ ...item, started: true }))}
          style={st.primary}
        >
          <AppText style={st.primaryText}>
            {outing.started ? "Sortie commencée ✓" : "Nous sommes partis !"}
          </AppText>
        </Pressable>
      </Surface>
      <Pressable onPress={() => router.push({ pathname: "/memories/outing-card", params: { id: outing.id } } as never)} style={st.shareMemory}><AppIcon name="share" size={18} color={C.green} /><AppText style={st.shareMemoryText}>Créer une carte souvenir à partager</AppText></Pressable>
      <SectionTitle
        title={`Souvenirs · ${outing.photos.length} photo${outing.photos.length === 1 ? "" : "s"}`}
      />
      <AppTextInput
        value={caption}
        onChangeText={setCaption}
        placeholder="Ajouter une légende à ta prochaine photo…"
        style={st.input}
      />
      <View style={st.photoActions}>
        <Pressable
          onPress={() => void capture("camera")}
          style={st.photoButton}
        >
          <View style={{flexDirection:"row",alignItems:"center",gap:6}}><AppIcon name="camera" size={16} color={C.white} /><AppText style={st.photoText}>Prendre une photo</AppText></View>
        </Pressable>
        <Pressable
          onPress={() => void capture("library")}
          style={st.photoButton}
        >
          <AppText style={st.photoText}>▧ Choisir une photo</AppText>
        </Pressable>
      </View>
      {outing.photos.length ? (
        <View style={st.gallery}>
          {outing.photos.map((photo) => (
            <Surface key={photo.id} style={st.photoCard}>
              <Image source={{ uri: photo.uri }} style={st.photo} />
              <View style={{ padding: 9, gap: 3 }}>
                <AppText style={st.caption}>{photo.caption}</AppText>
                <AppText style={st.sub}>
                  {photo.by} · {photo.createdAt}
                </AppText>
                <Pressable onPress={() => toggleStory(photo.id)} style={[st.shareButton, photo.sharedToStory && st.shareButtonOn]}>
                  <AppText style={[st.shareButtonText, photo.sharedToStory && st.shareButtonTextOn]}>{photo.sharedToStory ? "Dans la Story Amivoy ✓" : "Partager sur la Story Amivoy"}</AppText>
                </Pressable>
                <Pressable onPress={() => void shareAmivoy(photo)} style={st.externalShare}>
                  <AppText style={st.externalShareText}>Partager Amivoy ailleurs ↗</AppText>
                </Pressable>
              </View>
            </Surface>
          ))}
        </View>
      ) : (
        <Surface style={st.empty}>
          <AppIcon name="camera" size={28} />
          <AppText style={st.actionTitle}>
            Le premier souvenir reste à prendre.
          </AppText>
          <AppText style={st.sub}>
            Prends une photo ou choisis-la dans ta galerie ; elle s’ajoute
            directement à cette sortie.
          </AppText>
        </Surface>
      )}
      <Pressable
        onPress={() =>
          change((item) => ({ ...item, ended: true, started: true }))
        }
        style={st.finish}
      >
        <AppText style={st.finishText}>
          {outing.ended
            ? "Sortie terminée ✓"
            : "Terminer la sortie et garder les souvenirs"}
        </AppText>
      </Pressable>
      <AppText style={st.foot}>
        Les photos restent sur l’appareil pendant cette démo ; rien n’est envoyé
        à une API.
      </AppText>
    </Page>
  );
}
const st = StyleSheet.create({
  live: { fontSize: 8, fontWeight: "900", color: C.green },
  hero: { backgroundColor: C.green, gap: 7, alignItems: "flex-start" },
  activityPlan: { fontSize: 11, color: C.white, fontWeight: "800", marginTop: 4 },
  title: { fontSize: 21, fontWeight: "900", color: C.ink },
  sub: { fontSize: 10, color: C.muted, lineHeight: 15 },
  meet: { gap: 9 },
  map: { height: 160, borderRadius: 16, backgroundColor: "#DFEADF", overflow: "hidden", position: "relative" },
  mapBadge: { position: "absolute", top: 9, left: 9, backgroundColor: "rgba(255,255,255,.92)", borderRadius: 8, padding: 7 },
  privatePlace: { minHeight: 96, flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, backgroundColor: "#F1EEE5" },
  mapCaption: {
    fontSize: 8,
    letterSpacing: 1,
    color: C.green,
    fontWeight: "900",
  },
  place: { fontSize: 14, color: C.ink, fontWeight: "900" },
  secondary: {
    alignSelf: "flex-start",
    backgroundColor: "#EFF3E9",
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 12,
  },
  secondaryText: { fontSize: 10, color: C.green, fontWeight: "900" },
  card: { gap: 0 },
  person: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: C.line,
  },
  avatar: {
    width: 31,
    height: 31,
    borderRadius: 12,
    backgroundColor: "#E3EBDD",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 12, color: C.green, fontWeight: "900" },
  pill: {
    backgroundColor: "#F0F3EB",
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 10,
  },
  pillOn: { backgroundColor: C.green },
  pillText: { fontSize: 9, fontWeight: "900", color: C.green },
  pillTextOn: { color: C.white },
  notice: { fontSize: 10, fontWeight: "800", color: C.green },
  removeGuest: { paddingHorizontal: 6, paddingVertical: 8 },
  removeGuestText: { fontSize: 8, color: "#9B5146", fontWeight: "800" },
  inviteCard: { gap: 10 },
  reminderCard: { gap: 10, backgroundColor: "#F2F5ED" }, reminderHeader: { flexDirection: "row", alignItems: "center", gap: 10 }, reminderOn: { backgroundColor: "#DDE8D8" },
  settlement: { minHeight: 38, flexDirection: "row", alignItems: "center", gap: 8, borderBottomWidth: 1, borderColor: C.line }, settlementAmount: { color: C.green, fontSize: 10, fontWeight: "900", marginLeft: "auto" },
  shareMemory: { minHeight: 46, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 13, backgroundColor: "#EAF0E4" }, shareMemoryText: { color: C.green, fontSize: 11, fontWeight: "900" },
  inviteChips: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  inviteChip: { minHeight: 40, justifyContent: "center", paddingHorizontal: 11, borderRadius: 12, backgroundColor: "#F0F3EB" },
  inviteChipOn: { backgroundColor: C.green },
  inviteChipText: { fontSize: 10, color: C.ink, fontWeight: "800" },
  inviteChipTextOn: { color: C.white },
  fundCard: { gap: 12 },
  fundSummary: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  fundTargetBox: { alignItems: "flex-end" },
  fundLabel: { fontSize: 8, color: C.muted, fontWeight: "900", letterSpacing: 0.8 },
  fundTotal: { color: C.green, fontSize: 19, fontWeight: "900", marginTop: 3 },
  fundTarget: { color: C.ink, fontSize: 12, fontWeight: "800", marginTop: 7 },
  personalShare: { flexDirection: "row", justifyContent: "space-between", borderRadius: 14, backgroundColor: "#F0F3EB", padding: 12, gap: 8 },
  personalAmount: { color: C.green, fontSize: 14, fontWeight: "900", marginTop: 4 },
  contributionStatus: { fontSize: 9, fontWeight: "900", textAlign: "right" },
  progressTrack: { height: 8, backgroundColor: "#E9EEE3", borderRadius: 5, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: C.green, borderRadius: 5 },
  contributeRow: { flexDirection: "row", gap: 8 },
  contributeButton: { minHeight: 44, paddingHorizontal: 16, borderRadius: 12, backgroundColor: C.lime, justifyContent: "center", alignItems: "center" },
  contributionList: { gap: 9 },
  contributionLine: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderColor: C.line, gap: 8 },
  contributionName: { color: C.ink, fontSize: 10, fontWeight: "800", flex: 1 },
  contributionAmount: { color: C.ink, fontSize: 10, fontWeight: "900" },
  disclaimer: { fontSize: 9, color: C.muted, lineHeight: 13 },
  leaveButton: { alignSelf: "center", padding: 12 },
  leaveText: { color: "#9B5146", fontWeight: "800", fontSize: 10 },
  actionCard: { gap: 10, backgroundColor: "#EFF3E9" },
  actionTitle: { fontSize: 13, fontWeight: "900", color: C.ink },
  primary: {
    backgroundColor: C.lime,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryText: { fontSize: 11, fontWeight: "900", color: C.green },
  input: {
    height: 44,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 13,
    paddingHorizontal: 12,
    fontSize: 10,
    color: C.ink,
  },
  photoActions: { flexDirection: "row", gap: 8 },
  photoButton: {
    flex: 1,
    backgroundColor: C.green,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  photoText: { fontSize: 9, fontWeight: "900", color: C.white },
  gallery: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  photoCard: { padding: 0, overflow: "hidden", width: "48%", flexGrow: 1 },
  photo: { height: 125, width: "100%", backgroundColor: "#E9ECE5" },
  shareButton: { alignItems: "center", backgroundColor: "#EDF2E8", paddingVertical: 8, paddingHorizontal: 7, borderRadius: 9, marginTop: 5 },
  shareButtonOn: { backgroundColor: C.green }, shareButtonText: { color: C.green, fontSize: 9, fontWeight: "900", textAlign: "center" }, shareButtonTextOn: { color: C.white },
  externalShare: { alignItems: "center", paddingVertical: 7 }, externalShareText: { color: C.muted, fontSize: 9, fontWeight: "800" },
  caption: { fontSize: 10, color: C.ink, fontWeight: "800" },
  empty: { alignItems: "center", gap: 7, padding: 20 },
  finish: { alignItems: "center", padding: 11 },
  finishText: { fontSize: 10, color: "#9B5146", fontWeight: "900" },
  foot: { fontSize: 9, color: C.muted, lineHeight: 13, textAlign: "center" },
});
