import { useEffect, useState } from "react";
import { Link, router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import {
  deleteNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/actions/tripActions";
import { AppIcon } from "@/components/app-icon";
import { AppText } from "@/components/app-text";
import { BottomBar, C, Header, Page, SectionTitle, Surface } from "@/components/app-ui";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { tripsService } from "@/services/tripsService";

export default function Notifications() {
  const dispatch = useAppDispatch();
  const { notifications, error, requestStatus } = useAppSelector((state) => state.trips);
  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const [selectedDetail, setSelectedDetail] = useState("");

  useEffect(() => {
    void dispatch(fetchNotifications());
  }, [dispatch]);

  async function openNotification(id: string, read: boolean, data: Record<string, unknown> | null) {
    try { const detail = await tripsService.fetchNotification(id); setSelectedDetail(`${detail.title} · ${detail.category} · ${detail.created_at}`); } catch { setSelectedDetail("Le détail de cette notification n’a pas pu être chargé."); }
    if (!read) await dispatch(markNotificationRead(id));
    const href = data?.href;
    if (typeof href === "string" && href.startsWith("/")) router.push(href as never);
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.cream }}>
      <Page>
        <Header
          title="Notifications"
          right={unreadCount > 0 ? (
            <Pressable onPress={() => void dispatch(markAllNotificationsRead())} accessibilityRole="button" accessibilityLabel="Tout marquer comme lu">
              <AppText style={styles.markAll}>Tout lire</AppText>
            </Pressable>
          ) : undefined}
        />
        <AppText style={styles.heading}>À ne pas manquer.</AppText>
        <AppText style={styles.subtitle}>Les nouvelles de ta bande et de tes voyages.</AppText>
        <Link href="/activity" style={styles.activityLink}>Voir le fil du groupe →</Link>
        <SectionTitle title="Tes notifications" action={`${unreadCount} non lue(s)`} />
        {!!error && <AppText style={styles.error}>{error}</AppText>}
        {!!selectedDetail && <Surface><AppText style={styles.body}>{selectedDetail}</AppText></Surface>}
        {notifications.map((notification) => (
          <Pressable key={notification.id} onPress={() => void openNotification(notification.id, notification.read, notification.data)}>
            <Surface style={[styles.note, !notification.read && styles.unread]}>
              <View style={[styles.icon, { backgroundColor: notification.read ? "#F0F2EC" : "#E8EFDD" }]}>
                <AppIcon name="group" size={18} color={C.green} />
              </View>
              <View style={styles.copy}>
                <AppText style={styles.title}>{notification.title}</AppText>
                <AppText style={styles.body}>{notification.message || notification.body}</AppText>
                <AppText style={styles.time}>{notification.time ?? new Date(notification.created_at).toLocaleString()}</AppText>
              </View>
              {!notification.read && <View style={styles.dot} />}
              <Pressable onPress={() => void dispatch(deleteNotification(notification.id))} accessibilityRole="button" accessibilityLabel="Supprimer cette notification" style={styles.delete}>
                <AppText style={styles.deleteText}>×</AppText>
              </Pressable>
            </Surface>
          </Pressable>
        ))}
        {requestStatus === "loading" && notifications.length === 0 && <AppText style={styles.body}>Chargement…</AppText>}
        {requestStatus !== "loading" && !error && notifications.length === 0 && (
          <Surface style={styles.empty}><AppIcon name="bell" size={26} /><AppText style={styles.title}>Aucune notification</AppText><AppText style={styles.body}>Les nouvelles de tes groupes apparaîtront ici.</AppText></Surface>
        )}
        <Link href="/settings" style={styles.activityLink}>Gérer mes préférences de notification ›</Link>
      </Page>
      <BottomBar active="notifications" />
    </View>
  );
}
const styles = StyleSheet.create({
  heading: { fontSize: 27, fontWeight: "900", color: C.ink },
  subtitle: { fontSize: 11, color: C.muted },
  markAll: { fontSize: 10, color: C.green, fontWeight: "900" },
  activityLink: { textAlign: "center", padding: 12, fontSize: 11, color: C.green, fontWeight: "800" },
  note: { flexDirection: "row", alignItems: "flex-start", gap: 11, padding: 13 },
  unread: { borderWidth: 1, borderColor: "#D9E6CB" },
  icon: { width: 39, height: 39, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  copy: { flex: 1, gap: 4 },
  title: { fontSize: 12, fontWeight: "800", color: C.ink },
  body: { fontSize: 11, color: C.muted, lineHeight: 16 },
  time: { fontSize: 9, color: "#9AA39A" },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.green, marginTop: 4 },
  delete: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  deleteText: { fontSize: 18, color: C.muted },
  empty: { alignItems: "center", gap: 8, padding: 20 },
  error: { color: "#A7493C", fontSize: 11, fontWeight: "800" },
});
