import { useEffect } from "react";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { logoutAccount } from "@/actions/authActions";
import { AppIcon } from "@/components/app-icon";
import { AppText } from "@/components/app-text";
import { BottomBar, C, Header, Page, SectionTitle, Surface } from "@/components/app-ui";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";

const rows = [
	["group", "Mon cercle d’amis", "Créer un groupe et inviter tes proches", "/circles"],
	["♙", "Mon compte", "Nom, e-mail et pays", "/account"],
	["shield", "Sécurité du compte", "Mot de passe, double authentification et sessions", "/security"],
	["♡", "Voyages enregistrés", "Tes idées pour plus tard", "/my-trips"],
	["◈", "Langue et devise", "Français · XOF (FCFA)", "/settings"],
	["?", "Centre d’aide", "Questions et assistance", "/settings"],
] as const;

export default function Profile() {
	const dispatch = useAppDispatch();
	const { user, isBootstrapping } = useAppSelector((state) => state.auth);

	useEffect(() => {
		if (!isBootstrapping && !user) {
			router.replace("/login");
		}
	}, [isBootstrapping, user]);

	if (!user) {
		return <Page><AppText style={styles.subtitle}>Chargement du profil…</AppText></Page>;
	}

	async function logout() {
		await dispatch(logoutAccount());
		router.replace("/login");
	}

	return (
		<View style={{ flex: 1, backgroundColor: C.cream }}>
			<Page>
				<Header title="Mon profil" right={<Pressable onPress={() => router.push("/settings")}><AppIcon name="settings" size={19} /></Pressable>} />
				<AppText style={styles.greeting}>Salut, {user.first_name}</AppText>
				<AppText style={styles.subtitle}>{user.email_verified ? "Adresse e-mail vérifiée" : "Adresse e-mail à vérifier"}</AppText>
				<Surface style={styles.profile}>
					<View style={styles.avatar}><AppText style={styles.avatarText}>{user.first_name.charAt(0).toUpperCase()}</AppText></View>
					<View style={{ flex: 1 }}>
						<AppText style={styles.name}>{user.first_name} {user.last_name}</AppText>
						<AppText style={styles.subtitle}>{user.email}</AppText>
						<AppText style={styles.subtitle}>{user.country || "Pays non renseigné"}</AppText>
					</View>
					<Pressable onPress={() => router.push("/account")}><AppText style={styles.link}>Modifier ›</AppText></Pressable>
				</Surface>
				<SectionTitle title="Sécurité du compte" />
				<View style={styles.stats}>
					<View style={styles.stat}><AppText style={styles.statNum}>{user.two_factor_enabled ? "Activée" : "Désactivée"}</AppText><AppText style={styles.subtitle}>Double authentification</AppText></View>
					<View style={styles.stat}><AppText style={styles.statNum}>{user.phone_verified ? "Vérifié" : "Non vérifié"}</AppText><AppText style={styles.subtitle}>Téléphone</AppText></View>
				</View>
				<SectionTitle title="Préférences et compte" />
				{rows.map(([icon, title, subtitle, path]) => (
					<Pressable key={title} onPress={() => router.push(path as never)}>
						<Surface style={styles.row}>
							<View style={styles.icon}><AppIcon name={icon} size={19} color={C.green} /></View>
							<View style={{ flex: 1 }}><AppText style={styles.rowTitle}>{title}</AppText><AppText style={styles.subtitle}>{subtitle}</AppText></View>
							<AppText style={styles.arrow}>›</AppText>
						</Surface>
					</Pressable>
				))}
				<Pressable style={styles.logout} onPress={() => void logout()}>
					<AppText style={styles.logoutText}>Se déconnecter</AppText>
				</Pressable>
				<AppText style={styles.foot}>Amivoy · version 1.0</AppText>
			</Page>
			<BottomBar active="profile" />
		</View>
	);
}

const styles = StyleSheet.create({
	greeting: { fontSize: 28, fontWeight: "900", color: C.ink },
	subtitle: { fontSize: 11, color: C.muted, marginTop: 4 },
	profile: { flexDirection: "row", alignItems: "center", gap: 13 },
	avatar: { width: 51, height: 51, borderRadius: 18, backgroundColor: "#DDE8D4", alignItems: "center", justifyContent: "center" },
	avatarText: { fontSize: 25, fontWeight: "900", color: C.green },
	name: { fontSize: 15, fontWeight: "900", color: C.ink, marginBottom: 2 },
	link: { color: C.green, fontSize: 10, fontWeight: "900" },
	stats: { flexDirection: "row", justifyContent: "space-around", backgroundColor: C.white, borderRadius: 12, padding: 14 },
	stat: { alignItems: "center", gap: 4 },
	statNum: { fontSize: 13, fontWeight: "900", color: C.green },
	row: { flexDirection: "row", alignItems: "center", gap: 11, padding: 12 },
	icon: { width: 38, height: 38, borderRadius: 13, backgroundColor: "#F1F4EB", alignItems: "center", justifyContent: "center" },
	rowTitle: { fontSize: 12, fontWeight: "800", color: C.ink, marginBottom: 3 },
	arrow: { color: "#A0AAA1", fontSize: 19 },
	logout: { alignItems: "center", padding: 12 },
	logoutText: { fontSize: 12, color: "#AE6B59", fontWeight: "800" },
	foot: { textAlign: "center", fontSize: 9, color: "#A0AAA1" },
});
