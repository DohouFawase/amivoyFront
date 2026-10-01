import type { TextInputProps } from "react-native";
import { StyleSheet } from "react-native";
import { AppText, AppTextInput } from "@/components/app-text";
import { C } from "@/components/app-ui";

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function AuthInput({ label, error, style, ...props }: AuthInputProps) {
  return (
    <>
      <AppText style={styles.label}>{label}</AppText>
      <AppTextInput {...props} style={[styles.input, style]} />
      {!!error && <AppText style={styles.error}>{error}</AppText>}
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    color: C.muted,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 3,
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    backgroundColor: C.white,
    color: C.ink,
    paddingHorizontal: 12,
  },
  error: {
    color: "#A7493C",
    fontSize: 10,
    fontWeight: "700",
  },
});