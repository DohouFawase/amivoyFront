import { AppText } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { Link, router, useLocalSearchParams } from "expo-router";
import { ImageBackground, Pressable, StyleSheet, View } from "react-native";
import {
  BottomBar,
  C,
  Header,
  Page,
  SectionTitle,
  Surface,
} from "@/components/app-ui";
import { expenses, itinerary, trips } from "@/data/mock";
import { formatXof } from "@/data/currency";
import { useState } from "react";
export default function TripDetail() {
  const [inviteNotice, setInviteNotice] = useState(false);
  const { id, destination, title } = useLocalSearchParams<{ id: string; destination?: string; title?: string }>();
  const isDraft = id === 'draft';
  const draftDestination = typeof destination === 'string' ? destination : 'Destination à choisir';
  const draftTemplate = /bénin|benin/i.test(draftDestination) ? trips.find((item) => item.id === 'cotonou')! : trips[0];
  const trip = isDraft ? { ...draftTemplate, id: 'draft', title: typeof title === 'string' ? title : `Voyage à ${draftDestination}`, destination: draftDestination, dates: 'Dates à organiser', status: 'À préparer' } : trips.find((t) => t.id === id) ?? trips[0];
  return (
    <View style={{ flex: 1, backgroundColor: C.cream }}>
      <Page>
        <Header
          back
          title="Détail du voyage"
          right={<AppText style={{ fontSize: 19 }}>•••</AppText>}
        />
        <ImageBackground
          source={{ uri: trip.image }}
          style={x.heroImage}
          imageStyle={{ borderRadius: 23 }}
        >
          <View style={x.scrim} />
          <AppText style={x.status}>{trip.status}</AppText>
          <View>
            <AppText style={x.title}>{trip.title}</AppText>
            <AppText style={x.sub}>
              {trip.destination} · {trip.dates}
            </AppText>
          </View>
        </ImageBackground>
        {isDraft ? (
          <Surface style={{ gap: 10, backgroundColor: '#EEF3E9' }}>
            <AppText style={{ fontSize: 12, fontWeight: '900', color: C.ink }}>Pays et destination retenus</AppText>
            <AppText style={{ fontSize: 14, fontWeight: '800', color: C.green }}>{trip.destination}</AppText>
            <AppText style={{ fontSize: 11, lineHeight: 16, color: C.muted }}>Ajoute des villes, des visites, des restaurants et des activités pour construire le voyage dans ce pays.</AppText>
            <Link href="/map" style={{ color: C.green, fontSize: 11, fontWeight: '900' }}>Continuer sur la carte →</Link>
            <Link href={`/trip/${trip.id}/planning` as any} style={{ color: C.green, fontSize: 11, fontWeight: '900' }}>Organiser le voyage en groupe →</Link>
            <Link href={`/trip/${trip.id}/safety` as any} style={{ color: C.green, fontSize: 11, fontWeight: '900' }}>Préparer la sécurité →</Link>
            <Link href={{pathname:'/trip/[id]/services',params:{id:trip.id,destination:trip.destination}} as any} style={{ color: C.green, fontSize: 11, fontWeight: '900' }}>Voir les logements et restaurants →</Link>
          </Surface>
        ) : (
          <>
        <View style={x.members}>
          <View style={{ flexDirection: "row" }}>
            {["A", "M", "Y", "S"].map((a, i) => (
              <View
                key={a}
                style={[
                  x.avatar,
                  {
                    marginLeft: i ? -7 : 0,
                    backgroundColor: [
                      "#D9E8D3",
                      "#F2DCD2",
                      "#DFE5F0",
                      "#EAE2C8",
                    ][i],
                  },
                ]}
              >
                <AppText style={{ fontWeight: "800", color: C.ink }}>{a}</AppText>
              </View>
            ))}
          </View>
          <AppText style={{ fontSize: 12, color: C.muted, flex: 1 }}>
            {trip.circleName ? `${trip.circleName} · ${trip.people} personnes` : `${trip.people} amis dans ce voyage`}
          </AppText>
          <Pressable onPress={() => { setInviteNotice(true); router.push("/circles"); }}>
            <AppText style={{ color: C.green, fontWeight: "800" }}>{inviteNotice ? "Invités ✓" : "Inviter +"}</AppText>
          </Pressable>
        </View>
        <View style={x.quickGrid}>
          {[
            ["map", "Itinéraire", "/trip/" + trip.id + "/itinerary"],
            ["payments", "Budget", "/trip/" + trip.id + "/budget"],
            ["packing", "Valise", "/trip/" + trip.id + "/packing"],
            ["journal", "Carnet", "/trip/" + trip.id + "/journal"],
          ].map((a) => (
            <Link key={a[1]} href={a[2] as any} asChild>
              <Pressable style={x.quick}>
                <AppIcon name={a[0]} size={19} />
                <AppText style={x.quickLabel}>{a[1]}</AppText>
              </Pressable>
            </Link>
          ))}
        </View>
        <SectionTitle title="Voyager à plusieurs" />
        <View style={x.quickGrid}>
          {[["group", "Décisions", "planning"], ["shield", "Sécurité", "safety"], ["apartment", "Logements", "services"]].map(([icon, label, route]) => (
            <Link key={route} href={`/trip/${trip.id}/${route}` as any} asChild><Pressable style={x.quick}><AppIcon name={icon} size={19} /><AppText style={x.quickLabel}>{label}</AppText></Pressable></Link>
          ))}
        </View>
          </>
        )}
        {!isDraft && <>
        <SectionTitle
          title="Aujourd’hui · Jour 3"
          action="Tout voir"
          href={`/trip/${trip.id}/itinerary`}
        />
        <View style={{ gap: 10 }}>
          {itinerary.slice(0, 2).map((a) => (
            <Surface key={a.time} style={x.event}>
              <AppText style={x.time}>{a.time}</AppText>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 13,
                  backgroundColor: "#EEF2E7",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AppIcon name={a.icon} size={18} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText style={{ fontSize: 13, fontWeight: "800", color: C.ink }}>
                  {a.title}
                </AppText>
                <AppText style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>
                  {a.location}
                </AppText>
              </View>
              <AppText style={{ color: C.green }}>›</AppText>
            </Surface>
          ))}
        </View>
        <SectionTitle
          title="Le budget du groupe"
          action="Détails"
          href={`/trip/${trip.id}/budget`}
        />
        <Surface style={{ gap: 12 }}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <AppText style={{ color: C.muted, fontSize: 12 }}>Dépensé</AppText>
            <AppText style={{ fontSize: 12, fontWeight: "800", color: C.ink }}>
              {formatXof(trip.spent)} / {formatXof(trip.budget)}
            </AppText>
          </View>
          <View style={x.progress}>
            <View
              style={[
                x.progressFill,
                { width: `${Math.max(8, (trip.spent / trip.budget) * 100)}%` },
              ]}
            />
          </View>
          <AppText style={{ fontSize: 11, color: C.muted }}>
            Encore {formatXof(trip.budget - trip.spent)} disponibles pour le groupe
          </AppText>
        </Surface>
        <SectionTitle
          title="Dernières dépenses"
          action="Toutes"
          href={`/trip/${trip.id}/budget`}
        />
        {expenses.slice(0, 2).map((e) => (
          <Surface key={e.name} style={x.expense}>
            <AppIcon name={e.emoji} size={22} />
            <View style={{ flex: 1 }}>
              <AppText style={{ fontSize: 12, fontWeight: "800", color: C.ink }}>
                {e.name}
              </AppText>
              <AppText style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>
                {e.who} a payé
              </AppText>
            </View>
            <AppText style={{ fontWeight: "800", color: C.ink }}>
              {formatXof(e.amount)}
            </AppText>
          </Surface>
        ))}
        </>}
      </Page>
      <BottomBar />
    </View>
  );
}
const x = StyleSheet.create({
  heroImage: { height: 220, padding: 16, justifyContent: "space-between" },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(20,30,24,.3)",
    borderRadius: 23,
  },
  status: {
    alignSelf: "flex-start",
    paddingHorizontal: 11,
    paddingVertical: 7,
    backgroundColor: "#fff",
    borderRadius: 20,
    color: C.green,
    fontSize: 10,
    fontWeight: "800",
    overflow: "hidden",
  },
  title: { fontSize: 25, fontWeight: "900", color: "#fff" },
  sub: { fontSize: 12, color: "#fff", marginTop: 5 },
  members: { flexDirection: "row", alignItems: "center", gap: 11 },
  avatar: {
    width: 31,
    height: 31,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: C.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  quickGrid: { flexDirection: "row", gap: 9 },
  quick: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    gap: 7,
  },
  quickIcon: { color: C.green, fontSize: 19, fontWeight: "800" },
  quickLabel: { fontSize: 10, color: C.ink, fontWeight: "700" },
  event: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12 },
  time: { fontSize: 11, fontWeight: "800", color: C.green, width: 39 },
  progress: {
    height: 9,
    backgroundColor: C.pale,
    borderRadius: 9,
    overflow: "hidden",
  },
  progressFill: { height: 9, backgroundColor: C.green, borderRadius: 9 },
  expense: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12 },
});
