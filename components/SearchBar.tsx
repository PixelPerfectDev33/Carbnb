import { View, TextInput, StyleSheet } from "react-native";
import { useThemeContext } from "@/context/ThemeContext";

export default function SearchBar({ placeholder }: { placeholder: string }) {
  const { theme } = useThemeContext();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme === "dark" ? "#222" : "#f5f5f5" },
      ]}
    >
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={theme === "dark" ? "#aaa" : "#666"}
        style={[styles.input, { color: theme === "dark" ? "#fff" : "#000" }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    padding: 10,
  },
  input: {
    fontSize: 16,
  },
});
