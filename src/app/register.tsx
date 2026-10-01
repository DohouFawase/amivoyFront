import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router, useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, View } from "react-native";
import { AuthInput } from "@/components/auth-input";
import { AppText } from "@/components/app-text";
import { C, Header, Page, Surface } from "@/components/app-ui";
import { registerAccount } from "@/actions/authActions";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/schemas/authSchemas";

export default function Register() {
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{
    first_name?: string;
    last_name?: string;
    email?: string;
    country?: string;
    interests?: string;
    inviteCode?: string;
  }>();
  const { error, requestStatus } = useAppSelector((state) => state.auth);
  const { control, handleSubmit, formState: { errors } } =
    useForm<RegisterFormValues>({
      resolver: zodResolver(registerSchema),
      defaultValues: {
        first_name: typeof params.first_name === "string" ? params.first_name : "",
        last_name: typeof params.last_name === "string" ? params.last_name : "",
        email: typeof params.email === "string" ? params.email : "",
        password: "",
        password_confirmation: "",
      },
    });

  const submit = handleSubmit(async (values) => {
    try {
      await dispatch(registerAccount(values)).unwrap();
      router.replace({
        pathname: "/verify-email",
        params: {
          email: values.email,
          country: params.country,
          interests: params.interests,
          inviteCode: params.inviteCode,
        },
      } as never);
    } catch {
      return;
    }
  });

  return (
    <Page>
      <Header back title="Créer un compte" />
      <AppText style={styles.title}>On commence par faire connaissance.</AppText>
      <AppText style={styles.subtitle}>Crée ton compte Amivoy pour retrouver tes voyages et tes proches.</AppText>
      <Surface style={styles.form}>
        <Controller
          control={control}
          name="first_name"
          render={({ field }) => (
            <AuthInput
              label="PRÉNOM"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              autoCapitalize="words"
              placeholder="Ton prénom"
              error={errors.first_name?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="last_name"
          render={({ field }) => (
            <AuthInput
              label="NOM (FACULTATIF)"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              autoCapitalize="words"
              placeholder="Ton nom"
              error={errors.last_name?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <AuthInput
              label="ADRESSE E-MAIL"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="toi@exemple.com"
              error={errors.email?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <AuthInput
              label="MOT DE PASSE"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              secureTextEntry
              placeholder="8 caractères minimum"
              error={errors.password?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password_confirmation"
          render={({ field }) => (
            <AuthInput
              label="CONFIRME TON MOT DE PASSE"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              secureTextEntry
              placeholder="Répète le mot de passe"
              error={errors.password_confirmation?.message}
            />
          )}
        />
      </Surface>
      {!!error && <AppText style={styles.formError}>{error}</AppText>}
      <Pressable
        accessibilityRole="button"
        disabled={requestStatus === "loading"}
        onPress={submit}
        style={({ pressed }) => [styles.submit, pressed && styles.pressed, requestStatus === "loading" && styles.disabled]}
      >
        <AppText style={styles.submitText}>{requestStatus === "loading" ? "Création…" : "Créer mon compte"}</AppText>
      </Pressable>
      <View style={styles.footer}>
        <AppText style={styles.footerText}>Tu as déjà un compte ? </AppText>
        <Link href="/login" style={styles.link}>Se connecter</Link>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  title: { color: C.ink, fontSize: 24, fontWeight: "900", lineHeight: 30 },
  subtitle: { color: C.muted, fontSize: 11, lineHeight: 17, marginBottom: 8 },
  form: { gap: 7, padding: 15 },
  formError: { color: "#A7493C", fontSize: 11, fontWeight: "700" },
  submit: { minHeight: 48, borderRadius: 13, backgroundColor: C.green, alignItems: "center", justifyContent: "center", paddingHorizontal: 14 },
  submitText: { color: C.white, fontSize: 12, fontWeight: "900" },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.55 },
  footer: { flexDirection: "row", justifyContent: "center", paddingVertical: 14 },
  footerText: { color: C.muted, fontSize: 11 },
  link: { color: C.green, fontSize: 11, fontWeight: "900" },
});