import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useThemeContext } from "@/context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeContext();

  return (
    <TouchableOpacity style={styles.button} onPress={toggleTheme}>
      <Text style={styles.text}>
        {theme === "dark" ? "☀️ Switch to Light" : "🌙 Switch to Dark"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
  },
});
