import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useAppSelector } from "@/hooks/redux";

export default function Index() {
  const { isBootstrapping, user } = useAppSelector((state) => state.auth);

  if (isBootstrapping) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FCFBF7" }}>
        <ActivityIndicator color="#133B2C" />
      </View>
    );
  }

  return <Redirect href={user ? "/home" : "/onboarding"} />;
}
