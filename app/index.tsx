import { ScrollView, View, Text, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useThemeContext } from "@/context/ThemeContext";
import { useI18n } from "@/context/I18nContext";
import SearchBar from "@/components/SearchBar";
import CategoryTabs from "@/components/CategoryTabs";
import CarCard from "@/components/CarCard";
import BottomNav from "@/components/BottomNav";

const cars = [
  {
    id: 1,
    name: "Mercedes-Benz S-Class",
    price: 250,
    image: "https://i.imgur.com/qU1Dp2P.png",
  },
  {
    id: 2,
    name: "BMW 7 Series",
    price: 220,
    image: "https://i.imgur.com/Vm9Fzv1.png",
  },
];

export default function Home() {
  const { theme } = useThemeContext();
  const { t, currentLang } = useI18n();
  const isRTL = currentLang === 'ar';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme === "dark" ? "#000" : "#fff" },
      ]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 🔍 Search */}
        <SearchBar
          placeholder={t("searchPlaceholder")}
          icon={<Ionicons name="search-outline" size={20} color="#888" />}
        />

        {/* 📌 Tabs with icons */}
        <CategoryTabs
          categories={[
            { label: t("luxury"), icon: "car-sport-outline" },
            { label: t("economy"), icon: "cash-outline" },
            { label: t("suv"), icon: "car-outline" },
            { label: t("truck"), icon: "bus-outline" },
          ]}
        />

        {/* 🏷️ Featured */}
        <Text
          style={[
            styles.sectionTitle,
            { color: theme === "dark" ? "#fff" : "#000" },
          ]}
        >
          {t("featured")}
        </Text>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={[isRTL && { transform: [{ scaleX: -1 }] }]}
          contentContainerStyle={[isRTL && { transform: [{ scaleX: -1 }] }]}
        >
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </ScrollView>
      </ScrollView>

      {/* 📍 Bottom Navigation */}
      <BottomNav
        items={[
          { label: t("home"), icon: "home-outline" },
          { label: t("search"), icon: "search-outline" },
          { label: t("inbox"), icon: "chatbubble-outline" },
          { label: t("profile"), icon: "person-outline" },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  sectionTitle: { fontSize: 18, fontWeight: "600", margin: 16 },
});
