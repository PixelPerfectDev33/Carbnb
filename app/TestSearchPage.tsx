// SearchResultsScreen.tsx (Updated for Array Tags - FIXES IN FILTER LOGIC)
import { useEffect, useState, useCallback } from "react";
import {
    ScrollView,
    View,
    Text,
    ActivityIndicator,
    TouchableOpacity,
    I18nManager,
    StyleSheet, 
} from "react-native";
import { useI18n } from "@/context/I18nContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { SafeAreaView } from "react-native-safe-area-context";
import CarResultItem from "@/components/CarResultItem"; // External component dependency
import BottomNav from "@/components/BottomNav"; // External component dependency
import {
    ArrowLeft,
    ArrowRight,
    Sliders,
} from "phosphor-react-native";
import FilterModal from "@/components/FilterModal"; // <-- No curly braces { }
// --- Type Definitions ---
// Ensuring the car object has a 'type' column (string) and a 'tags' column (string array)
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

// --- Component ---
export default function SearchResultsScreen() {
    const { t, currentLang } = useI18n();
    const router = useRouter();
    const isRTL = currentLang === 'ar' || I18nManager.isRTL;
    const { q } = useLocalSearchParams<{ q?: string }>();
    const searchQuery = q || '';

    const [fetchedCars, setFetchedCars] = useState<CarResultWithFilters[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // FILTER STATES
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [minPriceFilter, setMinPriceFilter] = useState(0);
    const [maxPriceFilter, setMaxPriceFilter] = useState(500);
    const [selectedFeatureTags, setSelectedFeatureTags] = useState<string[]>([]); 
    const [selectedCarType, setSelectedCarType] = useState<string | null>(null); 

    const SIMILARITY_THRESHOLD = 0.05;

    // MINIMAL FETCH LOGIC (Updated to select 'tags' and car 'type')
    const fetchCarListings = useCallback(async (query: string) => {
        setIsLoading(true);
        setError(null);
        const searchInput = query.trim();

        try {
            let data: any[] = [];
            let fetchError: any = null;

            // Using 'photos' here because your initial code used it in the RPC part, 
            // but the database schema shows 'car_photos' and 'photos' in different places.
            // I'll stick to 'photos' for now based on your provided code's select statement.
            // NOTE: Per your schema, you might need to change 'photos' to a JOIN/RPC that returns `car_photos(url)`
            // For now, keeping the column names as you had them:
            const columnsToSelect = 'id, title, price_per_day, location, photos, tags, type'; 

            if (!searchInput) {
                const { data: normalData, error: normalError } = await supabase
                    .from('cars')
                    .select(columnsToSelect) 
                    .order('created_at', { ascending: false })
                    .limit(50);
                data = normalData || [];
                fetchError = normalError;
            } else {
                const { data: rpcData, error: rpcError } = await supabase.rpc('search_cars_fuzzy', {
                    search_query: searchInput,
                    threshold: SIMILARITY_THRESHOLD
                });
                data = rpcData || [];
                fetchError = rpcError;
            }

            if (fetchError) throw fetchError;

            // Map the data
            const mappedData: CarResultWithFilters[] = data.map(car => {
                let parsedTags: string[] = [];
                if (Array.isArray(car.tags)) {
                    parsedTags = car.tags;
                } else if (typeof car.tags === 'string') {
                    try {
                        const parsed = JSON.parse(car.tags);
                        if (Array.isArray(parsed)) {
                            parsedTags = parsed;
                        }
                    } catch (e) {
                        console.warn("Failed to parse tags for car", car.id, car.tags);
                        parsedTags = [];
                    }
                }

                return {
                    id: car.id,
                    name: car.title || 'Unknown Car',
                    price: car.price_per_day || 0, 
                    image: (car.photos && car.photos.length > 0)
                        ? car.photos[0]
                        : 'https://placehold.co/300x200?text=Car',
                    location: car.location || t("unknownLocation"),
                    rating: 4.5,
                    tags: parsedTags, 
                    type: car.tags || '', 
                };
            });

            setFetchedCars(mappedData);
            console.log("Sample car tags:", mappedData[0].tags);
        } catch (e: any) {
            console.error("Fetch car listings error:", e);
            setError(`Search failed: ${e.message}`);
            setFetchedCars([]);
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchCarListings(searchQuery);
    }, [searchQuery, fetchCarListings]);

    const handleApplyFilters = (min: number, max: number, type: string | null, featureTags: string[]) => {
        setMinPriceFilter(min);
        setMaxPriceFilter(max);
        setSelectedCarType(type); 
        setSelectedFeatureTags(featureTags); 
        setIsModalVisible(false);
    };

    // Client-side Filtering Logic (FIXED)
    // Client-side Filtering Logic (Robust Case-Insensitive Array/String Matching)
    const getFilteredCars = (): CarResultWithFilters[] => {
        return fetchedCars.filter(car => {
            // 1. Price Filter
            const priceMatch = car.price >= minPriceFilter && car.price <= maxPriceFilter;

            // 2. Car Type Filter
            const typeMatch = !selectedCarType || (
                car.tags.some(tag => tag.toLowerCase() === selectedCarType.toLowerCase())
            );
            // 3. Feature Tags Filter (ALL selected tags must be present)
            const featureTagsMatch = selectedFeatureTags.length === 0 || 
                selectedFeatureTags.every(selectedTag => {
                    if (!Array.isArray(car.tags) || car.tags.length === 0) return false;
                    return car.tags.some(carTag => 
                        typeof carTag === 'string' && 
                        carTag.trim().toLowerCase() === selectedTag.trim().toLowerCase()
                    );
                });

            return priceMatch && typeMatch && featureTagsMatch;
        });
    };

    const displayedCars = getFilteredCars();

    const handleCarPress = (carId: string) => {
        router.push(`/car/${carId}`);
    };

    const BackIcon = isRTL ? ArrowRight : ArrowLeft;

    // --- Render Functions (omitted for brevity) ---
    const renderCarList = () => {
        if (isLoading) {
             return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" />
                    <Text style={styles.loadingText}>{t("loadingListings")}...</Text>
                </View>
            );
        }
        if (error) {
             return (
                <View style={styles.loadingContainer}>
                    <Text style={styles.errorText}>Error: {error}</Text>
                </View>
            );
        }
        if (displayedCars.length === 0) {
            return (
                <View style={styles.loadingContainer}>
                    <Text>{t("noResultsFound")}</Text>
                </View>
            );
        }

        return displayedCars.map((car) => (
            <CarResultItem
                key={car.id}
                {...car}
                onPress={() => handleCarPress(car.id)}
            />
        ));
    };


    return (
        <SafeAreaView style={styles.container}>
            <View style={{ flex: 1 }}>

                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                        <BackIcon size={24} weight="regular" />
                    </TouchableOpacity>

                    {/* FILTER BUTTON - Opens the Modal */}
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => setIsModalVisible(true)}
                    >
                        <Sliders size={24} weight="regular" />
                    </TouchableOpacity>
                </View>

                {/* SCROLLABLE CONTENT */}
                <ScrollView showsVerticalScrollIndicator={false}>

                    {/* RESULTS COUNT */}
                    <Text style={styles.resultsCountText}>
                        {`${displayedCars.length} ${t("carsAvailable")}`}
                        <Text style={styles.priceRangeText}>
                            {` (${minPriceFilter} - ${maxPriceFilter})`}
                        </Text>
                        {(selectedFeatureTags.length > 0 || selectedCarType) && (
                            <Text style={styles.tagCountText}>
                                {` +${selectedFeatureTags.length + (selectedCarType ? 1 : 0)} ${t("filters")}`}
                            </Text>
                        )}
                    </Text>

                    {/* CAR LISTINGS */}
                    <View style={styles.carListContainer}>
                        {renderCarList()}
                    </View>

                    {/* Spacer */}
                    <View style={{ height: 100 }} />
                </ScrollView>
            </View>

            {/* THE FILTER MODAL */}
            <FilterModal
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onApply={handleApplyFilters as any} 
                currentMinPrice={minPriceFilter}
                currentMaxPrice={maxPriceFilter}
                currentSelectedCarType={selectedCarType}
                currentSelectedTags={selectedFeatureTags}
            />

            {/* BOTTOM NAVIGATION (Fixed at the bottom) */}
            <BottomNav
                items={[
                    { label: t("home"), icon: "home-outline", route: "/" },
                    { label: t("search"), icon: "search-filled", route: "/search" },
                    { label: t("inbox"), icon: "chatbubble-outline", route: "/inbox" },
                    { label: t("profile"), icon: "person-outline", route: "/profile" },
                ]}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: '#ccc'
    },
    headerButton: {
        padding: 10
    },
    resultsCountText: {
        fontSize: 18,
        fontWeight: 'bold',
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 8
    },
    priceRangeText: {
        fontSize: 14,
        fontWeight: 'normal',
    },
    tagCountText: { 
        fontSize: 14,
        fontWeight: '600',
        color: '#1193d4'
    },
    carListContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40
    },
    loadingText: {
        marginTop: 10
    },
    errorText: {
        color: 'red'
    }
});