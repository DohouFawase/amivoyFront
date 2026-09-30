import { AppText } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";
import {
  BottomBar,
  C,
  Eyebrow,
  Header,
  Page,
  Surface,
} from "@/components/app-ui";
import { itinerary, trips } from "@/data/mock";
import { listTripPlanItems } from "@/data/trip-plan";
export default function Itinerary() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const trip = trips.find((t) => t.id === id) ?? trips[0];
  const planned = listTripPlanItems(id);
  const city = trip.destination.split(/[→,]/)[0]?.trim() || trip.destination;
  const fullItinerary = [...itinerary, ...planned.map((item) => ({ time:item.time, title:item.title, type:item.type, icon:item.emoji, location:item.location, price:item.description }))];
  return (
    <View style={{ flex: 1, backgroundColor: C.cream }}>
      <Page>
        <Header back title="Itinéraire" />
        <Eyebrow>{trip.destination.toUpperCase()} · JOUR 3</Eyebrow>
        <AppText style={{ fontSize: 27, fontWeight: "900", color: C.ink }}>
          Une journée à {city}
        </AppText>
        <View style={st.days}>
          {[
            "Ven. 12",
            "Sam. 13",
            "Dim. 14",
            "Lun. 15",
            "Mar. 16",
            "Mer. 17",
          ].map((d, i) => (
            <View key={d} style={[st.day, i === 2 && st.dayOn]}>
              <AppText style={[st.dayText, i === 2 && { color: "#fff" }]}>
                {d}
              </AppText>
              <AppText style={[st.dayNum, i === 2 && { color: "#fff" }]}>
                {12 + i}
              </AppText>
            </View>
          ))}
        </View>
        <Surface style={st.map}>
          <AppIcon name="map" size={35} />
          <View>
            <AppText style={{ fontWeight: "800", color: C.ink }}>
              Parcours du jour
            </AppText>
            <AppText style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
              {fullItinerary.length} étapes · programme partagé du voyage
            </AppText>
          </View>
          <AppText style={{ color: C.green, marginLeft: "auto" }}>↗</AppText>
        </Surface>
        <View style={{ gap: 0 }}>
          {fullItinerary.map((a, i) => (
            <View key={a.time} style={st.row}>
              <View style={st.timeCol}>
                <AppText style={st.time}>{a.time}</AppText>
                <View style={st.lineWrap}>
                  <View style={st.dot} />
                  {i < itinerary.length - 1 && <View style={st.line} />}
                </View>
              </View>
              <Surface style={st.activity}>
                <View style={st.activityHead}>
                  <AppIcon name={a.icon} size={19} />
                  <AppText style={st.type}>{a.type}</AppText>
                </View>
                <AppText
                  style={{
                    fontSize: 15,
                    fontWeight: "900",
                    color: C.ink,
                    marginTop: 9,
                  }}
                >
                  {a.title}
                </AppText>
                <AppText style={{ fontSize: 11, color: C.muted, marginTop: 5 }}>
                  ⌖ {a.location}
                </AppText>
                <AppText
                  style={{
                    fontSize: 11,
                    color: C.green,
                    fontWeight: "700",
                    marginTop: 9,
                  }}
                >
                  {a.price}
                </AppText>
              </Surface>
            </View>
          ))}
        </View>
      </Page>
      <BottomBar />
    </View>
  );
}
const st = StyleSheet.create({
  days: { flexDirection: "row", justifyContent: "space-between" },
  day: {
    width: 48,
    height: 60,
    borderRadius: 15,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  dayOn: { backgroundColor: C.green },
  dayText: { fontSize: 9, color: C.muted },
  dayNum: { fontSize: 14, fontWeight: "800", color: C.ink },
  map: { flexDirection: "row", alignItems: "center", gap: 12, padding: 13 },
  row: { flexDirection: "row", gap: 10 },
  timeCol: { width: 52, alignItems: "center" },
  time: { fontSize: 10, fontWeight: "800", color: C.green },
  lineWrap: { alignItems: "center", flex: 1 },
  dot: {
    width: 10,
    height: 10,
    marginTop: 8,
    borderRadius: 5,
    backgroundColor: C.green,
  },
  line: { width: 2, backgroundColor: "#DCE5D5", flex: 1, minHeight: 110 },
  activity: { flex: 1, marginBottom: 12, padding: 13 },
  activityHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  type: { fontSize: 10, fontWeight: "700", color: C.muted },
});
