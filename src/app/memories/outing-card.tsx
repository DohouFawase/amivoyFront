import { AppIcon } from "@/components/app-icon";
import { AppText } from "@/components/app-text";
import { C, Header, Page, Surface } from "@/components/app-ui";
import { getOuting } from "@/data/outings";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Platform, Pressable, Share, StyleSheet, View } from "react-native";

function escapeXml(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

export default function OutingMemoryCard() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const outing = getOuting(id);
  const [notice, setNotice] = useState("");
  const confirmed = outing?.attending ?? [];
  const publicPlace = outing?.locationType === "private" ? "Une belle soirée entre amis" : outing?.place ?? "Notre sortie";
  const svg = useMemo(() => {
    if (!outing) return "";
    const title = escapeXml(outing.title);
    const place = escapeXml(publicPlace);
    const details = escapeXml(`${outing.date} · ${outing.time}`);
    const people = escapeXml(`${confirmed.length} personnes réunies`);
    const memories = escapeXml(`${outing.photos.length} souvenir${outing.photos.length === 1 ? "" : "s"} · Amivoy`);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#133B2C"/><stop offset="1" stop-color="#397153"/></linearGradient></defs><rect width="1080" height="1350" fill="#FCFBF7"/><rect x="40" y="40" width="1000" height="1270" rx="54" fill="url(#g)"/><circle cx="850" cy="280" r="230" fill="#FFD000" opacity=".13"/><text x="100" y="160" fill="#FFD000" font-family="Arial,sans-serif" font-size="35" font-weight="700">AMIVOY · NOS SOUVENIRS</text><text x="100" y="510" fill="#FCFBF7" font-family="Arial,sans-serif" font-size="74" font-weight="700">${title}</text><text x="100" y="625" fill="#E4EEE5" font-family="Arial,sans-serif" font-size="42">${place}</text><path d="M100 710h880" stroke="#FFFFFF" stroke-opacity=".3" stroke-width="3"/><text x="100" y="825" fill="#FFD000" font-family="Arial,sans-serif" font-size="38">${details}</text><text x="100" y="930" fill="#FCFBF7" font-family="Arial,sans-serif" font-size="38">${people}</text><text x="100" y="1085" fill="#E4EEE5" font-family="Arial,sans-serif" font-size="32">${memories}</text><text x="100" y="1210" fill="#FCFBF7" font-family="Arial,sans-serif" font-size="40" font-weight="700">Les bons moments se vivent ensemble ✳</text></svg>`;
  }, [outing, publicPlace, confirmed.length]);
  if (!outing) return <Page><Header back title="Carte souvenir"/><AppText style={st.heading}>Cette sortie n’existe plus dans la démo.</AppText></Page>;
  const selectedOuting = outing;
  const imageUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  async function exportCard() {
    try {
      if (Platform.OS === "web") {
        const link = document.createElement("a");
        link.href = imageUri;
        link.download = `amivoy-${selectedOuting.id}.svg`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setNotice("Carte souvenir téléchargée · tu peux l’envoyer sur WhatsApp ou les réseaux ✓");
        return;
      }
      await Share.share({ title: "Souvenir Amivoy", message: `Notre sortie ${selectedOuting.title} · ${publicPlace} · ${selectedOuting.date} à ${selectedOuting.time} · ${confirmed.length} personnes réunies.`, url: imageUri });
    } catch {
      setNotice("Le partage n’a pas abouti. Réessaie depuis la carte souvenir.");
    }
  }
  return <Page><Header back title="Carte souvenir"/>
    <AppText style={st.heading}>Un souvenir à partager.</AppText>
    <AppText style={st.sub}>Voici une carte récapitulative de la sortie, prête à enregistrer ou à partager.</AppText>
    <Surface style={st.card}>
      <View style={st.brand}><AppIcon name="outing" size={25} color={C.lime}/><AppText style={st.brandText}>AMIVOY · NOS SOUVENIRS</AppText></View>
      <View style={st.art}><AppIcon name={outing.category === "Restaurant" ? "restaurant" : "outing"} size={64} color={C.white}/></View>
      <AppText style={st.title}>{outing.title}</AppText>
      <AppText style={st.place}>{publicPlace}</AppText>
      <View style={st.rule}/>
      <View style={st.details}><AppIcon name="clock" size={18}/><AppText style={st.detailText}>{outing.date} · {outing.time}</AppText></View>
      <View style={st.details}><AppIcon name="group" size={18}/><AppText style={st.detailText}>{confirmed.length} personnes réunies</AppText></View>
      <AppText style={st.footer}>{outing.photos.length} souvenir{outing.photos.length === 1 ? "" : "s"} · Les bons moments se vivent ensemble ✳</AppText>
    </Surface>
    <Pressable onPress={() => void exportCard()} style={st.button}><AppIcon name="share" size={17} color={C.white}/><AppText style={st.buttonText}>{Platform.OS === "web" ? "Télécharger la carte souvenir" : "Partager la carte souvenir"}</AppText></Pressable>
    {!!notice && <AppText style={st.notice}>{notice}</AppText>}
    <AppText style={st.disclaimer}>Cette carte est une création mock de la démo. Le partage natif utilise le menu de partage de l’appareil.</AppText>
  </Page>;
}

const st = StyleSheet.create({
  heading: { color: C.ink, fontSize: 26, fontWeight: "900" }, sub: { color: C.muted, fontSize: 11, lineHeight: 16 },
  card: { backgroundColor: C.green, borderRadius: 23, gap: 12, padding: 22, overflow: "hidden" }, brand: { flexDirection: "row", alignItems: "center", gap: 8 }, brandText: { color: C.lime, fontSize: 10, fontWeight: "900", letterSpacing: 1.1 },
  art: { height: 130, borderRadius: 18, backgroundColor: "rgba(255,255,255,.12)", alignItems: "center", justifyContent: "center", marginVertical: 4 },
  title: { color: C.white, fontSize: 23, fontWeight: "900" }, place: { color: "#DFEADF", fontSize: 13 }, rule: { height: 1, backgroundColor: "rgba(255,255,255,.24)", marginVertical: 4 },
  details: { flexDirection: "row", alignItems: "center", gap: 9 }, detailText: { color: C.white, fontSize: 12, fontWeight: "700" }, footer: { color: C.lime, fontSize: 11, fontWeight: "800", lineHeight: 17, marginTop: 8 },
  button: { minHeight: 48, borderRadius: 14, backgroundColor: C.green, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }, buttonText: { color: C.white, fontSize: 11, fontWeight: "900" },
  notice: { color: C.green, fontSize: 11, fontWeight: "800", textAlign: "center" }, disclaimer: { color: C.muted, fontSize: 9, lineHeight: 14, textAlign: "center" },
});
