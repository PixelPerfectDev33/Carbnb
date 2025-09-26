import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { ThemeProvider } from "@/context/ThemeContext";
import { I18nProvider } from "@/context/I18nContext";

export default function RootLayout() {
  const scheme = useColorScheme(); // system light/dark

  return (
    <ThemeProvider defaultScheme={scheme}>
      <I18nProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </I18nProvider>
    </ThemeProvider>
  );
}
