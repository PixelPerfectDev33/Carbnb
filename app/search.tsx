import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useThemeContext } from "@/context/ThemeContext";
import { useI18n } from "@/context/I18nContext";
import BottomNav from "@/components/BottomNav";

export default function Search() {
  const { theme } = useThemeContext();
  const { t } = useI18n();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme === "dark" ? "#000" : "#fff" },
      ]}
    >
      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[styles.title, { color: theme === "dark" ? "#fff" : "#000" }]}
        >
          🔍 {t("searchPagePlaceholder")}
        </Text>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  scrollContent: {
    paddingBottom: 80, // leave space for BottomNav
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
});
