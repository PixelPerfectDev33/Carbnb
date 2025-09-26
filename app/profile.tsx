import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { useThemeContext } from "@/context/ThemeContext";
import { useI18n } from "@/context/I18nContext";
import BottomNav from "@/components/BottomNav";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Profile() {
  const { theme } = useThemeContext();
  const { t } = useI18n();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme === "dark" ? "#000" : "#fff" },
      ]}
    >
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 🧑 Profile avatar */}
        <View style={styles.profileHeader}>
          <Image
            source={{
              uri: "https://i.imgur.com/4ZQZ6pO.png", // placeholder avatar
            }}
            style={styles.avatar}
          />
          <Text
            style={[
              styles.username,
              { color: theme === "dark" ? "#fff" : "#000" },
            ]}
          >
            {t("profileNamePlaceholder")}
          </Text>
          <Text
            style={[
              styles.email,
              { color: theme === "dark" ? "#aaa" : "#555" },
            ]}
          >
            user@email.com
          </Text>
        </View>

        {/* ⚙️ Settings */}
        <View style={styles.settings}>
          <Text
            style={[
              styles.sectionTitle,
              { color: theme === "dark" ? "#fff" : "#000" },
            ]}
          >
            {t("settings")}
          </Text>

          <ThemeToggle />
          <LanguageSwitcher />
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 50 },
  scrollContent: { paddingBottom: 80 },
  profileHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  username: { fontSize: 20, fontWeight: "600" },
  email: { fontSize: 14, marginBottom: 20 },
  settings: { marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
});
