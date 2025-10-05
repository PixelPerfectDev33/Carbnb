import { useEffect, useState } from "react";
import { ScrollView, View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useThemeContext } from "@/context/ThemeContext";
import { useI18n } from "@/context/I18nContext";
import SearchBar from "@/components/SearchBar";
import CategoryTabs from "@/components/CategoryTabs";
import CarCard from "@/components/CarCard";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase"; // Assuming this path is correct
import { useRouter } from "expo-router"; // <-- NEW IMPORT
import { useAuth } from "@/context/AuthContext";

// Hardcoded data for "Featured" section
const luxuryCars = [
    {
        id: 1,
        name: "Mercedes-Benz S-Class",
        price: 250,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAbh4xfaHyFESsvhXwnUKdqiszZCYWLWRBpSsakpzPJUvMnA0L58pF8ol7urf7027BLYxZ7-mUGbGlavzIqRZC6K9kumInJNPCxwb7SRAaEBnYIJIQPf7mR5za5J1cBaEVg6jjkHKzNrhFhcgK41XV-TRUNySNNIFXfdWJzB1YxlRdKG22hFBH4zHGDTdAGC03DZnvyu-_K31IyI4l_Tb3aS6Y5CXu28yCYa6Gwos_8OkRqE5eArMt0FVutR7F1l4XnOxARG0p88g4",
    },
    {
        id: 2,
        name: "BMW 7 Series",
        price: 220,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_VCYEF-U7cXu_FVEd7sEIwSH5t67z8bVAEb4HBTOhhPpjurpPQZSUCVG-i0O_nHndaLl-R67lE5DZT5QbYlJbxROFYU8SabOI-OeuzUDLoAowtj6Jz7yNd6G617EZrXcoVj-d33lW0gz8x6Ft-Sk6MR6JUkMG9jOigUpKfO2iyK6dTi4H-2exz496iwNLT7v491xhl4EXwlqNzCviqxnGZVUF7hSDOQVzrkicrRfE5eArMt0FVutR7F1l4XnOxARG0p88g4",
    },
    {
        id: 3,
        name: "Audi A8",
        price: 230,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBRSAYqM8NhuihZUwzLe9YDTJPW-pCWKhP3rxd1HuUqxWq_ER60IP4BrLxS1F-lcAyvSRbQfntu-dwktgBO77sSGHdvSdDU5yLgGh9rouDrFnoN7Ea75K9qi9Iz2a9PYzFOITlu4DnvrJBkv6MG_mwOF4bFWz2x719WimkCCcuGd9pz2t-A0kKqdV_JL_7187goqQGn9zntWtTjPYzTHQPqanxI7Vd2D5QWwkQnDNp47X3DSJJkqaMe3tbINmDyeMCgh3cAmlthcOo",
    },
];

export default function Home() {
    const { theme } = useThemeContext();
    const { t, currentLang } = useI18n();
    const isRTL = currentLang === 'ar';
    const router = useRouter(); // <-- INITIALIZE ROUTER

    // State to hold the full list of mapped cars
    const [fetchedCars, setFetchedCars] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);

    // State for Search Query - now used for navigation trigger only
    const [searchQuery, setSearchQuery] = useState('');


    // New handler: Navigate to the dedicated search page
    const handleSearchSubmit = (query: string) => {
        if (query.trim()) {
            // Navigate to the search results page, passing the query as a URL parameter
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };


    useEffect(() => {
        fetchCarListings();
    }, []);

    // Function to handle navigation to the detail screen
    const handleCarPress = (carId) => {
        // Navigate to the dynamic route /car/[id].tsx
        router.push(`/ima`);
    };

    const fetchCarListings = async () => {
        setIsLoading(true);
        // Fetch all fields needed for the CarCard, and any others you might need later
        const { data, error } = await supabase
            .from('cars')
            .select('id, title, price_per_day, photos, location, tags');

        if (error) {
            console.error("Error fetching cars:", error.message);
            Alert.alert("Data Error", "Could not load car listings.");
        } else if (data && data.length > 0) {

            // Map the Supabase data fields (snake_case) to match the CarCard props (camelCase)
            const mappedData = data.map(car => ({
                id: car.id,
                // Supabase 'title' -> CarCard 'name'
                name: car.title, 
                // Supabase 'price_per_day' (string/numeric) -> CarCard 'price' (number)
                price: parseFloat(car.price_per_day) || 0, 
                // Supabase 'photos' array -> CarCard 'image' (first URL)
                image: (car.photos && car.photos.length > 0) 
                    ? car.photos[0] 
                    : 'https://placehold.co/150x100/CCCCCC/000000?text=No+Image',
            }));

            setFetchedCars(mappedData); 
        } 
        setIsLoading(false);
    };

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme === "dark" ? "#000" : "#fff" },
            ]}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* 🔍 Search and Tabs */}
                <SearchBar
                    placeholder={t("searchPlaceholder")}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={() => handleSearchSubmit(searchQuery)} // <-- NEW PROP
                />

                <CategoryTabs
                    categories={[
                        { label: t("luxury") },
                        { label: t("economy") },
                        { label: t("suv") },
                        { label: t("truck") },
                    ]}
                />

                {/* 🏷️ FIRST SECTION: Hardcoded Featured/Luxury Cars */}
                <Text
                    style={[
                        styles.sectionTitle,
                        { color: theme === "dark" ? "#fff" : "#000" },
                    ]}
                >
                    {t("featured")} (Luxury Picks)
                </Text>

                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={[isRTL && { transform: [{ scaleX: -1 }] }]}
                >
                    {luxuryCars.map((car) => (
                        // WRAPPING WITH TOUCHABLEOPACITY FOR NAVIGATION
                        <TouchableOpacity 
                            key={car.id} 
                            onPress={() => handleCarPress(car.id)}
                            activeOpacity={0.8}
                            style={[isRTL && { transform: [{ scaleX: -1 }] }]}
                        >
                            <CarCard car={car} />
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* 🏷️ SECOND SECTION: All Listings from Supabase */}
                <Text
                    style={[
                        styles.sectionTitle,
                        { color: theme === "dark" ? "#fff" : "#000" },
                    ]}
                >
                    {t("featured")} (Luxury Picks)
                </Text>

                {isLoading ? (
                    <Text style={[styles.loadingText, { color: theme === "dark" ? "#888" : "#333" }]}>
                        Loading all listings...
                    </Text>
                ) : (
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        style={[isRTL && { transform: [{ scaleX: -1 }] }]}
                        
                    >
                        {fetchedCars.length > 0 ? (
                            fetchedCars.map((car) => (
                                // WRAPPING WITH TOUCHABLEOPACITY FOR NAVIGATION
                                <TouchableOpacity 
                                    key={car.id} 
                                    onPress={() => handleCarPress(car.id)}
                                    activeOpacity={0.8}
                                    style={[isRTL && { transform: [{ scaleX: -1 }] }]}
                                >
                                    <CarCard car={car} />
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text style={[styles.noDataText, { color: theme === "dark" ? "#888" : "#333" }]}>
                                No car listings found.
                            </Text>
                        )}
                    </ScrollView>
                )}
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
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
    loadingText: { marginLeft: 16, fontSize: 16, paddingBottom: 20 },
    noDataText: { marginLeft: 16, fontSize: 16, paddingBottom: 20 },
});
