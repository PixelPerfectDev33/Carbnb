import { useEffect, useState, useCallback } from "react";
import {
    ScrollView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    I18nManager,
    ActivityIndicator,
    Alert, // Keep Alert for any potential legacy use, though FilterModal replaces it for the main filter
} from "react-native";
import { useThemeContext } from "@/context/ThemeContext";
import { useI18n } from "@/context/I18nContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { SafeAreaView } from "react-native-safe-area-context";
import CarResultItem from "@/components/CarResultItem";
import SearchBar from "@/components/SearchBar";
import BottomNav from "@/components/BottomNav";
import FilterModal from "@/components/FilterModal"; // <-- NEW IMPORT
import {
    ArrowLeft,
    ArrowRight,
    Sliders,
    CurrencyDollar,
    Car,
    MapPin,
} from "phosphor-react-native";

// --- Type Definitions ---
// Updated to match the expected data structure for client-side filtering
type CarResultWithFilters = {
    id: string;
    name: string;
    price: number;
    image: string;
    location: string;
    rating: number;
    tags: string[] | null; // e.g., ["4x4", "adventure"]
    type: string | null; // e.g., "SUV" (The dedicated column from your schema)
};

// Placeholder for Filter Tags (Used to be rendered in a bar, now removed or adapted)
const FilterTags = [
    { label: "Price", icon: CurrencyDollar },
    { label: "Car type", icon: Car },
    { label: "Proximity", icon: MapPin },
];

