import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  mockInvitations,
  mockNotifications,
  mockSouvenir,
  mockTravelStops,
} from "@/data/feature-mocks";

const green = "#133B2C";
const ink = "#1C2923";
const muted = "#718078";
const yellow = "#FFD000";
const ivory = "#FCFBF7";

function Action({
  label,
  onPress,
  pale = false,
}: {
  label: string;
  onPress: () => void;
  pale?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={[s.action, pale && s.actionPale]}>
      <Text style={[s.actionText, pale && s.actionTextPale]}>{label}</Text>
    </Pressable>
  );
}

export default function DemoFeaturesScreen() {
  const [invitations, setInvitations] = useState(mockInvitations);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [reminders, setReminders] = useState(true);
  const [sync, setSync] = useState(true);
  const [name, setName] = useState("Aminata");
  const [email, setEmail] = useState("aminata@example.com");
  const [notice, setNotice] = useState("");

  return (
    <SafeAreaView style={s.screen} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={s.screen}
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
        >
          <View style={s.header}>
            <Text style={s.brand}>amivoy ✳</Text>
            <Text style={s.kicker}>ESPACE DÉMO</Text>
            <Text style={s.heading}>Tout le voyage, ensemble.</Text>
            <Text style={s.sub}>
              Ces interactions utilisent des exemples locaux. Rien n’est envoyé
              ni synchronisé avec un serveur.
            </Text>
          </View>

          <View style={s.card}>
            <Text style={s.eyebrow}>01 · INVITER LE GROUPE</Text>
            <Text style={s.title}>Les invitations</Text>
            <Text style={s.sub}>
              Choisis un canal et suis les réponses du groupe.
            </Text>
            {invitations.map((item) => (
              <View key={item.id} style={s.row}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{item.name[0]}</Text>
                </View>
                <View style={s.grow}>
                  <Text style={s.rowTitle}>{item.name}</Text>
                  <Text style={s.small}>
                    {item.channel} · {item.destination}
                  </Text>
                </View>
                <Text
                  style={[s.badge, item.status === "Acceptée" && s.badgeOk]}
                >
                  {item.status}
                </Text>
              </View>
            ))}
            <View style={s.wrap}>
              {["WhatsApp", "SMS", "E-mail"].map((channel) => (
                <Action
                  key={channel}
                  label={`Inviter · ${channel}`}
                  pale
                  onPress={() => {
                    setInvitations((old) => [
                      {
                        id: `invite-${Date.now()}`,
                        name: "Nouvel ami",
                        destination: "Cotonou",
                        channel: channel as (typeof old)[number]["channel"],
                        status: "En attente",
                      },
                      ...old,
                    ]);
                    setNotice(`Invitation ${channel} ajoutée à la démo.`);
                  }}
                />
              ))}
            </View>
          </View>

          <View style={s.card}>
            <Text style={s.eyebrow}>02 · RESTER AU COURANT</Text>
            <Text style={s.title}>Rappels et activité</Text>
            <Pressable
              style={s.toggleRow}
              onPress={() => setReminders(!reminders)}
            >
              <Text style={s.rowTitle}>Rappels de sortie</Text>
              <Text style={s.toggle}>
                {reminders ? "ACTIVÉS" : "DÉSACTIVÉS"}
              </Text>
            </Pressable>
            {notifications.map((item) => (
              <Pressable
                key={item.id}
                onPress={() =>
                  setNotifications((old) =>
                    old.map((x) =>
                      x.id === item.id ? { ...x, read: true } : x,
                    ),
                  )
                }
                style={s.noticeRow}
              >
                <View style={[s.dot, item.read && s.dotRead]} />
                <View style={s.grow}>
                  <Text style={s.rowTitle}>{item.title}</Text>
                  <Text style={s.small}>{item.message}</Text>
                  <Text style={s.time}>
                    {item.time}
                    {item.read ? " · Lue" : " · Appuie pour marquer comme lue"}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

          <View style={s.card}>
            <Text style={s.eyebrow}>03 · TON ESPACE AMIVOY</Text>
            <Text style={s.title}>Compte et synchronisation</Text>
            <Text style={s.label}>Nom affiché</Text>
            <TextInput value={name} onChangeText={setName} style={s.input} />
            <Text style={s.label}>E-mail de démonstration</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={s.input}
            />
            <Pressable style={s.toggleRow} onPress={() => setSync(!sync)}>
              <View>
                <Text style={s.rowTitle}>Synchronisation simulée</Text>
                <Text style={s.small}>Aperçu de tes données enregistrées</Text>
              </View>
              <Text style={s.toggle}>{sync ? "ACTIVE" : "PAUSE"}</Text>
            </Pressable>
            <Action
              label="Enregistrer le profil démo"
              onPress={() =>
                setNotice(`Profil local enregistré pour ${name || "toi"}.`)
              }
            />
          </View>

          <View style={s.card}>
            <Text style={s.eyebrow}>04 · GARDER LE SOUVENIR</Text>
            <Text style={s.title}>Carte souvenir</Text>
            <View style={s.memory}>
              <Text style={s.memoryBrand}>AMIVOY · CARNET DE VOYAGE</Text>
              <Text style={s.memoryTitle}>{mockSouvenir.title}</Text>
              <Text style={s.memoryDate}>{mockSouvenir.date} · Bénin</Text>
              <View style={s.rule} />
              {mockSouvenir.highlights.map((line) => (
                <Text key={line} style={s.memoryLine}>
                  ✳ {line}
                </Text>
              ))}
              <View style={s.rule} />
              <Text style={s.memoryDate}>
                Avec {mockSouvenir.members.join(" · ")}
              </Text>
            </View>
            <Action
              label="Préparer la carte souvenir"
              onPress={() =>
                setNotice("Aperçu de la carte souvenir prêt dans cette démo.")
              }
              pale
            />
          </View>

          <View style={s.card}>
            <Text style={s.eyebrow}>05 · ORGANISER LES ÉTAPES</Text>
            <Text style={s.title}>Voyage au Bénin</Text>
            <Text style={s.sub}>
              Étapes, nuits, hébergements et activités partagés.
            </Text>
            {mockTravelStops.map((stop, index) => (
              <View key={stop.id} style={s.stop}>
                <View style={s.stopHead}>
                  <View style={s.number}>
                    <Text style={s.numberText}>{index + 1}</Text>
                  </View>
                  <View style={s.grow}>
                    <Text style={s.rowTitle}>
                      {stop.city}, {stop.country}
                    </Text>
                    <Text style={s.small}>
                      {stop.arrival} · {stop.nights} nuits
                    </Text>
                  </View>
                </View>
                <View style={s.detail}>
                  <Text style={s.label}>HÉBERGEMENT</Text>
                  <Text style={s.rowTitle}>{stop.lodging}</Text>
                  <Text style={s.small}>
                    {stop.lodgingPrice.toLocaleString("fr-FR")} FCFA / nuit
                  </Text>
                  <Text style={[s.label, { marginTop: 12 }]}>À FAIRE</Text>
                  {stop.activities.map((activity) => (
                    <Text key={activity} style={s.small}>
                      • {activity}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
            <Action
              label="Ajouter une étape (démo)"
              onPress={() =>
                setNotice("Étape ajoutée au parcours de démonstration.")
              }
              pale
            />
          </View>

          {!!notice && (
            <Pressable onPress={() => setNotice("")} style={s.toast}>
              <Text style={s.toastText}>{notice} ×</Text>
            </Pressable>
          )}
          <Text style={s.foot}>
            Maquette interactive · Les modifications sont temporaires et restent
            dans cette session.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: ivory },
  content: {
    padding: 18,
    paddingTop: 26,
    paddingBottom: 48,
    gap: 14,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },
  header: { backgroundColor: green, borderRadius: 24, padding: 22, gap: 9 },
  brand: { color: yellow, fontSize: 15, fontWeight: "900" },
  kicker: {
    color: "#BCD0C1",
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: "800",
    marginTop: 10,
  },
  heading: { color: ivory, fontSize: 28, fontWeight: "900" },
  sub: { color: muted, fontSize: 12, lineHeight: 18 },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 17,
    gap: 12,
    borderWidth: 1,
    borderColor: "#ECEDE6",
  },
  eyebrow: { fontSize: 9, color: green, fontWeight: "900", letterSpacing: 1.1 },
  title: { fontSize: 20, color: ink, fontWeight: "900" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#F0F1EB",
  },
  avatar: {
    height: 36,
    width: 36,
    borderRadius: 13,
    backgroundColor: "#E8EFE7",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: green, fontWeight: "900" },
  grow: { flex: 1 },
  rowTitle: { fontSize: 12, fontWeight: "800", color: ink },
  small: { color: muted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  badge: {
    color: "#8B6B19",
    backgroundColor: "#FFF5CD",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 8,
    fontWeight: "900",
  },
  badgeOk: { color: green, backgroundColor: "#E8F1E8" },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  action: {
    backgroundColor: yellow,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionPale: { backgroundColor: "#EDF2E9" },
  actionText: { color: green, fontSize: 10, fontWeight: "900" },
  actionTextPale: { color: green },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  toggle: {
    color: green,
    backgroundColor: "#E8F1E8",
    overflow: "hidden",
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 7,
    fontSize: 8,
    fontWeight: "900",
  },
  noticeRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: "#F0F1EB",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: yellow,
    marginTop: 4,
  },
  dotRead: { backgroundColor: "#D9DFD8" },
  time: { color: muted, fontSize: 9, marginTop: 4 },
  label: { color: muted, fontSize: 9, fontWeight: "900", marginTop: 4 },
  input: {
    backgroundColor: ivory,
    borderColor: "#E7EAE2",
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 12,
    height: 43,
    color: ink,
    fontSize: 12,
  },
  memory: { backgroundColor: green, borderRadius: 17, padding: 18, gap: 11 },
  memoryBrand: {
    color: yellow,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  memoryTitle: {
    color: ivory,
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 28,
  },
  memoryDate: { color: "#D1DED3", fontSize: 10 },
  rule: { height: 1, backgroundColor: "#466354", marginVertical: 2 },
  memoryLine: { color: ivory, fontSize: 11, fontWeight: "700" },
  stop: {
    borderWidth: 1,
    borderColor: "#E8EBE3",
    borderRadius: 15,
    overflow: "hidden",
  },
  stopHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F7F8F2",
    padding: 12,
  },
  number: {
    width: 28,
    height: 28,
    backgroundColor: yellow,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: { color: green, fontWeight: "900" },
  detail: { padding: 13 },
  toast: { backgroundColor: green, borderRadius: 13, padding: 13 },
  toastText: { color: "white", fontWeight: "700", fontSize: 11 },
  foot: { textAlign: "center", color: muted, fontSize: 9, lineHeight: 14 },
});
