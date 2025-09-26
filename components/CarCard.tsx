import { View, Text, Image, StyleSheet } from "react-native";
import { useThemeContext } from "@/context/ThemeContext";
import { useI18n } from "@/context/I18nContext";

export default function CarCard({ car }: { car: any }) {
  const { theme } = useThemeContext();
  const { currentLang } = useI18n();
  const isRTL = currentLang === 'ar';

  return (
    <View style={[styles.card, isRTL && styles.cardRTL]}>
      <Image source={{ uri: car.image }} style={styles.image} />
      <Text
        style={[
          styles.title,
          { color: theme === "dark" ? "#fff" : "#000" },
          isRTL && styles.textRight,
        ]}
      >
        {car.name}
      </Text>
      <Text style={[{ color: "#777" }, isRTL && styles.textRight]}>
        ${car.price}/day
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 180,
    marginHorizontal: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 10,
  },
  cardRTL: {
    alignSelf: 'flex-start',
  },
  image: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    resizeMode: "cover",
  },
  title: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  textRight: {
    textAlign: "right",
  },
});