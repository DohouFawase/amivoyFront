import { AppText } from "@/components/app-text";
import { Link, router } from "expo-router";
import { AppIcon } from "@/components/app-icon";
import { BrandLogo } from "@/components/brand-logo";
import { Children, isValidElement, ReactNode } from "react";
import { ImageBackground, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, View, useWindowDimensions, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const C = {
  ink: "#133B2C",
  muted: "#65766D",
  green: "#133B2C",
  lime: "#FFD000",
  cream: "#FCFBF7",
  white: "#FFFFFF",
  line: "#E8E6DC",
  orange: "#FFD000",
  pale: "#EEF1E9",
};

export function Page({
  children,
  scroll = true,
}: {
  children: ReactNode;
  scroll?: boolean;
}) {
  const { width } = useWindowDimensions();
  const horizontalPadding = width < 360 ? 16 : width < 768 ? 22 : 32;
  const items = Children.toArray(children);
  const first = items[0];
  const hasHeader = isValidElement(first) && first.type === Header;
  return (
    <SafeAreaView style={s.page} edges={["top"]}>
      {scroll ? (
        <KeyboardAvoidingView style={s.page} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          {hasHeader && (
            <View style={[s.stickyHeader, { paddingHorizontal: horizontalPadding, maxWidth: width < 768 ? 700 : 820 }]}>
              {first}
            </View>
          )}
          <ScrollView
            style={s.scrollArea}
            contentContainerStyle={[s.pageContent, { paddingHorizontal: horizontalPadding, paddingTop: hasHeader ? 20 : 10, maxWidth: width < 768 ? 700 : 820 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          >
            {hasHeader ? items.slice(1) : children}
          </ScrollView>
        </KeyboardAvoidingView>
      ) : children}
    </SafeAreaView>
  );
}
export function TextLabel({
  children,
  style,
}: {
  children: ReactNode;
  style?: object;
}) {
  return <AppText style={[s.text, style]}>{children}</AppText>;
}
export function Eyebrow({ children }: { children: ReactNode }) {
  return <AppText style={s.eyebrow}>{children}</AppText>;
}
export function Header({
  title,
  back = false,
  right,
}: {
  title: string;
  back?: boolean;
  right?: ReactNode;
}) {
  return (
    <View style={s.header}>
      {back ? (
        <Pressable onPress={() => router.back()} style={s.back}>
          <AppIcon name="back" size={20} color={C.ink} />
        </Pressable>
      ) : (
        <BrandLogo compact />
      )}
      <AppText style={s.headerTitle}>{title}</AppText>
      <View style={s.headerRight}>{right}</View>
    </View>
  );
}
export function BottomBar({ active = "home" }: { active?: string }) {
  return (
    <View style={s.tabBar}>
      <Link href="/home" asChild>
        <Pressable style={s.tab}>
          <AppIcon name="home" size={22} color={active === "home" ? C.green : "#94A097"} />
          <AppText style={[s.tabLabel, active === "home" && s.selected]}>
            Accueil
          </AppText>
        </Pressable>
      </Link>
      <Link href="/explore" asChild>
        <Pressable style={s.tab}>
          <AppIcon name="search" size={22} color={active === "explore" ? C.green : "#94A097"} />
          <AppText style={[s.tabLabel, active === "explore" && s.selected]}>
            Explorer
          </AppText>
        </Pressable>
      </Link>
      <Link href="/create" asChild>
        <Pressable style={s.createTab}>
          <AppIcon name="add" size={26} color={C.green} />
        </Pressable>
      </Link>
      <Link href={"/activity" as any} asChild>
        <Pressable style={s.tab}>
          <AppIcon name="group" size={22} color={active === "activity" ? C.green : "#94A097"} />
          <AppText style={[s.tabLabel, active === "activity" && s.selected]}>
            Fil
          </AppText>
        </Pressable>
      </Link>
      <Link href="/profile" asChild>
        <Pressable style={s.tab}>
          <AppIcon name="profile" size={22} color={active === "profile" ? C.green : "#94A097"} />
          <AppText style={[s.tabLabel, active === "profile" && s.selected]}>
            Profil
          </AppText>
        </Pressable>
      </Link>
    </View>
  );
}
export function TripCard({
  trip,
  compact = false,
}: {
  trip: any;
  compact?: boolean;
}) {
  return (
    <Link href={`/trip/${trip.id}`} asChild>
      <Pressable style={compact ? s.compactCard : s.tripCard}>
        <ImageBackground
          source={{ uri: trip.image }}
          style={compact ? s.compactImage : s.tripImage}
          imageStyle={{ borderRadius: 22 }}
        >
          <View style={s.imageScrim} />
          <View style={s.tripPill}>
            <AppText style={s.pillText}>{trip.status}</AppText>
          </View>
          <View style={s.tripOverlay}>
            <AppText style={s.tripTitle}>{trip.title}</AppText>
            <AppText style={s.tripSub}>
              {trip.destination} · {trip.dates}
            </AppText>
            <AppText style={s.tripMeta}>
              ◉ {trip.people} voyageurs · {trip.days} jours
            </AppText>
          </View>
        </ImageBackground>
      </Pressable>
    </Link>
  );
}
export function SectionTitle({
  title,
  action,
  href,
}: {
  title: string;
  action?: string;
  href?: any;
}) {
  return (
    <View style={s.sectionHead}>
      <AppText style={s.sectionTitle}>{title}</AppText>
      {action && href ? (
        <Link href={href} style={s.sectionAction}>
          {action} ›
        </Link>
      ) : action ? (
        <AppText style={s.sectionAction}>{action}</AppText>
      ) : null}
    </View>
  );
}
export function Surface({
  children,
  style,
}: {
  children: ReactNode;
  style?: object;
}) {
  return <View style={[s.surface, style]}>{children}</View>;
}
export function Pill({
  children,
  active = false,
  onPress,
}: {
  children: ReactNode;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[s.pill, active && s.pillActive]}>
      <AppText style={[s.pillLabel, active && s.pillLabelActive]}>{children}</AppText>
    </Pressable>
  );
}
export const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.cream },
  scrollArea: { flex: 1 },
  stickyHeader: { width: "100%", alignSelf: "center", paddingTop: 10, paddingBottom: 8, marginBottom: 10, backgroundColor: C.cream, borderBottomWidth: 1, borderBottomColor: "#D8DED4", shadowColor: C.green, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 5, elevation: 2, zIndex: 1 },
  pageContent: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 108,
    gap: 20,
    maxWidth: 700,
    width: "100%",
    alignSelf: "center",
  },
  text: { fontSize: 14, color: C.ink },
  header: { minHeight: 58, flexDirection: "row", alignItems: "center", gap: 12 },
  brand: { flexDirection: "row", alignItems: "center", gap: 5 },
  logo: { fontSize: 20, fontWeight: "900", color: C.green, letterSpacing: -1 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: C.ink, flex: 1 },
  headerRight: { width: 42, alignItems: "flex-end" },
  back: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 1.7,
    fontWeight: "800",
    color: C.muted,
  },
  hero: { paddingTop: 10, gap: 10 },
  heroTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    letterSpacing: -1.1,
    color: C.ink,
  },
  heroSub: { fontSize: 14, lineHeight: 20, color: C.muted },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 3,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.4,
    color: C.ink,
  },
  sectionAction: { fontSize: 12, fontWeight: "700", color: C.green },
  tripCard: { height: 220, borderRadius: 22, overflow: "hidden" },
  tripImage: { flex: 1, justifyContent: "space-between", padding: 15 },
  imageScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(20,28,23,.28)",
  },
  tripPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,.9)",
  },
  pillText: { fontSize: 10, fontWeight: "800", color: C.green },
  tripOverlay: { gap: 5 },
  tripTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.6,
  },
  tripSub: { fontSize: 12, color: "#fff", fontWeight: "600" },
  tripMeta: { fontSize: 11, color: "#fff", marginTop: 4 },
  compactCard: {
    width: 245,
    height: 150,
    borderRadius: 20,
    overflow: "hidden",
  },
  compactImage: { flex: 1, justifyContent: "flex-end", padding: 13 },
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 77,
    backgroundColor: C.cream,
    borderTopWidth: 1,
    borderTopColor: C.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 9,
  },
  tab: { alignItems: "center", justifyContent: "center", gap: 3, flex: 1, minHeight: 48 },
  tabIcon: { fontSize: 23, color: "#94A097" },
  tabLabel: { fontSize: 9, color: "#8A948C" },
  selected: { color: C.green, fontWeight: "800" },
  createTab: {
    width: 49,
    height: 49,
    borderRadius: 17,
    backgroundColor: C.lime,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
    borderWidth: 4,
    borderColor: C.cream,
  },
  plus: { fontSize: 27, color: C.green, lineHeight: 32 },
  surface: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EFF0E9",
  },
  pill: {
    paddingVertical: 9,
    paddingHorizontal: 15,
    backgroundColor: C.white,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: C.line,
  },
  pillActive: { backgroundColor: C.green, borderColor: C.green },
  pillLabel: { fontSize: 12, color: C.muted, fontWeight: "700" },
  pillLabelActive: { color: "#fff" },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.pale,
  },
  button: {
    minHeight: 48,
    backgroundColor: C.lime,
    borderRadius: 16,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { fontSize: 14, color: C.green, fontWeight: "800" },
  input: {
    minHeight: 48,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: C.ink,
  },
  divider: { height: 1, backgroundColor: C.line },
  tag: {
    fontSize: 10,
    color: C.green,
    fontWeight: "800",
    backgroundColor: C.pale,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
  },
});
