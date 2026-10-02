import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Image, Pressable, StyleSheet, View } from "react-native";
import {
  changeEmail,
  deleteAvatar,
  fetchProfile,
  updateProfile,
  uploadAvatar,
} from "@/actions/authActions";
import { AppText } from "@/components/app-text";
import { AuthInput } from "@/components/auth-input";
import { C, Header, Page, SectionTitle, Surface, s } from "@/components/app-ui";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  changeEmailSchema,
  profileUpdateSchema,
  type ChangeEmailFormValues,
  type ProfileUpdateFormValues,
} from "@/schemas/authSchemas";

const profileInterests = [
  "Voyages",
  "Sorties",
  "Restaurants",
  "Culture",
  "Nature",
  "Week-ends",
];

export default function Account() {
  const dispatch = useAppDispatch();
  const { user, error, notice, requestStatus } = useAppSelector((state) => state.auth);
  const [avatarError, setAvatarError] = useState("");
  const [avatarNotice, setAvatarNotice] = useState("");
  const profileForm = useForm<ProfileUpdateFormValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      country: "",
      language: "fr",
      interests: [],
    },
  });
  const emailForm = useForm<ChangeEmailFormValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { email: "", current_password: "" },
  });
  const resetProfileForm = profileForm.reset;

  useEffect(() => {
    if (!user) {
      void dispatch(fetchProfile());
      return;
    }

    resetProfileForm({
      first_name: user.first_name,
      last_name: user.last_name ?? "",
      phone: user.phone ?? "",
      country: user.country ?? "",
      language: user.language,
      interests: user.interests ?? [],
    });
  }, [dispatch, resetProfileForm, user]);

  const saveProfile = profileForm.handleSubmit(async (values) => {
    try {
      await dispatch(updateProfile(values)).unwrap();
    } catch {
      return;
    }
  });

  const submitEmailChange = emailForm.handleSubmit(async (values) => {
    try {
      await dispatch(changeEmail(values)).unwrap();
      router.replace({ pathname: "/verify-email", params: { email: values.email } } as never);
    } catch {
      return;
    }
  });

  async function chooseAvatar() {
    setAvatarError("");
    setAvatarNotice("");
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.75,
    });

    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];

    if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
      setAvatarError("La photo doit faire 5 Mo maximum.");
      return;
    }

    try {
      await dispatch(uploadAvatar(asset)).unwrap();
      setAvatarNotice("Photo de profil mise à jour.");
    } catch {
      return;
    }
  }

  async function removeAvatar() {
    setAvatarError("");
    setAvatarNotice("");
    try {
      await dispatch(deleteAvatar()).unwrap();
      setAvatarNotice("Photo de profil supprimée.");
    } catch {
      return;
    }
  }

  if (!user) {
    return (
      <Page>
        <Header back title="Mon compte" />
        <AppText style={s.heroTitle}>Chargement du profil…</AppText>
        {!!error && <AppText style={styles.error}>{error}</AppText>}
      </Page>
    );
  }

  return (
    <Page>
      <Header back title="Mon compte" />
      <AppText style={s.heroTitle}>Tes informations personnelles.</AppText>
      <AppText style={s.heroSub}>Ces informations sont enregistrées sur ton compte.</AppText>
      <Surface style={styles.avatarRow}>
        {user.avatar_url ? (
          <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <AppText style={styles.avatarInitial}>{user.first_name.charAt(0).toUpperCase()}</AppText>
          </View>
        )}
        <View style={styles.avatarActions}>
          <Pressable onPress={() => void chooseAvatar()} disabled={requestStatus === "loading"} style={styles.avatarButton}>
            <AppText style={styles.avatarButtonText}>Choisir une photo</AppText>
          </Pressable>
          {!!user.avatar_url && (
            <Pressable onPress={() => void removeAvatar()} disabled={requestStatus === "loading"} style={styles.removeAvatarButton}>
              <AppText style={styles.removeAvatarText}>Supprimer la photo</AppText>
            </Pressable>
          )}
        </View>
      </Surface>
      {!!(avatarError || avatarNotice) && <AppText style={avatarError ? styles.error : styles.notice}>{avatarError || avatarNotice}</AppText>}

      <SectionTitle title="Profil" />
      <Surface style={styles.form}>
        <Controller control={profileForm.control} name="first_name" render={({ field }) => (
          <AuthInput label="PRÉNOM" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} autoCapitalize="words" placeholder="Ton prénom" error={profileForm.formState.errors.first_name?.message} />
        )} />
        <Controller control={profileForm.control} name="last_name" render={({ field }) => (
          <AuthInput label="NOM" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} autoCapitalize="words" placeholder="Ton nom" error={profileForm.formState.errors.last_name?.message} />
        )} />
        <Controller control={profileForm.control} name="phone" render={({ field }) => (
          <AuthInput label="TÉLÉPHONE" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} keyboardType="phone-pad" placeholder="Ton numéro" error={profileForm.formState.errors.phone?.message} />
        )} />
        <Controller control={profileForm.control} name="country" render={({ field }) => (
          <AuthInput label="PAYS" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder="Ton pays" error={profileForm.formState.errors.country?.message} />
        )} />
        <AuthInput label="ADRESSE E-MAIL" value={user.email} editable={false} />
        <Controller control={profileForm.control} name="language" render={({ field }) => (
          <View style={styles.preferenceGroup}>
            <AppText style={styles.preferenceLabel}>LANGUE</AppText>
            <View style={styles.segmented}>
              {([{ value: "fr", label: "Français" }, { value: "en", label: "English" }] as const).map((option) => (
                <Pressable key={option.value} onPress={() => field.onChange(option.value)} style={[styles.segment, field.value === option.value && styles.segmentActive]}>
                  <AppText style={[styles.segmentText, field.value === option.value && styles.segmentTextActive]}>{option.label}</AppText>
                </Pressable>
              ))}
            </View>
          </View>
        )} />
        <Controller control={profileForm.control} name="interests" render={({ field }) => (
          <View style={styles.preferenceGroup}>
            <AppText style={styles.preferenceLabel}>CENTRES D’INTÉRÊT</AppText>
            <View style={styles.chips}>
              {profileInterests.map((interest) => {
                const selected = field.value.includes(interest);
                return (
                  <Pressable key={interest} onPress={() => field.onChange(selected ? field.value.filter((item) => item !== interest) : [...field.value, interest])} style={[styles.chip, selected && styles.chipActive]}>
                    <AppText style={[styles.chipText, selected && styles.chipTextActive]}>{interest}</AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )} />
      </Surface>

      {!!error && <AppText style={styles.error}>{error}</AppText>}
      {!!notice && <AppText style={styles.notice}>{notice}</AppText>}
      <Pressable onPress={saveProfile} disabled={requestStatus === "loading"} style={[s.button, requestStatus === "loading" && styles.disabled]}>
        <AppText style={s.buttonText}>{requestStatus === "loading" ? "Enregistrement…" : "Enregistrer le profil"}</AppText>
      </Pressable>

      <SectionTitle title="Changer l’adresse e-mail" />
      <AppText style={styles.help}>Une vérification sera demandée à la nouvelle adresse. Tu devras te reconnecter après l’envoi du code.</AppText>
      <Surface style={styles.form}>
        <Controller control={emailForm.control} name="email" render={({ field }) => (
          <AuthInput label="NOUVELLE ADRESSE E-MAIL" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} autoCapitalize="none" keyboardType="email-address" placeholder="nouvelle@adresse.com" error={emailForm.formState.errors.email?.message} />
        )} />
        <Controller control={emailForm.control} name="current_password" render={({ field }) => (
          <AuthInput label="MOT DE PASSE ACTUEL" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} secureTextEntry placeholder="Confirme ton identité" error={emailForm.formState.errors.current_password?.message} />
        )} />
        <Pressable onPress={submitEmailChange} disabled={requestStatus === "loading"} style={[styles.secondary, requestStatus === "loading" && styles.disabled]}>
          <AppText style={styles.secondaryText}>Demander le changement</AppText>
        </Pressable>
      </Surface>
    </Page>
  );
}

