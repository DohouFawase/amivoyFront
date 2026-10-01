import { BrandLogo } from "@/components/brand-logo";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router, useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { loginAccount, verifyTwoFactorLogin } from "@/actions/authActions";
import { AppIcon } from "@/components/app-icon";
import { AppText } from "@/components/app-text";
import { AuthInput } from "@/components/auth-input";
import { C, Header, Page, Surface } from "@/components/app-ui";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { loginSchema, type LoginFormValues } from "@/schemas/authSchemas";
import { clearPendingTwoFactor } from "@/slice/auth/authSlice";

export default function Login() {
  const params = useLocalSearchParams<{ inviteCode?: string }>();
  const dispatch = useAppDispatch();
  const { error, pendingTwoFactorEmail, requestStatus } = useAppSelector(
    (state) => state.auth,
  );
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorError, setTwoFactorError] = useState("");
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const submitLogin = handleSubmit(async (values) => {
    try {
      const result = await dispatch(loginAccount(values)).unwrap();
      if (result.kind === "authenticated") {
        router.replace(typeof params.inviteCode === "string" ? ({ pathname: "/invite/[code]", params: { code: params.inviteCode } } as never) : "/home");
      }
    } catch {
      return;
    }
  });

  async function submitTwoFactor() {
    setTwoFactorError("");
    if (!pendingTwoFactorEmail || !/^\d{6}$/.test(twoFactorCode)) {
      setTwoFactorError("Saisis le code à 6 chiffres envoyé par e-mail.");
      return;
    }

    try {
      await dispatch(
        verifyTwoFactorLogin({ email: pendingTwoFactorEmail, code: twoFactorCode }),
      ).unwrap();
      router.replace(typeof params.inviteCode === "string" ? ({ pathname: "/invite/[code]", params: { code: params.inviteCode } } as never) : "/home");
    } catch {
      return;
    }
  }

  return (
    <Page>
      <Header title="Connexion" />
      <View style={st.travelMotif} accessibilityElementsHidden>
        <View style={st.routeIcon}>
          <AppIcon name="map" size={17} color={C.green} />
        </View>
        <View style={st.routeDots}>
          <View style={st.routeDot} />
          <View style={st.routeDot} />
          <View style={st.routeDot} />
        </View>
        <View style={[st.routeIcon, st.routeIconAccent]}>
          <AppIcon name="pin" size={18} color={C.ink} />
        </View>
        <View style={st.routeDots}>
          <View style={st.routeDot} />
          <View style={st.routeDot} />
          <View style={st.routeDot} />
        </View>
        <View style={st.routeIcon}>
          <AppIcon name="group" size={18} color={C.green} />
        </View>
      </View>
      <AppText style={st.routeCaption}>DÉCOUVRIR · SE RETROUVER · REVIVRE</AppText>
      <BrandLogo style={st.brand} />
      <AppText style={st.title}>Ravie de te retrouver.</AppText>
      <AppText style={st.subtitle}>
        Tes voyages et sorties reprennent ici.
      </AppText>

      {pendingTwoFactorEmail ? (
        <Surface style={st.form}>
          <AppText style={st.subtitle}>Un code a été envoyé à {pendingTwoFactorEmail}.</AppText>
          <AuthInput
            label="CODE À 6 CHIFFRES"
            value={twoFactorCode}
            onChangeText={setTwoFactorCode}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="000000"
          />
          {!!(twoFactorError || error) && <AppText style={st.message}>{twoFactorError || error}</AppText>}
          <Pressable onPress={() => void submitTwoFactor()} disabled={requestStatus === "loading"} style={[st.submit, requestStatus === "loading" && st.disabled]}>
            <AppText style={st.submitText}>{requestStatus === "loading" ? "Vérification…" : "Vérifier le code"}</AppText>
          </Pressable>
          <Pressable onPress={() => dispatch(clearPendingTwoFactor())} style={st.cancelTwoFactor}>
            <AppText style={st.link}>Utiliser un autre compte</AppText>
          </Pressable>
        </Surface>
      ) : (
        <>
          <Surface style={st.form}>
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <AuthInput
                  label="ADRESSE E-MAIL"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
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
                  placeholder="Ton mot de passe"
                  error={errors.password?.message}
                />
              )}
            />
            <Link href={"/forgot-password" as never} asChild>
              <Pressable style={st.forgot}>
                <AppText style={st.link}>Mot de passe oublié ?</AppText>
              </Pressable>
            </Link>
            {!!error && <AppText style={st.message}>{error}</AppText>}
            <Pressable onPress={submitLogin} disabled={requestStatus === "loading"} style={[st.submit, requestStatus === "loading" && st.disabled]}>
              <AppText style={st.submitText}>{requestStatus === "loading" ? "Connexion…" : "Se connecter"}</AppText>
            </Pressable>
          </Surface>
          <Pressable onPress={() => router.push({ pathname: "/register", params: { inviteCode: params.inviteCode } } as never)} style={st.signup}>
            <AppText style={st.signupText}>Pas encore de compte ? <AppText style={st.link}>Créer un compte</AppText></AppText>
          </Pressable>
        </>
      )}
    </Page>
  );
}

const st = StyleSheet.create({
  travelMotif: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    marginBottom: 5,
  },
  routeIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF1E9",
  },
  routeIconAccent: { backgroundColor: C.lime, transform: [{ rotate: "-5deg" }] },
  routeDots: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7 },
  routeDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: "#A5B29D" },
  routeCaption: {
    textAlign: "center",
    color: C.muted,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginBottom: 10,
  },
  brand: { alignSelf: "center", marginBottom: 7 },
  title: {
    color: C.ink,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "900",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 2,
  },
  form: {
    gap: 8,
    padding: 16,
    borderRadius: 20,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
  },
  label: {
    fontSize: 9,
    fontWeight: "900",
    color: C.muted,
    letterSpacing: 1,
    marginTop: 2,
  },
  input: {
    height: 46,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: "#FCFBF7",
    paddingHorizontal: 13,
    color: C.ink,
    fontSize: 11,
  },
  forgot: { alignSelf: "flex-end", paddingVertical: 3 },
  link: { color: C.green, fontWeight: "800", fontSize: 11 },
  submit: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: C.green,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 3,
    shadowColor: "#133B2C",
    shadowOpacity: 0.17,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  submitText: { fontSize: 13, color: "#FFFFFF", fontWeight: "800" },
  message: { color: C.green, fontSize: 11, fontWeight: "700" },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 2,
    marginBottom: 1,
  },
  dividerLine: { height: 1, flex: 1, backgroundColor: C.line },
  or: {
    textAlign: "center",
    color: C.muted,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  socialRow: { flexDirection: "row", justifyContent: "center", gap: 26, paddingVertical: 2 },
  socialOption: { alignItems: "center", justifyContent: "center", gap: 6, minWidth: 58, paddingVertical: 3 },
  socialPressed: { opacity: 0.68, transform: [{ scale: 0.96 }] },
  socialIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#133B2C",
    shadowOpacity: 0.08,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  facebookIcon: { fontSize: 22, lineHeight: 25, color: "#1877F2", fontWeight: "900" },
  socialLabel: { fontSize: 9, color: C.muted, fontWeight: "700" },
  demoNote: { textAlign: "center", fontSize: 9, lineHeight: 14, color: C.muted },
  signup: { textAlign: "center", color: C.muted, fontSize: 11, padding: 9 },
  signupText: { textAlign: "center", color: C.muted, fontSize: 11 },
  disabled: { opacity: 0.55 },
  cancelTwoFactor: { alignSelf: "center", paddingVertical: 6 },
});
