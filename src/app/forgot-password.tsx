import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet } from "react-native";
import { requestPasswordReset, resetPassword } from "@/actions/authActions";
import { AppText } from "@/components/app-text";
import { AuthInput } from "@/components/auth-input";
import { C, Header, Page, Surface } from "@/components/app-ui";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/schemas/authSchemas";

export default function ForgotPassword() {
  const dispatch = useAppDispatch();
  const { error, notice, requestStatus } = useAppSelector((state) => state.auth);
  const [codeSent, setCodeSent] = useState(false);
  const { control, handleSubmit, trigger, getValues, formState: { errors } } =
    useForm<ResetPasswordFormValues>({
      resolver: zodResolver(resetPasswordSchema),
      defaultValues: {
        email: "",
        code: "",
        password: "",
        password_confirmation: "",
      },
    });

  async function sendCode() {
    if (!(await trigger("email"))) return;
    try {
      await dispatch(requestPasswordReset(getValues("email"))).unwrap();
      setCodeSent(true);
    } catch {
      return;
    }
  }

  const submitReset = handleSubmit(async (values) => {
    try {
      await dispatch(resetPassword(values)).unwrap();
      router.replace("/login");
    } catch {
      return;
    }
  });

  return (
    <Page>
      <Header back title="Mot de passe oublié" />
      <AppText style={styles.title}>Retrouvons l’accès à ton compte.</AppText>
      <AppText style={styles.subtitle}>Un code de réinitialisation sera envoyé à ton adresse e-mail.</AppText>
      <Surface style={styles.form}>
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
              editable={!codeSent}
              placeholder="toi@exemple.com"
              error={errors.email?.message}
            />
          )}
        />
        {codeSent && (
          <>
            <Controller
              control={control}
              name="code"
              render={({ field }) => (
                <AuthInput
                  label="CODE À 6 CHIFFRES"
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
            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <AuthInput
                  label="NOUVEAU MOT DE PASSE"
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
                  label="CONFIRME LE MOT DE PASSE"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  secureTextEntry
                  placeholder="Répète le mot de passe"
                  error={errors.password_confirmation?.message}
                />
              )}
            />
          </>
        )}
      </Surface>
      {!!error && <AppText style={styles.error}>{error}</AppText>}
      {!!notice && <AppText style={styles.notice}>{notice}</AppText>}
      <Pressable
        onPress={codeSent ? submitReset : () => void sendCode()}
        disabled={requestStatus === "loading"}
        style={[styles.submit, requestStatus === "loading" && styles.disabled]}
      >
        <AppText style={styles.submitText}>
          {requestStatus === "loading" ? "Envoi…" : codeSent ? "Réinitialiser le mot de passe" : "Envoyer le code"}
        </AppText>
      </Pressable>
      <Link href="/login" style={styles.link}>Retour à la connexion</Link>
    </Page>
  );
}

const styles = StyleSheet.create({
  title: { color: C.ink, fontSize: 24, fontWeight: "900", lineHeight: 30 },
  subtitle: { color: C.muted, fontSize: 11, lineHeight: 17, marginBottom: 8 },
  form: { gap: 8, padding: 15 },
  error: { color: "#A7493C", fontSize: 11, fontWeight: "700" },
  notice: { color: C.green, fontSize: 11, fontWeight: "700" },
  submit: { minHeight: 48, borderRadius: 13, backgroundColor: C.green, alignItems: "center", justifyContent: "center", paddingHorizontal: 14, marginTop: 8 },
  submitText: { color: C.white, fontSize: 12, fontWeight: "900" },
  disabled: { opacity: 0.55 },
  link: { alignSelf: "center", color: C.muted, fontSize: 11, padding: 12 },
});