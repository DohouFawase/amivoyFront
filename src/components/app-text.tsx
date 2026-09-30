import { ReactNode } from "react";
import { StyleProp, StyleSheet, Text as NativeText, TextInput as NativeTextInput, TextInputProps, TextProps, TextStyle } from "react-native";

type AppTextProps = TextProps & { children?: ReactNode };

export function AppText({ style, children, ...props }: AppTextProps) {
  const textStyle = StyleSheet.flatten(style as StyleProp<TextStyle>);
  const weight = Number(textStyle?.fontWeight ?? 400);
  const size = Number(textStyle?.fontSize ?? 14);
  const display = size >= 17 && weight >= 700;
  const fontFamily = textStyle?.fontFamily ?? (display
    ? "CabinetGrotesk-Bold"
    : weight >= 700
      ? "Inter_700Bold"
      : weight >= 600
        ? "Inter_600SemiBold"
        : weight >= 500
          ? "Inter_500Medium"
          : "Inter_400Regular");
  return <NativeText {...props} style={[style, { fontFamily }]}>{children}</NativeText>;
}

export function AppTextInput({ style, ...props }: TextInputProps) {
  const inputStyle = StyleSheet.flatten(style);
  return <NativeTextInput {...props} style={[style, { fontFamily: inputStyle?.fontFamily ?? "Inter_400Regular" }]} />;
}
