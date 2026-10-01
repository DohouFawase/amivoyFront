import { AppIcon } from "@/components/app-icon";
import { AppText } from "@/components/app-text";
import { C, Header, Page, SectionTitle, Surface } from "@/components/app-ui";
import { useAppSelector } from "@/hooks/redux";
import { tripsService } from "@/services/tripsService";
import type {
  BookingRecord,
  ServiceRecord,
  TripMemberRecord,
} from "@/interface/trips";
import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

const filters = ["Tout", "Hébergement", "Restaurant", "Activité", "Transport"];
export default function Services() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAppSelector((state) => state.auth.user);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [members, setMembers] = useState<TripMemberRecord[]>([]);
  const [filter, setFilter] = useState("Tout");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [bookingQuantity, setBookingQuantity] = useState(1);
  const member = members.find(
    (item) => item.user_id === user?.id && item.status === "active",
  );

  useEffect(() => {
    let active = true;
    Promise.all([
      tripsService.fetchServices(),
      tripsService.fetchBookings(id),
      tripsService.fetchTripMembers(id),
    ])
      .then(([loadedServices, loadedBookings, loadedMembers]) => {
        if (active) {
          setServices(loadedServices);
          setBookings(loadedBookings);
          setMembers(loadedMembers);
          setError("");
        }
      })
      .catch(() => {
        if (active) setError("Le catalogue n’a pas pu être chargé.");
      });
    return () => {
      active = false;
    };
  }, [id]);

  const visible = useMemo(
    () =>
      filter === "Tout"
        ? services
        : services.filter((item) =>
            item.category
              ?.toLocaleLowerCase()
              .includes(filter.toLocaleLowerCase()),
          ),
    [filter, services],
  );

  async function reserve(service: ServiceRecord) {
    if (!member) {
      setError(
        "Ton compte doit être membre actif du voyage pour envoyer une demande.",
      );
      return;
    }
    if (busyId) return;
    setBusyId(service.id);
    try {
      const booking = await tripsService.createBooking({
        trip_id: id,
        service_id: service.id,
        booked_by: member.id,
        quantity: 1,
        total_amount: service.price,
        status: "requested",
      });
      setBookings((current) => [booking, ...current]);
      setError("");
    } catch {
      setError("La demande n’a pas pu être enregistrée.");
    } finally {
      setBusyId(null);
    }
  }

  async function editBooking(booking: BookingRecord) {
    setBusyId(booking.id);
    try {
      const detail = await tripsService.fetchBooking(booking.id);
      setEditingBookingId(detail.id);
      setBookingQuantity(detail.quantity);
      setError("");
    } catch {
      setError("Le détail de la demande n’a pas pu être chargé.");
    } finally {
      setBusyId(null);
    }
  }

  async function saveBooking(booking: BookingRecord, service: ServiceRecord) {
    if (bookingQuantity < 1 || !Number.isInteger(bookingQuantity)) {
      setError("La quantité doit être au moins égale à un.");
      return;
    }
    setBusyId(booking.id);
    try {
      const updated = await tripsService.updateBooking(booking.id, {
        quantity: bookingQuantity,
        total_amount: bookingQuantity * service.price,
      });
      setBookings((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setEditingBookingId(null);
      setError("");
    } catch {
      setError("La demande n’a pas pu être modifiée.");
    } finally {
      setBusyId(null);
    }
  }

  async function cancel(booking: BookingRecord) {
    try {
      await tripsService.deleteBooking(booking.id);
      setBookings((current) =>
        current.filter((item) => item.id !== booking.id),
      );
    } catch {
      setError("La demande ne peut pas être annulée pour le moment.");
    }
  }

  return (
    <Page>
      <Header back title="Logements et bonnes adresses" />
      <AppText style={st.heading}>Trouvons les bonnes adresses.</AppText>
      <AppText style={st.sub}>
        Catalogue de services disponible dans Amivoy. Une demande ne confirme
        pas une réservation et aucun paiement n’est effectué.
      </AppText>
      <View style={st.filters}>
        {filters.map((item) => (
          <Pressable
            key={item}
            onPress={() => setFilter(item)}
            style={[st.filter, filter === item && st.filterOn]}
          >
            <AppText
              style={[st.filterText, filter === item && st.filterTextOn]}
            >
              {item}
            </AppText>
          </Pressable>
        ))}
      </View>
      {!!error && (
        <AppText accessibilityRole="alert" style={st.error}>
          {error}
        </AppText>
      )}
      <SectionTitle title="Services disponibles" action={`${visible.length}`} />
      {visible.map((service) => {
        const existing = bookings.find(
          (booking) => booking.service_id === service.id,
        );
        return (
          <Surface key={service.id} style={st.card}>
            <View style={st.top}>
              <AppIcon name={service.icon || "pin"} size={24} />
              <View style={{ flex: 1 }}>
                <AppText style={st.kind}>
                  {(service.category || "Service").toLocaleUpperCase()}
                </AppText>
                <AppText style={st.name}>
                  {service.title || service.name || "Service"}
                </AppText>
              </View>
              {service.rating !== null && (
                <AppText style={st.rating}>★ {service.rating}/5</AppText>
              )}
            </View>
            {!!service.description && (
              <AppText style={st.sub}>{service.description}</AppText>
            )}
            <View style={st.bottom}>
              <AppText style={st.price}>
                {service.price.toLocaleString("fr-FR")} {service.currency}
              </AppText>
              {existing ? (
                <View style={st.bookingBox}>
                  {editingBookingId === existing.id ? (
                    <View style={st.bookingEdit}>
                      <View style={st.quantityRow}>
                        <Pressable
                          onPress={() =>
                            setBookingQuantity((value) =>
                              Math.max(1, value - 1),
                            )
                          }
                        >
                          <AppText style={st.manageText}>−</AppText>
                        </Pressable>
                        <AppText style={st.bookingText}>
                          {bookingQuantity}
                        </AppText>
                        <Pressable
                          onPress={() =>
                            setBookingQuantity((value) => value + 1)
                          }
                        >
                          <AppText style={st.manageText}>＋</AppText>
                        </Pressable>
                      </View>
                      <AppText style={st.bookingText}>
                        Total :{" "}
                        {(bookingQuantity * service.price).toLocaleString(
                          "fr-FR",
                        )}{" "}
                        {service.currency}
                      </AppText>
                      <Pressable
                        disabled={busyId === existing.id}
                        onPress={() => void saveBooking(existing, service)}
                      >
                        <AppText style={st.manageText}>
                          {busyId === existing.id
                            ? "Enregistrement…"
                            : "Enregistrer"}
                        </AppText>
                      </Pressable>
                      <Pressable onPress={() => setEditingBookingId(null)}>
                        <AppText style={st.cancel}>
                          Annuler la modification
                        </AppText>
                      </Pressable>
                    </View>
                  ) : (
                    <>
                      <AppText style={st.bookingText}>
                        Demande · {existing.status || "enregistrée"} ·{" "}
                        {existing.quantity} ×
                      </AppText>
                      <Pressable
                        disabled={busyId === existing.id}
                        onPress={() => void editBooking(existing)}
                      >
                        <AppText style={st.manageText}>
                          Détails / modifier
                        </AppText>
                      </Pressable>
                      <Pressable onPress={() => void cancel(existing)}>
                        <AppText style={st.cancel}>Annuler la demande</AppText>
                      </Pressable>
                    </>
                  )}
                </View>
              ) : (
                <Pressable
                  disabled={busyId === service.id}
                  onPress={() => void reserve(service)}
                  style={st.button}
                >
                  <AppText style={st.buttonText}>
                    {busyId === service.id ? "Envoi…" : "Demander"}
                  </AppText>
                </Pressable>
              )}
            </View>
          </Surface>
        );
      })}
      {!visible.length && !error && (
        <Surface style={st.empty}>
          <AppText style={st.name}>
            {services.length
              ? "Aucun service dans cette catégorie."
              : "Aucun service n’est encore publié."}
          </AppText>
          <AppText style={st.sub}>
            {services.length
              ? "Choisis un autre filtre."
              : "Le catalogue se remplira quand des partenaires auront publié leurs offres."}
          </AppText>
        </Surface>
      )}
      <Surface style={st.notice}>
        <AppText style={st.noticeTitle}>Ton programme</AppText>
        <AppText style={st.sub}>
          Ajoute les étapes et activités du parcours dans l’itinéraire du
          voyage.
        </AppText>
        <Link
          href={{ pathname: "/trip/[id]/itinerary", params: { id } } as never}
          style={st.link}
        >
          Ouvrir l’itinéraire →
        </Link>
      </Surface>
    </Page>
  );
}
const st = StyleSheet.create({
  heading: { fontSize: 26, fontWeight: "900", color: C.ink, lineHeight: 32 },
  sub: { fontSize: 11, color: C.muted, lineHeight: 16 },
  filters: { flexDirection: "row", gap: 7, flexWrap: "wrap" },
  filter: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 13,
    backgroundColor: C.white,
  },
  filterOn: { backgroundColor: C.green },
  filterText: { fontSize: 9, fontWeight: "800", color: C.muted },
  filterTextOn: { color: C.white },
  card: { gap: 9, padding: 13 },
  top: { flexDirection: "row", alignItems: "center", gap: 10 },
  kind: { fontSize: 8, fontWeight: "900", letterSpacing: 1, color: C.green },
  name: { fontSize: 12, fontWeight: "900", color: C.ink, marginTop: 3 },
  rating: { fontSize: 9, color: "#B88132", fontWeight: "900" },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 3,
  },
  price: { fontSize: 11, fontWeight: "900", color: C.ink, flex: 1 },
  button: {
    backgroundColor: C.green,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: { fontSize: 10, color: C.white, fontWeight: "900" },
  bookingBox: { alignItems: "flex-end", gap: 5 },
  bookingEdit: { alignItems: "flex-end", gap: 6 },
  quantityRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  manageText: { color: C.green, fontSize: 9, fontWeight: "900" },
  bookingText: { fontSize: 9, color: C.green, fontWeight: "900" },
  cancel: { fontSize: 9, color: "#A7493C", fontWeight: "800" },
  empty: { gap: 7 },
  notice: { gap: 7, backgroundColor: "#EEF3E9" },
  noticeTitle: { fontSize: 12, fontWeight: "900", color: C.ink },
  link: { color: C.green, fontSize: 10, fontWeight: "900" },
  error: { color: "#A7493C", fontSize: 11, fontWeight: "800" },
});
