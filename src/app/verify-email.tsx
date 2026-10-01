import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet } from "react-native";
import {
  resendVerificationCode,
  updateProfile,
  verifyEmailCode,
} from "@/actions/authActions";
import { AppText } from "@/components/app-text";
import { AuthInput } from "@/components/auth-input";
import { C, Header, Page, Surface } from "@/components/app-ui";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  verifyCodeSchema,
  type VerifyCodeFormValues,
} from "@/schemas/authSchemas";

export default function VerifyEmail() {
  const params = useLocalSearchParams<{
    email?: string;
    country?: string;
    interests?: string;
    inviteCode?: string;
  }>();
  const dispatch = useAppDispatch();
  const { error, notice, pendingVerificationEmail, requestStatus } =
    useAppSelector((state) => state.auth);
  const [localNotice, setLocalNotice] = useState("");
  const email =
    pendingVerificationEmail ??
    (typeof params.email === "string" ? params.email : "");
  const { control, handleSubmit, setValue, formState: { errors } } =
    useForm<VerifyCodeFormValues>({
      resolver: zodResolver(verifyCodeSchema),
      defaultValues: { email, code: "" },
    });

  useEffect(() => {
    setValue("email", email);
  }, [email, setValue]);

  const submit = handleSubmit(async (values) => {
    try {
      await dispatch(verifyEmailCode(values)).unwrap();
      const profile: { country?: string; interests?: string[] } = {};
      if (typeof params.country === "string" && params.country.trim()) {
        profile.country = params.country.trim();
      }
      if (typeof params.interests === "string") {
        try {
          const parsedInterests: unknown = JSON.parse(params.interests);
          if (
            Array.isArray(parsedInterests) &&
            parsedInterests.every((interest): interest is string => typeof interest === "string")
          ) {
            profile.interests = parsedInterests;
          }
        } catch {
          profile.interests = [];
        }
      }
      if (Object.keys(profile).length > 0) {
        await dispatch(updateProfile(profile));
      }
      router.replace(typeof params.inviteCode === "string" ? ({ pathname: "/invite/[code]", params: { code: params.inviteCode } } as never) : "/home");
    } catch {
      return;
    }
  });

  async function resendCode() {
    setLocalNotice("");
    try {
      const result = await dispatch(resendVerificationCode(email)).unwrap();
      setLocalNotice(result.message);
    } catch {
      return;
    }
  }

  return (
    <Page>
      <Header back title="Vérifier l’e-mail" />
      <AppText style={styles.title}>Encore une petite vérification.</AppText>
      <AppText style={styles.subtitle}>Saisis le code à 6 chiffres envoyé à {email || "ton adresse e-mail"}.</AppText>
      <Surface style={styles.form}>
        <Controller
          control={control}
          name="code"
          render={({ field }) => (
            <AuthInput
              label="CODE DE VÉRIFICATION"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="000000"
              error={errors.code?.message}
            />
          )}
        />
      </Surface>
      {!!error && <AppText style={styles.error}>{error}</AppText>}
      {!!(localNotice || notice) && <AppText style={styles.notice}>{localNotice || notice}</AppText>}
      <Pressable onPress={submit} disabled={requestStatus === "loading"} style={[styles.submit, requestStatus === "loading" && styles.disabled]}>
        <AppText style={styles.submitText}>{requestStatus === "loading" ? "Vérification…" : "Vérifier et continuer"}</AppText>
      </Pressable>
      <Pressable onPress={() => void resendCode()} disabled={!email || requestStatus === "loading"} style={styles.secondary}>
        <AppText style={styles.secondaryText}>Renvoyer le code</AppText>
      </Pressable>
      <Link href="/login" style={styles.link}>Retour à la connexion</Link>
    </Page>
  );
}

const styles = StyleSheet.create({
  title: { color: C.ink, fontSize: 24, fontWeight: "900", lineHeight: 30 },
  subtitle: { color: C.muted, fontSize: 11, lineHeight: 17, marginBottom: 8 },
  form: { padding: 15 },
  error: { color: "#A7493C", fontSize: 11, fontWeight: "700" },
  notice: { color: C.green, fontSize: 11, fontWeight: "700" },
  submit: { minHeight: 48, borderRadius: 13, backgroundColor: C.green, alignItems: "center", justifyContent: "center", paddingHorizontal: 14, marginTop: 8 },
  submitText: { color: C.white, fontSize: 12, fontWeight: "900" },
  disabled: { opacity: 0.55 },
  secondary: { alignSelf: "center", padding: 12 },
  secondaryText: { color: C.green, fontSize: 11, fontWeight: "900" },
  link: { alignSelf: "center", color: C.muted, fontSize: 11, padding: 8 },
});