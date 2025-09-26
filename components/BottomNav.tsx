import { View, TouchableOpacity, Text, StyleSheet, I18nManager } from "react-native";
import { useRouter, usePathname } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useThemeContext } from "@/context/ThemeContext";
import { useI18n } from "@/context/I18nContext";

export default function BottomNav() {
  const { theme } = useThemeContext();
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();

  const items = [
    { label: t("home"), icon: "home-outline", route: "/" },
    { label: t("search"), icon: "search-outline", route: "/search" },
    { label: t("inbox"), icon: "chatbubble-outline", route: "/inbox" },
    { label: t("profile"), icon: "person-outline", route: "/profile" },
  ];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme === "dark" ? "#111" : "#eee" },
      ]}
    >
      {items.map((item) => (
        <TouchableOpacity
          key={item.route}
          style={[
            styles.item,
            I18nManager.isRTL && styles.itemRTL // Additional RTL styling if needed
          ]}
          onPress={() => router.push(item.route)}
        >
          <Ionicons
            name={item.icon}
            size={22}
            color={
              pathname === item.route
                ? "#007AFF"
                : theme === "dark"
                  ? "#fff"
                  : "#000"
            }
          />
          <Text
            style={[
              styles.label,
              {
                color:
                  pathname === item.route
                    ? "#007AFF"
                    : theme === "dark"
                      ? "#fff"
                      : "#000",
              }
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row", // Reverse for RTL
    justifyContent: "space-around",
    paddingVertical: 10,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  item: { 
    alignItems: "center",
    justifyContent: "center",
    flex: 1, // Ensure equal spacing
  },
  itemRTL: {
    // Additional RTL-specific styling if needed
  },
  label: {
    fontSize: 12,
    marginTop: 2, // Space between icon and text
    textAlign: I18nManager.isRTL ? 'right' : 'left', // Text alignment for RTL
  },
});