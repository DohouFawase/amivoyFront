import { AppIcon } from "@/components/app-icon";
import { BrandLogo } from "@/components/brand-logo";
import { AppText, AppTextInput } from "@/components/app-text";
import { setDemoUser } from "@/data/demo-session";
import { createCircle, suggestedFriends } from "@/data/circles";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { C, Page } from "@/components/app-ui";

const interests = [
  "Voyages",
  "Sorties",
  "Restaurants",
  "Culture",
  "Nature",
  "Week-ends",
];
const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900&q=85",
    title: "Les bons moments se vivent ensemble.",
    description:
      "Organise tes voyages, tes sorties et tes souvenirs avec tes proches.",
    icon: "trip",
  },
  {
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=85",
    title: "Des aventures qui vous ressemblent.",
    description: "Choisis ce que tu aimes. Tu pourras tout modifier plus tard.",
    icon: "group",
  },
  {
    image:
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=900&q=85",
    title: "Faisons connaissance.",
    description:
      "Ton profil de démonstration reste enregistré dans cette session.",
    icon: "camera",
  },
  {
    image:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=900&q=85",
    title: "Ta bande, tes prochaines histoires.",
    description:
      "Crée ton premier cercle et prépare vos prochaines sorties ensemble.",
    icon: "group",
  },
];