export default function SearchResultsScreen() {
    const { theme } = useThemeContext();
    const { t, currentLang } = useI18n();
    const router = useRouter();
    const isRTL = currentLang === "ar" || I18nManager.isRTL;

    const { q } = useLocalSearchParams<{ q?: string }>();
    const searchQuery = q || "";

    // STATE FOR FETCHED DATA
    const [fetchedCars, setFetchedCars] = useState<CarResultWithFilters[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // FILTER STATES (NEW)
    const [isModalVisible, setIsModalVisible] = useState(false);
    // Initialize with practical defaults for price
    const [minPriceFilter, setMinPriceFilter] = useState(0);
    const [maxPriceFilter, setMaxPriceFilter] = useState(500);
    const [selectedFeatureTags, setSelectedFeatureTags] = useState<string[]>([]);
    const [selectedCarType, setSelectedCarType] = useState<string | null>(null);

    // --- Configuration ---
    const SIMILARITY_THRESHOLD = 0.05;

    const isDark = theme === "dark";
    const primaryTextColor = isDark ? "#fff" : "#111618";
    const secondaryTextColor = isDark ? "#9db0b9" : "#617c89";
    const headerBg = isDark ? "#000" : "#fff";
    const toggleBg = isDark ? "#1c2327" : "#f0f3f4"; // Kept for styles that use it
    const BackIcon = isRTL ? ArrowRight : ArrowLeft;

    // State for Search Query - now used for navigation trigger only
    const [searchQuery_p1, setSearchQuery_p1] = useState("");

    // Handler: Navigate to the dedicated search page
    const handleSearchSubmit = (query: string) => {
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    // Handler for applying filters from the modal (NEW)
    const handleApplyFilters = (
        min: number,
        max: number,
        type: string | null,
        featureTags: string[],
    ) => {
        setMinPriceFilter(min);
        setMaxPriceFilter(max);
        setSelectedCarType(type);
        setSelectedFeatureTags(featureTags);
        setIsModalVisible(false);
    };

    // MINIMAL FETCH LOGIC (Updated to select 'tags' and car 'type')
    const fetchCarListings = useCallback(
        async (query: string) => {
            setIsLoading(true);
            setError(null);
            const searchInput = query.trim();

            try {
                let data: any[] = [];
                let fetchError: any = null;

                // Select the columns required for the list and client-side filtering
                const columnsToSelect =
                    "id, title, price_per_day, location, photos, tags";

                if (!searchInput) {
                    // Fallback to normal fetch if empty
                    const { data: normalData, error: normalError } =
                        await supabase
                            .from("cars")
                            .select(columnsToSelect)
                            .order("created_at", { ascending: false })
                            .limit(50);

                    data = normalData || [];
                    fetchError = normalError;
                } else {
                    // Fuzzy Search RPC
                    const { data: rpcData, error: rpcError } =
                        await supabase.rpc("search_cars_fuzzy", {
                            search_query: searchInput,
                            threshold: SIMILARITY_THRESHOLD,
                        });

                    data = rpcData || [];
                    fetchError = rpcError;
                }

                if (fetchError) throw fetchError;

                // Map the data to the expected format
                const mappedData: CarResultWithFilters[] = data.map((car) => {
                    let parsedTags: string[] = [];
                    // Robustly parse tags from the database column, handling stringified arrays or nulls
                    if (Array.isArray(car.tags)) {
                        parsedTags = car.tags;
                    } else if (typeof car.tags === "string") {
                        try {
                            const parsed = JSON.parse(car.tags);
                            if (Array.isArray(parsed)) {
                                parsedTags = parsed;
                            }
                        } catch (e) {
                            console.warn(
                                "Failed to parse tags for car",
                                car.id,
                                car.tags,
                            );
                        }
                    }

                    return {
                        id: car.id,
                        name: car.title || "Unknown Car",
                        price: car.price_per_day || 0,
                        image:
                            car.photos && car.photos.length > 0
                                ? car.photos[0]
                                : "https://placehold.co/300x200/CCCCCC/000000?text=Car+Image",
                        location: car.location || t("unknownLocation"),
                        rating: 4.5,
                        tags: parsedTags,
                        type: null, // Assuming 'type' is a simple string
                    };
                });
                setFetchedCars(mappedData);
            } catch (e: any) {
                console.error("Fuzzy search error:", e);
                setError(`Search failed: ${e.message}`);
                setFetchedCars([]);
            } finally {
                setIsLoading(false);
            }
        },
        [t],
    );

    useEffect(() => {
        fetchCarListings(searchQuery);
    }, [searchQuery, fetchCarListings]);

    // Client-side Filtering Logic (NEW)
    const getFilteredCars = (): CarResultWithFilters[] => {
        return fetchedCars.filter((car) => {
            // 1. Price Filter
            const priceMatch =
                car.price >= minPriceFilter && car.price <= maxPriceFilter;

            // 2. Car Type Filter (Match against the car's 'type' field)
            const typeMatch = !selectedCarType || (
                car.tags.some(tag => tag.toLowerCase() === selectedCarType.toLowerCase())
            );
            // 3. Feature Tags Filter (ALL selected tags must be present in the car's 'tags' array)
            const featureTagsMatch =
                selectedFeatureTags.length === 0 ||
                selectedFeatureTags.every((selectedTag) => {
                    if (!Array.isArray(car.tags) || car.tags.length === 0)
                        return false;
                    return car.tags.some(
                        (carTag) =>
                            typeof carTag === "string" &&
                            carTag.trim().toLowerCase() ===
                                selectedTag.trim().toLowerCase(),
                    );
                });

            return priceMatch && typeMatch && featureTagsMatch;
        });
    };

    const displayedCars = getFilteredCars(); // Apply filter to display

    const handleCarPress = (carId: string) => {
        router.push(`/car/${carId}`);
    };

    // --- Component Rendering Functions ---

    const renderCarList = () => {
        if (isLoading) {
            return (
                <View style={styles.statusView}>
                    <ActivityIndicator size="large" color={primaryTextColor} />
                    <Text
                        style={[
                            styles.statusText,
                            { color: secondaryTextColor, marginTop: 10 },
                        ]}
                    >
                        {t("loadingListings")}...
                    </Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.statusView}>
                    <Text style={[styles.statusText, { color: "red" }]}>
                        {error}
                    </Text>
                </View>
            );
        }

        if (displayedCars.length === 0) {
            return (
                <View style={styles.statusView}>
                    <Text
                        style={[
                            styles.statusText,
                            { color: secondaryTextColor },
                        ]}
                    >
                        {t("noResultsFound")}
                    </Text>
                </View>
            );
        }

        return displayedCars.map((car) => (
            <CarResultItem
                key={car.id}
                {...car}
                onPress={(carId) => router.push(`/car/${carId}`)}
            />
        ));
    };

    // **REMOVED:** The `renderFilterTags` function is no longer needed as filtering is handled by the modal, but a static tag bar can be kept if desired (using the old logic for now, but usually removed when a modal is introduced).
    const renderFilterTags = () => (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagBar}
        >
            {FilterTags.map((item, index) => {
                const IconComponent = item.icon;
                return (
                    <View
                        key={index}
                        style={[styles.tag, { backgroundColor: toggleBg }]}
                    >
                        <IconComponent
                            size={20}
                            color={primaryTextColor}
                            weight="regular"
                        />
                        <Text
                            style={[
                                styles.tagText,
                                { color: primaryTextColor },
                            ]}
                        >
                            {item.label}
                        </Text>
                    </View>
                );
            })}
        </ScrollView>
    );

    return (
        <SafeAreaView
            style={[styles.safeArea, { backgroundColor: headerBg }]}
            edges={["top", "left", "right"]}
        >
            <View style={styles.container}>
                {/* 1. FIXED HEADER */}
                <View
                    style={[
                        styles.header,
                        { borderBottomColor: isDark ? "#333" : "#e5e7eb" },
                    ]}
                >
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <BackIcon
                            size={24}
                            color={primaryTextColor}
                            weight="regular"
                            style={isRTL ? { transform: [{ scaleX: -1 }] } : {}}
                        />
                    </TouchableOpacity>

                    {/* FILTER BUTTON - Opens the Modal */}
                    <TouchableOpacity
                        style={styles.filterButton}
                        onPress={() => setIsModalVisible(true)} // <-- NEW HANDLER
                    >
                        <Sliders
                            size={24}
                            color={primaryTextColor}
                            weight="regular"
                        />
                    </TouchableOpacity>
                </View>

                {/* SCROLLABLE CONTENT */}
                <ScrollView showsVerticalScrollIndicator={false}>
                    <SearchBar
                        placeholder={t("searchPlaceholder")}
                        value={searchQuery_p1}
                        onChangeText={setSearchQuery_p1}
                        onSubmitEditing={() =>
                            handleSearchSubmit(searchQuery_p1)
                        }
                    />

                    {/* 2. RESULTS COUNT (Updated to reflect filtered count and applied filters) */}
                    <Text
                        style={[
                            styles.resultsCount,
                            { color: primaryTextColor },
                        ]}
                    >
                        {`${displayedCars.length} ${t("carsAvailable")}`}
                        <Text style={styles.priceRangeText}>
                            {` ($${minPriceFilter} - $${maxPriceFilter})`}
                        </Text>
                        {(selectedFeatureTags.length > 0 || selectedCarType) && (
                            <Text style={styles.tagCountText}>
                                {` +${
                                    selectedFeatureTags.length +
                                    (selectedCarType ? 1 : 0)
                                } ${t("filters")}`}
                            </Text>
                        )}
                    </Text>

                    {/* 3. FILTER TAG BAR (Kept for layout, but usually removed or adapted) */}
                    {renderFilterTags()}

                    {/* 5. CAR LISTINGS (Dynamic Content) */}
                    <View style={styles.listingArea}>{renderCarList()}</View>
                    <View style={{ height: 100 }} />
                </ScrollView>
            </View>

            {/* THE FILTER MODAL (NEW) */}
            <FilterModal
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onApply={handleApplyFilters as any} // Cast as any if FilterModal props are not fully defined in this file
                currentMinPrice={minPriceFilter}
                currentMaxPrice={maxPriceFilter}
                currentSelectedCarType={selectedCarType}
                currentSelectedTags={selectedFeatureTags}
            />

            {/* 6. BOTTOM NAVIGATION (Fixed at the bottom) */}
            <BottomNav
                items={[
                    { label: t("home"), icon: "home-outline", route: "/" },
                    {
                        label: t("search"),
                        icon: "search-filled",
                        route: "/search",
                    },
                    {
                        label: t("inbox"),
                        icon: "chatbubble-outline",
                        route: "/inbox",
                    },
                    {
                        label: t("profile"),
                        icon: "person-outline",
                        route: "/profile",
                    },
                ]}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 8,
        //borderBottomWidth: StyleSheet.hairlineWidth,
    },
    backButton: {
        width: 48,
        height: 48,
        justifyContent: "center",
        alignItems: "flex-start",
    },
    filterButton: {
        width: 48,
        height: 48,
        justifyContent: "center",
        alignItems: "flex-end",
    },
    resultsCount: {
        fontSize: 22,
        fontWeight: "800",
        fontFamily: "PJS-ExtraBold",
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 12,
    },
    priceRangeText: {
        fontSize: 14,
        fontWeight: "normal",
    },
    tagCountText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1193d4", // A visible color to highlight filters
    },
    tagBar: {
        paddingHorizontal: 16,
        gap: 12,
        paddingBottom: 12,
        alignItems: "center",
    },
    tag: {
        flexDirection: "row",
        height: 32,
        paddingLeft: 8,
        paddingRight: 16,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    tagText: {
        fontSize: 14,
        fontWeight: "500",
        fontFamily: "PJS-Medium",
    },
    listingArea: {},
    statusView: {
        padding: 40,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 200,
    },
    statusText: {
        fontSize: 16,
        fontFamily: "NotoSans-Regular",
    },
    // Removed unused styles for brevity: viewToggleContainer, viewToggle, toggleOption, shadowStyle, toggleText, saveSearchButton, saveSearchText
});