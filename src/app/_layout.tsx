import "@/global.css";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, type ErrorBoundaryProps } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { useFonts } from "expo-font";
import { ReduxProvider } from "@/providers/ReduxProvider";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { bootstrapAuth } from "@/actions/authActions";
import { useEffect } from "react";

export const unstable_settings = {
  screenErrorBoundary: ScreenErrorBoundary,
};

function ScreenErrorBoundary({ retry }: ErrorBoundaryProps) {
  return (
    <View style={styles.errorContainer}>
      <Text accessibilityRole="header" style={styles.errorTitle}>Cette page n’a pas pu s’afficher.</Text>
      <Text style={styles.errorMessage}>Réessaie dans un instant. Tes autres pages restent accessibles.</Text>
      <Pressable accessibilityRole="button" onPress={() => void retry()} style={styles.retryButton}>
        <Text style={styles.retryButtonText}>Réessayer</Text>
      </Pressable>
    </View>
  );
}

SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  const scheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular: require("@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf"),
    Inter_500Medium: require("@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf"),
    Inter_600SemiBold: require("@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf"),
    Inter_700Bold: require("@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf"),
    "CabinetGrotesk-Bold": require("../../assets/fonts/CabinetGrotesk-Bold.ttf"),
  });
  if (!fontsLoaded && !fontError) return null;
  return (
    <ReduxProvider>
      <ThemeProvider value={scheme === "dark" ? DarkTheme : DefaultTheme}>
        <StatusBar style="dark" hidden={false} />
        <AnimatedSplashOverlay />
        <RootNavigator />
      </ThemeProvider>
    </ReduxProvider>
  );
}

function RootNavigator() {
  const dispatch = useAppDispatch();
  const { user, isBootstrapping } = useAppSelector((state) => state.auth);

  useEffect(() => {
    void dispatch(bootstrapAuth());
  }, [dispatch]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#FCFBF7" },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="invite/[code]" />
      <Stack.Protected guard={!isBootstrapping && !user}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="verify-email" />
        <Stack.Screen name="forgot-password" />
      </Stack.Protected>
      <Stack.Protected guard={!isBootstrapping && !!user}>
        <Stack.Screen name="account" />
        <Stack.Screen name="activity" />
        <Stack.Screen name="circles" />
        <Stack.Screen name="create-outing" />
        <Stack.Screen name="create-trip" />
        <Stack.Screen name="create" />
        <Stack.Screen name="demo-features" />
        <Stack.Screen name="explore" />
        <Stack.Screen name="home" />
        <Stack.Screen name="map" />
        <Stack.Screen name="memories" />
        <Stack.Screen name="memories/[id]" />
        <Stack.Screen name="memories/outing-card" />
        <Stack.Screen name="my-trips" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="outing/[id]" />
        <Stack.Screen name="outings" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="security" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="trip/[id]/budget" />
        <Stack.Screen name="trip/[id]/index" />
        <Stack.Screen name="trip/[id]/itinerary" />
        <Stack.Screen name="trip/[id]/journal" />
        <Stack.Screen name="trip/[id]/packing" />
        <Stack.Screen name="trip/[id]/planning" />
        <Stack.Screen name="trip/[id]/safety" />
        <Stack.Screen name="trip/[id]/services" />
      </Stack.Protected>
    </Stack>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    backgroundColor: "#FCFBF7",
  },
  errorTitle: { color: "#133B2C", fontSize: 18, fontWeight: "700", textAlign: "center" },
  errorMessage: { color: "#66736D", fontSize: 14, lineHeight: 21, textAlign: "center" },
  retryButton: { marginTop: 8, borderRadius: 12, backgroundColor: "#133B2C", paddingHorizontal: 20, paddingVertical: 12 },
  retryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
});
