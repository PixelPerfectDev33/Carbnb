import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { ThemeProvider } from "@/context/ThemeContext";
import { I18nProvider } from "@/context/I18nContext";
import { useFonts } from 'expo-font'; 
import { AuthProvider } from "@/context/AuthContext";

// 1. Import all required Noto Sans weights
import {
    NotoSans_400Regular,
    NotoSans_500Medium,
    NotoSans_700Bold,
    NotoSans_900Black,
} from '@expo-google-fonts/noto-sans';

// 2. Import all required Noto Sans Arabic weights (RTL)
import {
    NotoSansArabic_400Regular,
    NotoSansArabic_500Medium,
    NotoSansArabic_700Bold,
} from '@expo-google-fonts/noto-sans-arabic';

// 3. Import all required Plus Jakarta Sans weights
import {
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';

export default function RootLayout() {
  const scheme = useColorScheme();
  const [loaded, error] = useFonts({
      // --- Noto Sans Mappings ---
      'NotoSans-Regular': NotoSans_400Regular,
      'NotoSans-Medium': NotoSans_500Medium,
      'NotoSans-Bold': NotoSans_700Bold,
      'NotoSans-Black': NotoSans_900Black,

      // --- Noto Sans Arabic Mappings (RTL) ---
      'NotoSansArabic-Regular': NotoSansArabic_400Regular,
      'NotoSansArabic-Medium': NotoSansArabic_500Medium,
      'NotoSansArabic-Bold': NotoSansArabic_700Bold,

      // --- Plus Jakarta Sans Mappings ---
      'PJS-Regular': PlusJakartaSans_400Regular,
      'PJS-Medium': PlusJakartaSans_500Medium,
      'PJS-Bold': PlusJakartaSans_700Bold,
      'PJS-ExtraBold': PlusJakartaSans_800ExtraBold,
  });

  // Handle loading state (often using a SplashScreen, omitted here for brevity)
  if (!loaded) {
      return null; 
  }

  return (
    <AuthProvider>
    <ThemeProvider defaultScheme={scheme}>
      <I18nProvider>
          <Stack 
              screenOptions={{ 
                  headerShown: false,
                  animation: 'none', // 👈 This disables the sliding animation
              }} 
          />
      </I18nProvider>
    </ThemeProvider>
    </AuthProvider>
  );
}