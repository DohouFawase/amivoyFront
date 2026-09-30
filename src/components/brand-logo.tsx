import { AppIcon } from "@/components/app-icon";
import { AppText } from "@/components/app-text";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

export function BrandLogo({
  compact = false,
  inverse = false,
  style,
}: {
  compact?: boolean;
  inverse?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const markSize = compact ? 24 : 34;
  return (
    <View style={[styles.brand, style]}>
      <View
        style={[
          styles.mark,
          { width: markSize, height: markSize, borderRadius: compact ? 8 : 11 },
        ]}
      >
        <AppIcon name="✳" size={compact ? 14 : 17} color="#FFFFFF" />
      </View>
      <AppText
        style={[
          styles.wordmark,
          compact && styles.wordmarkCompact,
          inverse && styles.wordmarkInverse,
        ]}
      >
        AMIVOY
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { flexDirection: "row", alignItems: "center", gap: 9 },
  mark: {
    backgroundColor: "#133B2C",
    alignItems: "center",
    justifyContent: "center",
  },
  wordmark: {
    color: "#133B2C",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  wordmarkCompact: { fontSize: 16, fontWeight: "800", letterSpacing: -0.5 },
  wordmarkInverse: { color: "#FCFBF7" },
});