export default function Onboarding() {
  const { width, height } = useWindowDimensions();
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("Bénin");
  const [selected, setSelected] = useState<string[]>(["Voyages", "Sorties"]);
  const [circleName, setCircleName] = useState("Mes proches");
  const [friends, setFriends] = useState<string[]>(["Amadou", "Mariam"]);
  const [error, setError] = useState("");
  const swipeResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 28 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.25,
        onPanResponderRelease: (_, gesture) => {
          if (Math.abs(gesture.dx) < 55) return;
          setError("");
          if (gesture.dx < 0)
            setStep((current) => Math.min(current + 1, slides.length - 1));
          else setStep((current) => Math.max(current - 1, 0));
        },
      }),
    [],
  );
  const slide = slides[step];
  const compact = height < 760;
  const contentWidth = Math.min(width - (width < 380 ? 36 : 48), 420);
  const photoWidth = Math.min(contentWidth * 0.84, compact ? 265 : 300);
  const photoHeight = Math.min(photoWidth * 0.84, compact ? 225 : 260);

  const finish = () => {
    setDemoUser({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      country,
      interests: selected,
    });
    createCircle(circleName || `Les proches de ${firstName.trim()}`, friends);
    router.replace("/home");
  };

  const continueOnboarding = () => {
    setError("");
    if (step === 2 && (!firstName.trim() || !email.includes("@"))) {
      setError(
        "Ajoute ton prénom et une adresse e-mail valide pour continuer.",
      );
      return;
    }
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    finish();
  };

  return (
    <Page scroll={false}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : Platform.OS === "android" ? "height" : undefined}
      >
      <View style={styles.screen}>
        <View style={[styles.frame, { maxWidth: 500 }]}>
          <View
            style={[
              styles.topbar,
              { paddingHorizontal: width < 380 ? 18 : 24 },
            ]}
          >
            {step > 0 ? (
              <Pressable
                onPress={() => {
                  setError("");
                  setStep(step - 1);
                }}
                hitSlop={10}
                style={styles.backButton}
              >
                <AppIcon name="back" size={17} color={C.ink} />
              </Pressable>
            ) : (
              <BrandLogo compact style={styles.brandPosition} />
            )}
            <Pressable onPress={() => router.replace("/home")} hitSlop={10}>
              <AppText style={styles.skip}>Passer</AppText>
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingHorizontal: width < 380 ? 18 : 24 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          >
            <View style={[styles.slideContent, { width: contentWidth }]}>
              <View
                {...swipeResponder.panHandlers}
                style={[
                  styles.photoStage,
                  { height: photoHeight + 28, width: photoWidth + 30 },
                ]}
              >
                <View
                  style={[
                    styles.photoCard,
                    styles.photoBack,
                    { width: photoWidth * 0.52, height: photoHeight * 0.66 },
                  ]}
                >
                  <ImageBackground
                    source={{ uri: slide.image }}
                    style={styles.photoImage}
                    imageStyle={styles.imageRadius}
                  />
                </View>
                <View
                  style={[
                    styles.photoCard,
                    styles.photoLeft,
                    { width: photoWidth * 0.53, height: photoHeight * 0.7 },
                  ]}
                >
                  <ImageBackground
                    source={{ uri: slides[(step + 1) % slides.length].image }}
                    style={styles.photoImage}
                    imageStyle={styles.imageRadius}
                  />
                </View>
                <View
                  style={[
                    styles.photoCard,
                    styles.photoRight,
                    { width: photoWidth * 0.53, height: photoHeight * 0.7 },
                  ]}
                >
                  <ImageBackground
                    source={{ uri: slides[(step + 2) % slides.length].image }}
                    style={styles.photoImage}
                    imageStyle={styles.imageRadius}
                  />
                </View>
                <View
                  style={[
                    styles.photoCard,
                    styles.photoMain,
                    { width: photoWidth * 0.72, height: photoHeight * 0.91 },
                  ]}
                >
                  <ImageBackground
                    source={{ uri: slide.image }}
                    style={styles.photoImage}
                    imageStyle={styles.imageRadius}
                  />
                </View>
                <View style={[styles.floatingBadge, styles.badgeTop]}>
                  <AppIcon name={slide.icon} size={16} color={C.ink} />
                </View>
                <View style={[styles.floatingBadge, styles.badgeSide]}>
                  <AppIcon name="✳" size={14} color={C.ink} />
                </View>
                <View style={styles.avatarStack}>
                  <View style={[styles.avatar, { backgroundColor: "#D4A77D" }]}>
                    <AppText style={styles.avatarText}>A</AppText>
                  </View>
                  <View style={[styles.avatar, { backgroundColor: "#8FA58D" }]}>
                    <AppText style={styles.avatarText}>M</AppText>
                  </View>
                </View>
              </View>

              <View style={styles.copy}>
                <AppText style={styles.eyebrow}>
                  AMIVOY · {String(step + 1).padStart(2, "0")}
                </AppText>
                <AppText style={styles.title}>{slide.title}</AppText>
                <AppText style={styles.description}>
                  {slide.description}
                </AppText>
              </View>

              {step === 0 && (
                <View style={styles.featureRow}>
                  {[
                    ["map", "Découvrir"],
                    ["group", "Organiser"],
                    ["payments", "Partager"],
                    ["journal", "Se souvenir"],
                  ].map(([icon, label]) => (
                    <View key={label} style={styles.feature}>
                      <AppIcon name={icon} size={17} color={C.green} />
                      <AppText style={styles.featureText}>{label}</AppText>
                    </View>
                  ))}
                </View>
              )}

              {step === 1 && (
                <View style={styles.formSection}>
                  <AppText style={styles.sectionLabel}>CE QUI TE PLAÎT</AppText>
                  <View style={styles.chips}>
                    {interests.map((item) => (
                      <Pressable
                        key={item}
                        onPress={() =>
                          setSelected((old) =>
                            old.includes(item)
                              ? old.filter((x) => x !== item)
                              : [...old, item],
                          )
                        }
                        style={[
                          styles.chip,
                          selected.includes(item) && styles.chipActive,
                        ]}
                      >
                        <AppText
                          style={[
                            styles.chipText,
                            selected.includes(item) && styles.chipTextActive,
                          ]}
                        >
                          {selected.includes(item) ? "✓  " : ""}
                          {item}
                        </AppText>
                      </Pressable>
                    ))}
                  </View>
                  <AppText style={styles.sectionLabel}>TON PAYS</AppText>
                  <View style={styles.chips}>
                    {["Bénin", "Togo", "Ghana", "Sénégal", "France"].map(
                      (item) => (
                        <Pressable
                          key={item}
                          onPress={() => setCountry(item)}
                          style={[
                            styles.chip,
                            country === item && styles.chipActive,
                          ]}
                        >
                          <AppText
                            style={[
                              styles.chipText,
                              country === item && styles.chipTextActive,
                            ]}
                          >
                            {item}
                          </AppText>
                        </Pressable>
                      ),
                    )}
                  </View>
                </View>
              )}

              {step === 2 && (
                <View style={styles.formSection}>
                  <AppText style={styles.sectionLabel}>TON PROFIL</AppText>
                  <AppTextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Prénom"
                    placeholderTextColor="#969A92"
                  />
                  <AppTextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Nom"
                    placeholderTextColor="#969A92"
                  />
                  <AppTextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Adresse e-mail"
                    placeholderTextColor="#969A92"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <AppText style={styles.demoNote}>
                    Mode démo · tes informations restent sur cet appareil.
                  </AppText>
                </View>
              )}

              {step === 3 && (
                <View style={styles.formSection}>
                  <AppText style={styles.sectionLabel}>
                    TON PREMIER CERCLE
                  </AppText>
                  <AppTextInput
                    style={styles.input}
                    value={circleName}
                    onChangeText={setCircleName}
                    placeholder="Nom du cercle"
                    placeholderTextColor="#969A92"
                  />
                  <AppText style={styles.sectionLabel}>
                    CHOISIS TES AMIS · DÉMO
                  </AppText>
                  <View style={styles.chips}>
                    {suggestedFriends.map((friend) => (
                      <Pressable
                        key={friend}
                        onPress={() =>
                          setFriends((old) =>
                            old.includes(friend)
                              ? old.filter((item) => item !== friend)
                              : [...old, friend],
                          )
                        }
                        style={[
                          styles.chip,
                          friends.includes(friend) && styles.chipActive,
                        ]}
                      >
                        <AppText
                          style={[
                            styles.chipText,
                            friends.includes(friend) && styles.chipTextActive,
                          ]}
                        >
                          {friends.includes(friend) ? "✓  " : "+  "}
                          {friend}
                        </AppText>
                      </Pressable>
                    ))}
                  </View>
                  <AppText style={styles.demoNote}>
                    Tu pourras créer d’autres cercles depuis ton profil.
                  </AppText>
                </View>
              )}
            </View>
          </ScrollView>

          <View
            style={[
              styles.footer,
              {
                paddingHorizontal: width < 380 ? 18 : 24,
                paddingBottom: compact ? 10 : 18,
              },
            ]}
          >
            {!!error && <AppText style={styles.error}>{error}</AppText>}
            <View style={styles.dots}>
              {slides.map((item, index) => (
                <View
                  key={item.title}
                  style={[styles.dot, index === step && styles.dotActive]}
                />
              ))}
            </View>
            <Pressable style={styles.button} onPress={continueOnboarding}>
              <AppText style={styles.buttonText}>
                {step === 3 ? "Créer mon cercle" : "Continuer"}
              </AppText>
              {step < 3 && <AppIcon name="arrow" size={17} color="#FFFFFF" />}
            </Pressable>
            <Pressable onPress={() => router.push("/login")} hitSlop={8}>
              <AppText style={styles.login}>
                Déjà un compte ?{" "}
                <AppText style={styles.loginLink}>Se connecter</AppText>
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
      </KeyboardAvoidingView>
    </Page>
  );
}