const styles = StyleSheet.create({
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 13 },
  avatar: { width: 62, height: 62, borderRadius: 22, backgroundColor: "#DDE8D4" },
  avatarFallback: { width: 62, height: 62, borderRadius: 22, backgroundColor: "#DDE8D4", alignItems: "center", justifyContent: "center" },
  avatarInitial: { color: C.green, fontSize: 24, fontWeight: "900" },
  avatarActions: { flex: 1, gap: 7 },
  avatarButton: { alignSelf: "flex-start", paddingVertical: 6 },
  avatarButtonText: { color: C.green, fontSize: 11, fontWeight: "900" },
  removeAvatarButton: { alignSelf: "flex-start", paddingVertical: 4 },
  removeAvatarText: { color: "#A7493C", fontSize: 10, fontWeight: "800" },
  form: { gap: 9 },
  preferenceGroup: { gap: 8, paddingVertical: 4 },
  preferenceLabel: { color: C.muted, fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  segmented: { flexDirection: "row", gap: 6 },
  segment: { minHeight: 38, flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F1F4EB", borderRadius: 10 },
  segmentActive: { backgroundColor: C.green },
  segmentText: { color: C.ink, fontSize: 10, fontWeight: "800" },
  segmentTextActive: { color: C.white },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  chip: { minHeight: 34, justifyContent: "center", paddingHorizontal: 10, borderRadius: 10, backgroundColor: "#F1F4EB" },
  chipActive: { backgroundColor: C.green },
  chipText: { color: C.ink, fontSize: 9, fontWeight: "800" },
  chipTextActive: { color: C.white },
  error: { color: "#A7493C", fontSize: 11, fontWeight: "700" },
  notice: { color: C.green, fontSize: 11, fontWeight: "800" },
  help: { color: C.muted, fontSize: 10, lineHeight: 15 },
  secondary: { minHeight: 44, borderRadius: 12, backgroundColor: C.green, alignItems: "center", justifyContent: "center", padding: 10 },
  secondaryText: { color: C.white, fontSize: 11, fontWeight: "900" },
  disabled: { opacity: 0.55 },
});
