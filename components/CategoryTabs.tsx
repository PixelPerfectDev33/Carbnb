import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  I18nManager,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useThemeContext } from "@/context/ThemeContext";
import { useI18n } from "@/context/I18nContext";

type Category = {
  label: string;
  icon?: string;
};

export default function CategoryTabs({
  categories,
}: {
  categories: Category[];
}) {
  const { theme } = useThemeContext();
  const [active, setActive] = useState(0);
  const { currentLang } = useI18n();
  const isRTL = currentLang === "ar";

  return (
    <View style={styles.container}>
      {categories.map((cat, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.tab,
            active === index && {
              borderBottomColor: theme === "dark" ? "#fff" : "#000",
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActive(index)}
        >
          {cat.icon && (
            <Ionicons
              name={cat.icon as any}
              size={16}
              color={theme === "dark" ? "#fff" : "#000"}
              style={[styles.icon, I18nManager.isRTL && styles.iconRTL]}
            />
          )}
          <Text
            style={[styles.text, { color: theme === "dark" ? "#fff" : "#000" }]}
          >
            {cat.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginHorizontal: 16,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
    paddingVertical: 8,
  },
  icon: {
    marginRight: 6,
  },
  iconRTL: {
    // Additional RTL-specific icon styles if needed
  },
  text: {
    textAlign: "left",
  },
});
