import { useEffect, useState } from "react";
import { Link, router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { createInvitation, createOuting, fetchCircles } from "@/actions/groupActions";
import { AppIcon } from "@/components/app-icon";
import { AppText, AppTextInput } from "@/components/app-text";
import { AuthInput } from "@/components/auth-input";
import { C, Header, Page, SectionTitle, Surface, s } from "@/components/app-ui";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import type { CreateOutingPayload } from "@/interface/groups";

const categories = ["Restaurant", "Fête", "Balade", "Cinéma", "Autre"];

function optionalCoordinate(value: string | undefined): number | undefined {
  if (!value || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default function CreateOuting() {
  const params = useLocalSearchParams<{
    place?: string;
    latitude?: string;
    longitude?: string;
  }>();
  const dispatch = useAppDispatch();
  const { circles, error, requestStatus } = useAppSelector((state) => state.groups);
  const user = useAppSelector((state) => state.auth.user);
  const [title, setTitle] = useState("");
  const [place, setPlace] = useState(typeof params.place === "string" ? params.place : "");
  const [locationType, setLocationType] = useState<"public" | "private">("public");
  const [category, setCategory] = useState("Restaurant");
  const [activity, setActivity] = useState("");
  const [date, setDate] = useState("Ce soir");
  const [time, setTime] = useState("19:00");
  const [note, setNote] = useState("");
  const [budgetTarget, setBudgetTarget] = useState("");
  const [circleId, setCircleId] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [formError, setFormError] = useState("");
  const selectedCircle = circles.find((circle) => circle.id === circleId);

  useEffect(() => {
    void dispatch(fetchCircles());
  }, [dispatch]);

  async function submit() {
    setFormError("");
    if (!place.trim()) {
      setFormError("Indique le lieu de rendez-vous.");
      return;
    }
    if (inviteEmail.trim() && !inviteEmail.includes("@")) {
      setFormError("Saisis une adresse e-mail valide pour l’invitation.");
      return;
    }

    const participantUserIds = (selectedCircle?.member_user_ids ?? []).filter(
      (memberId) => memberId !== user?.id,
    );
    const guestNames = (selectedCircle?.members ?? []).filter(
      (memberName) => memberName !== user?.first_name,
    );
    const parsedBudget = budgetTarget.trim() ? Number(budgetTarget) : undefined;

    if (parsedBudget !== undefined && (!Number.isInteger(parsedBudget) || parsedBudget < 0)) {
      setFormError("Le budget doit être un montant positif en XOF.");
      return;
    }

    const payload: CreateOutingPayload = {
      ...(circleId ? { circle_id: circleId } : {}),
      title: title.trim() || `${category} entre amis`,
      place: place.trim(),
      location_type: locationType,
      category,
      date_label: date.trim() || null,
      time_label: time.trim() || null,
      note: note.trim() || null,
      activity: activity.trim() || null,
      ...(parsedBudget !== undefined ? { budget_target: parsedBudget } : {}),
      currency: "XOF",
      ...(optionalCoordinate(params.latitude) !== undefined
        ? { latitude: optionalCoordinate(params.latitude) }
        : {}),
      ...(optionalCoordinate(params.longitude) !== undefined
        ? { longitude: optionalCoordinate(params.longitude) }
        : {}),
      guests: guestNames,
      participant_user_ids: participantUserIds,
    };

    try {
      const outing = await dispatch(createOuting(payload)).unwrap();
      let inviteUrl = "";
      let inviteError = "";
      if (inviteEmail.trim()) {
        try {
          const invitation = await dispatch(createInvitation({
            outing_id: outing.id,
            channel: "email",
            target: inviteEmail.trim(),
          })).unwrap();
          inviteUrl = invitation.invite_url ?? "";
          if (invitation.email_sent === false) inviteError = "La sortie est créée, mais le courriel d’invitation n’a pas pu être envoyé. Partage le lien.";
        } catch {
          inviteError = "La sortie est créée, mais l’invitation n’a pas pu être enregistrée.";
        }
      }

      router.replace({
        pathname: "/outing/[id]",
        params: {
          id: outing.id,
          ...(inviteUrl ? { inviteUrl } : {}),
          ...(inviteError ? { inviteError } : {}),
        },
      } as never);
    } catch {
      return;
    }
  }

  const activityOptions = locationType === "private"
    ? ["Repas partagé", "Soirée jeux", "Musique et danse", "Film à la maison"]
    : category === "Restaurant"
      ? ["Déjeuner entre amis", "Dîner convivial", "Repas d’anniversaire"]
      : category === "Fête"
        ? ["Anniversaire", "Soirée dansante", "Apéro entre amis"]
        : category === "Balade"
          ? ["Promenade ensemble", "Visite du quartier", "Pause photo"]
          : ["Se retrouver et décider ensemble", "Jeux entre amis", "Sortie surprise"];

  return (
    <Page>
      <Header back title="Organiser une sortie" />
      <AppText style={styles.heading}>On se retrouve où ?</AppText>
      <AppText style={styles.sub}>Crée la sortie, choisis un cercle et invite tes amis.</AppText>
+
      <SectionTitle title="La sortie" />
      <AppTextInput value={title} onChangeText={setTitle} placeholder="Ex. Dîner à Cotonou" style={s.input} />
      <View style={styles.chips}>
        {categories.map((item) => (
          <Pressable key={item} onPress={() => setCategory(item)} style={[styles.chip, category === item && styles.chipOn]}>
            <AppText style={[styles.chipText, category === item && styles.chipTextOn]}>{item}</AppText>
          </Pressable>
        ))}
      </View>
+
      <SectionTitle title="Lieu de rendez-vous" />
      <View style={styles.chips}>
        <Pressable onPress={() => setLocationType("public")} style={[styles.chip, locationType === "public" && styles.chipOn]}>
          <View style={styles.chipLine}><AppIcon name="pin" size={15} /><AppText style={[styles.chipText, locationType === "public" && styles.chipTextOn]}>Lieu public</AppText></View>
        </Pressable>
        <Pressable onPress={() => setLocationType("private")} style={[styles.chip, locationType === "private" && styles.chipOn]}>
          <View style={styles.chipLine}><AppIcon name="apartment" size={15} /><AppText style={[styles.chipText, locationType === "private" && styles.chipTextOn]}>Appartement / maison</AppText></View>
        </Pressable>
      </View>
      <Surface style={styles.location}>
        <AppIcon name={locationType === "private" ? "apartment" : "pin"} size={23} />
        <View style={{ flex: 1 }}>
          <AppText style={styles.label}>{locationType === "private" ? "ADRESSE PRIVÉE" : "POINT DE RENDEZ-VOUS"}</AppText>
          <AppTextInput value={place} onChangeText={setPlace} placeholder={locationType === "private" ? "Adresse réservée aux participants" : "Ex. Place de l’Étoile, Cotonou"} style={styles.placeInput} />
        </View>
      </Surface>
      {locationType === "public" && <Link href="/map?mode=outing" style={styles.mapLink}>Choisir un lieu sur la carte</Link>}
+
      <SectionTitle title="Programme" />
      <View style={styles.chips}>
        {activityOptions.map((item) => (
          <Pressable key={item} onPress={() => setActivity(activity === item ? "" : item)} style={[styles.chip, activity === item && styles.chipOn]}>
            <AppText style={[styles.chipText, activity === item && styles.chipTextOn]}>{activity === item ? "✓ " : ""}{item}</AppText>
          </Pressable>
        ))}
      </View>
      <SectionTitle title="Quand ?" />
      <View style={styles.two}>
        <AppTextInput value={date} onChangeText={setDate} placeholder="Date" style={[s.input, { flex: 1 }]} />
        <AppTextInput value={time} onChangeText={setTime} placeholder="Heure" style={[s.input, { flex: 1 }]} />
      </View>
      <SectionTitle title="Budget" />
      <AppTextInput value={budgetTarget} onChangeText={setBudgetTarget} keyboardType="number-pad" placeholder="Budget prévu en XOF · facultatif" style={s.input} />
      <SectionTitle title="Cercle d’amis" action={selectedCircle?.name ?? "Facultatif"} />
      <View style={styles.chips}>
        <Pressable onPress={() => setCircleId("")} style={[styles.chip, !circleId && styles.chipOn]}>
          <AppText style={[styles.chipText, !circleId && styles.chipTextOn]}>Sans cercle</AppText>
        </Pressable>
        {circles.map((circle) => (
          <Pressable key={circle.id} onPress={() => setCircleId(circle.id)} style={[styles.chip, circleId === circle.id && styles.chipOn]}>
            <AppText style={[styles.chipText, circleId === circle.id && styles.chipTextOn]}>{circle.name} · {circle.members.length}</AppText>
          </Pressable>
        ))}
      </View>
      {selectedCircle && <AppText style={styles.hint}>Les membres du cercle ayant un compte seront ajoutés comme participants.</AppText>}
      <SectionTitle title="Inviter par e-mail" />
      <AuthInput label="ADRESSE E-MAIL · FACULTATIF" value={inviteEmail} onChangeText={setInviteEmail} autoCapitalize="none" keyboardType="email-address" placeholder="ami@example.com" />
      <AppText style={styles.hint}>Le lien d’invitation sera créé après la sortie; le courriel devra être partagé manuellement.</AppText>
      <SectionTitle title="Un petit mot" />
      <AppTextInput value={note} onChangeText={setNote} placeholder="Ex. On se retrouve à l’entrée principale…" multiline style={[s.input, styles.note]} />
      {!!(formError || error) && <AppText style={styles.error}>{formError || error}</AppText>}
      <Pressable onPress={() => void submit()} disabled={requestStatus === "loading"} style={[s.button, requestStatus === "loading" && styles.disabled]}>
        <AppText style={s.buttonText}>{requestStatus === "loading" ? "Création…" : "Créer la sortie"}</AppText>
      </Pressable>
    </Page>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 27, fontWeight: "900", color: C.ink },
  sub: { fontSize: 11, color: C.muted, lineHeight: 16 },
  chips: { flexDirection: "row", gap: 7, flexWrap: "wrap" },
  chip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.line },
  chipOn: { backgroundColor: C.green, borderColor: C.green },
  chipText: { fontSize: 10, color: C.ink, fontWeight: "800" },
  chipLine: { flexDirection: "row", alignItems: "center", gap: 6 },
  chipTextOn: { color: C.white },
  location: { flexDirection: "row", gap: 11, alignItems: "center", backgroundColor: "#F2F5ED" },
  label: { fontSize: 9, color: C.muted, fontWeight: "900", letterSpacing: 1 },
  placeInput: { fontSize: 12, color: C.ink, paddingVertical: 6 },
  hint: { fontSize: 10, color: C.muted, lineHeight: 15 },
  two: { flexDirection: "row", gap: 9 },
  mapLink: { color: C.green, fontSize: 10, fontWeight: "900", paddingVertical: 6 },
  note: { minHeight: 76, textAlignVertical: "top" },
  error: { color: "#A7493C", fontSize: 11, fontWeight: "800" },
  disabled: { opacity: 0.55 },
});