const styles = StyleSheet.create({
  keyboardAvoiding: { flex: 1 },
  screen: {
    flex: 1,
    width: "100%",
    backgroundColor: C.cream,
    alignItems: "center",
  },
  frame: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
    backgroundColor: C.cream,
  },
  topbar: {
    minHeight: 96,
    paddingTop: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandPosition: { marginTop: 0 },
  skip: { fontSize: 12, fontWeight: "600", color: "#777A73" },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F0EEE7",
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 2,
    paddingBottom: 16,
  },
  slideContent: { alignItems: "center", gap: 14 },
  photoStage: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 0,
  },
  photoCard: {
    position: "absolute",
    padding: 5,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    shadowColor: "#1F2921",
    shadowOpacity: 0.17,
    shadowRadius: 13,
    shadowOffset: { width: 0, height: 7 },
    elevation: 7,
  },
  photoImage: { flex: 1, overflow: "hidden", backgroundColor: "#D8DED4" },
  imageRadius: { borderRadius: 6 },
  photoBack: {
    left: 16,
    top: 28,
    transform: [{ rotate: "-13deg" }],
    zIndex: 1,
  },
  photoLeft: { left: 0, top: 67, transform: [{ rotate: "-5deg" }], zIndex: 2 },
  photoRight: {
    right: 2,
    top: 54,
    transform: [{ rotate: "10deg" }],
    zIndex: 2,
  },
  photoMain: {
    left: "14%",
    top: 7,
    transform: [{ rotate: "2deg" }],
    zIndex: 3,
  },
  floatingBadge: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: C.lime,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
    shadowColor: "#1F2921",
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
  },
  badgeTop: { left: "25%", top: 0, transform: [{ rotate: "-10deg" }] },
  badgeSide: {
    right: 0,
    top: "24%",
    backgroundColor: "#FFFFFF",
    transform: [{ rotate: "10deg" }],
  },
  avatarStack: {
    position: "absolute",
    left: 3,
    bottom: 18,
    flexDirection: "row",
    zIndex: 6,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: C.cream,
    alignItems: "center",
    justifyContent: "center",
    marginRight: -6,
  },
  avatarText: { fontSize: 10, fontWeight: "800", color: "#FFFFFF" },
  copy: { alignItems: "center", gap: 7, paddingHorizontal: 3 },
  eyebrow: {
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1.8,
    color: "#96978F",
  },
  title: {
    maxWidth: 350,
    textAlign: "center",
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "800",
    letterSpacing: -0.5,
    color: "#191B19",
  },
  description: {
    maxWidth: 320,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 17,
    color: "#74766F",
  },
  featureRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 1,
  },
  feature: { alignItems: "center", gap: 5, minWidth: 57 },
  featureText: { fontSize: 8, color: "#686B64", fontWeight: "600" },
  formSection: { width: "100%", gap: 9, paddingTop: 1 },
  sectionLabel: {
    fontSize: 9,
    color: "#82847D",
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 3,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  chip: {
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E2D9",
  },
  chipActive: { backgroundColor: C.green, borderColor: C.green },
  chipText: { fontSize: 10, color: C.ink, fontWeight: "600" },
  chipTextActive: { color: C.white },
  input: {
    height: 43,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E5E2D9",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 13,
    color: C.ink,
    fontSize: 12,
  },
  demoNote: { fontSize: 9, lineHeight: 14, color: "#8A8B84" },
  footer: { width: "100%", alignItems: "center", gap: 12, paddingTop: 10 },
  dots: {
    height: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#D5D5CE" },
  dotActive: { width: 17, backgroundColor: "#222522" },
  button: {
    minHeight: 48,
    width: "100%",
    borderRadius: 26,
    backgroundColor: "#191B19",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: "#111",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  buttonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  login: { color: "#85867F", fontSize: 10, textAlign: "center" },
  loginLink: { color: C.ink, fontWeight: "700" },
  error: { width: "100%", textAlign: "center", color: "#A94D3C", fontSize: 10 },
});
