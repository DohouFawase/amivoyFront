import { useEffect } from "react";
import { Link } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { fetchOutings } from "@/actions/groupActions";
import { AppText } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { C, Header, Page, SectionTitle, Surface } from "@/components/app-ui";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";

export default function Outings() {
  const dispatch = useAppDispatch();
  const { outings, error, requestStatus } = useAppSelector((state) => state.groups);

  useEffect(() => {
    void dispatch(fetchOutings());
  }, [dispatch]);

  return (
    <Page>
      <Header back title="Mes sorties" />
      <AppText style={styles.heading}>Les bons moments se préparent ensemble.</AppText>
      <AppText style={styles.sub}>Sorties, rendez-vous et souvenirs partagés.</AppText>
      <Link href="/create-outing" style={styles.create}>Organiser une sortie</Link>
      <SectionTitle title="À venir et en cours" action={`${outings.length}`} />

      {requestStatus === "loading" && outings.length === 0 && <AppText style={styles.sub}>Chargement des sorties…</AppText>}
      {!!error && <AppText style={styles.error}>{error}</AppText>}
      {outings.map((outing) => (
        <Link key={outing.id} href={{ pathname: "/outing/[id]", params: { id: outing.id } } as never} asChild>
          <Pressable>
            <Surface style={styles.card}>
              <View style={styles.pin}><AppIcon name="pin" size={21} /></View>
              <View style={{ flex: 1, gap: 4 }}>
                <AppText style={styles.kicker}>{outing.category} · {outing.date ?? "Date à confirmer"} · {outing.time ?? "Heure à confirmer"}</AppText>
                <AppText style={styles.title}>{outing.title}</AppText>
                <AppText style={styles.sub}>{outing.place}</AppText>
                <AppText style={styles.people}>{outing.attending.length} présent(s) · {outing.photos.length} souvenir(s)</AppText>
              </View>
              <AppText style={styles.arrow}>›</AppText>
            </Surface>
          </Pressable>
        </Link>
      ))}
      {requestStatus !== "loading" && !error && outings.length === 0 && (
        <Surface style={styles.empty}>
          <AppIcon name="outing" size={26} />
          <AppText style={styles.title}>Aucune sortie pour le moment</AppText>
          <AppText style={styles.sub}>Crée une sortie pour commencer.</AppText>
        </Surface>
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 25, fontWeight: "900", color: C.ink, lineHeight: 31 },
  sub: { fontSize: 11, color: C.muted, lineHeight: 16 },
  create: { backgroundColor: C.lime, color: C.green, overflow: "hidden", padding: 13, borderRadius: 10, textAlign: "center", fontWeight: "900", fontSize: 11 },
  card: { flexDirection: "row", alignItems: "center", gap: 11, padding: 13 },
  pin: { width: 42, height: 42, borderRadius: 12, backgroundColor: "#EDF2E8", alignItems: "center", justifyContent: "center" },
  kicker: { fontSize: 8, color: C.green, fontWeight: "900" },
  title: { fontSize: 13, color: C.ink, fontWeight: "900" },
  people: { fontSize: 9, color: C.muted, marginTop: 2 },
  arrow: { fontSize: 20, color: C.green },
  empty: { alignItems: "center", gap: 8, padding: 22 },
  error: { color: "#A7493C", fontSize: 11, fontWeight: "800" },
});
