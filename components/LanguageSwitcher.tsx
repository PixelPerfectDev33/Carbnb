// components/LanguageSwitcher.tsx
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useI18n } from "@/context/I18nContext";

export default function LanguageSwitcher() {
  const { currentLang, changeLanguage } = useI18n();

  const toggleLanguage = () => {
    changeLanguage(currentLang === "en" ? "ar" : "en");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleLanguage} style={styles.button}>
        <Text style={styles.text}>
          {currentLang === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20 },
  button: {
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 8,
    alignItems: "center",
  },
  text: { color: "#fff", fontWeight: "600" },
});
