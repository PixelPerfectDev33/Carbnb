import { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Image,
    TouchableOpacity,
    Dimensions,
    I18nManager,
} from "react-native";
import { Galeria } from "@nandorojo/galeria";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import {
    ThumbsUp,
    ThumbsDown,
    Star, // NEW: Star icon for ratings
    ArrowLeft, // NEW: For LTR back button or RTL forward button
    ArrowRight, // NEW: For RTL back button or LTR forward button
    CaretLeft, // NEW: For calendar previous month
    CaretRight, // NEW: For calendar next month
} from "phosphor-react-native";
import { supabase } from "@/lib/supabase";
import { useThemeContext } from "@/context/ThemeContext";
import { useI18n } from "@/context/I18nContext";
import { useAuth } from "@/context/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // <-- NEW IMPORT for safe area

// Define the expected Car structure from Supabase
interface CarDetails {
    id: string;
    title: string;
    description: string;
    photos: string[];
    price_per_day: string;
    location: string;
    tags: string[];
    host_id: string;
}
// --- Types ---
interface ReviewBreakdown {
  star: number;
  percent: number;
}

interface ReviewSummary {
  average: number;
  count: number;
  breakdown: ReviewBreakdown[];
}

// Define the expected shape of the review data
interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer: {
    id: string;
    name: string;
    avatar_url: string | null;
  } | null;
  car_id: string;
  reviewer_id: string;
  likes: number;
  dislikes: number;
}

// --- Mock/Placeholder Data ---
const MOCK_REVIEWS_DATA = {
    average: 4.8,
    count: 125,
    breakdown: [
        { star: 5, percent: 0.7 },
        { star: 4, percent: 0.2 },
        { star: 3, percent: 0.05 },
        { star: 2, percent: 0.03 },
        { star: 1, percent: 0.02 },
    ],
};

const MOCK_REVIEW_CARD = {
    reviewer: "Ethan Carter",
    date: "June 15, 2024",
    rating: 5,
    comment:
        "The BMW 7 Series was an absolute dream to drive. The interior was immaculate, and the ride was incredibly smooth. The owner, Michael, was also very responsive and helpful throughout the rental process.",
    likes: 12,
    dislikes: 2,
    avatarUrl: "https://placehold.co/100x100/CCCCCC/000000?text=EC",
};

// Get screen width for responsive image sizing
const { width: screenWidth } = Dimensions.get("window");

// --- Helper Functions and Icons (UPDATED to use Phosphor icons) ---
// Note: Phosphor's Star is filled, and the outline is controlled by the 'weight' prop.
// To achieve the star outline effect (similar to Ionicons' *-outline), we can use
// the 'weight' prop, but a simpler approach for a clean filled/unfilled look is
// to use 'weight="fill"' for filled and 'weight="regular"' for outlined, or just
// use 'Star' with a consistent weight and rely on a separate 'Star' component for outline.
// However, the common pattern is to use the `Star` component and differentiate by color/weight.

const renderStarIcon = (isFilled: boolean, size: number, color: string) => (
    <Star
        weight={isFilled ? "fill" : "regular"} // Use 'fill' for filled, 'regular' for outline
        size={size}
        color={color}
    />
);

const renderStars = (rating: number, size: number, color: string) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(
            <View key={i} style={{ paddingHorizontal: 0.5 }}>
                {renderStarIcon(i <= rating, size, color)}
            </View>,
        );
    }
    return <View style={{ flexDirection: "row" }}>{stars}</View>;
};

export default function CarDetailsPage() {
    const { theme } = useThemeContext();
    const { t, currentLang } = useI18n();
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const carId = Array.isArray(id) ? id[0] : id;
    const insets = useSafeAreaInsets(); // <-- Hook to handle notch/safe area

    const [car, setCar] = useState<CarDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);

    // --- Font Aliases from User Context (Unchanged) ---
    const FONT_ALIASES = {
        PJS_REGULAR: "PJS-Regular",
        PJS_MEDIUM: "PJS-Medium",
        PJS_BOLD: "PJS-Bold",
        PJS_EXTRABOLD: "PJS-ExtraBold",
        NS_REGULAR: "NotoSans-Regular",
        NS_BOLD: "NotoSans-Bold",
        NSA_REGULAR: "NotoSansArabic-Regular",
        NSA_BOLD: "NotoSansArabic-Bold",
    };

    // --- Core Theming and RTL Logic (Unchanged) ---
    const isRTL = currentLang === "ar" || I18nManager.isRTL;
    const isDark = theme === "dark";

    // Colors
    const primaryColor = "#111618";
    const secondaryColor = "#617c89";
    const accentColor = "#1193d4";
    const lightBg = "#ffffff";
    const darkBg = "#111618";
    const barFillBg = "#f0f3f4";
    const barBgColor = "#dbe2e6";
    // Dynamic Colors based on theme
    const bgColor = isDark ? darkBg : lightBg;
    const textColor = isDark ? lightBg : primaryColor;
    const subTextColor = isDark ? "#a0aec0" : secondaryColor;
    const barSecondaryBgColor = isDark ? "#1f2937" : barFillBg;
    // --- FIX: Updated colors for better visibility in Dark Mode ---
    const starColor = isDark ? lightBg : primaryColor; // Use accent for filled stars in dark mode
    const barFillColor = isDark ? lightBg : primaryColor; // Use accent for bar fill in dark mode
    const progressBarBgColor = isDark ? "#2c3e50" : barBgColor; // Use a distinct dark background for the bar
    // --- END FIX ---

    // Font selection based on HTML weight and RTL
    const getFont = (weight: "400" | "500" | "700" | "900") => {
        if (isRTL) {
            switch (weight) {
                case "400":
                    return FONT_ALIASES.NSA_REGULAR;
                case "700":
                case "900":
                    return FONT_ALIASES.NSA_BOLD;
                default:
                    return FONT_ALIASES.NSA_REGULAR;
            }
        } else {
            switch (weight) {
                case "400":
                    return FONT_ALIASES.PJS_REGULAR;
                case "500":
                    return FONT_ALIASES.PJS_MEDIUM;
                case "700":
                    return FONT_ALIASES.PJS_BOLD;
                case "900":
                    return FONT_ALIASES.PJS_EXTRABOLD;
                default:
                    return FONT_ALIASES.PJS_REGULAR;
            }
        }
    };

    // Applying specific font styles based on HTML elements:
    const titleFont = getFont("700");
    const bodyFont = getFont("400");
    const mediumFont = getFont("500");
    const extraBoldFont = getFont("900");
    const calendarDayLabelFont = getFont("700");
    useEffect(() => {
      if (!carId) return;

      const fetchData = async () => {
        try {
          setIsLoading(true);
          setError(null);

          // 1️⃣ Fetch Car Details (get host_id too)
          const { data: carData, error: carError } = await supabase
            .from("cars")
            .select(
              "id, title, description, photos, price_per_day, location, tags, host_id"
            )
            .eq("id", carId)
            .single();

          if (carError || !carData) {
            console.error("Error fetching car:", carError);
            setError(t("carNotFound"));
            setIsLoading(false);
            return;
          }

          setCar(carData as CarDetails);
          const hostId = carData.host_id;

          // 2️⃣ Fetch Reviews (exclude car owner)
          const { data: reviewsData, error: reviewsError } = await supabase
            .from("reviews")
            .select(`
              id,
              rating,
              comment,
              created_at,
              booking_id,
              reviewer_id,
              likes,
              dislikes,
              reviewer:reviewer_id(id, name, avatar_url)
            `)
            .eq("car_id", carId)
            .neq("reviewer_id", hostId)
            .limit(50);

          if (reviewsError) {
            console.error("Error fetching reviews:", reviewsError.message);
            setError(
              `Failed to fetch reviews: ${reviewsError.message}. Check RLS and database connection.`
            );
            return;
          }

          const reviews = (reviewsData as Review[]) || [];
          setReviews(reviews);

          // 3️⃣ Calculate stats (like MOCK_REVIEWS_DATA)
          const total = reviews.length;
          const avg =
            total > 0
              ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
              : 0;

          // Count each star
          const starCounts = [5, 4, 3, 2, 1].map((star) => ({
            star,
            count: reviews.filter((r) => r.rating === star).length,
          }));

          // Convert to percent breakdown
          const breakdown = starCounts.map(({ star, count }) => ({
            star,
            percent: total > 0 ? count / total : 0,
          }));

          // --- Final format
          const reviewSummary = {
            average: parseFloat(avg.toFixed(2)),
            count: total,
            breakdown,
          };

          console.log("Review Summary:", reviewSummary);
          setReviewSummary(reviewSummary); // store in state if you want
        } catch (err) {
          console.error("Unexpected error:", err);
          setError(t("failedToLoadDetails"));
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }, [carId]);


    // --- Navigation Handlers (Unchanged) ---
    const handleBackPress = () => {
        router.back();
    };

    const handleBookPress = () => {
        if (carId) {
            router.push(`/car/booking?id=${carId}`);
        }
    };

    if (isLoading) {
        return (
            <View
                style={[styles.centerContainer, { backgroundColor: bgColor }]}
            >
                <ActivityIndicator size="large" color={accentColor} />
                <Text
                    style={{
                        color: textColor,
                        marginTop: 10,
                        fontFamily: bodyFont,
                    }}
                >
                    {t("loadingDetails")}
                </Text>
            </View>
        );
    }

    if (error || !car) {
        return (
            <View
                style={[styles.centerContainer, { backgroundColor: bgColor }]}
            >
                <Text
                    style={{ color: "red", fontSize: 18, fontFamily: bodyFont }}
                >
                    {t("error")}: {error || t("carUnavailable")}
                </Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{ marginTop: 20 }}
                >
                    <Text
                        style={{
                            color: accentColor,
                            fontSize: 16,
                            fontFamily: bodyFont,
                        }}
                    >
                        {t("goBack")}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    const priceDisplay = parseFloat(car.price_per_day || "0").toFixed(2);
    const carPhotos =
        car.photos && car.photos.length > 0
            ? car.photos
            : [
                  "https://placehold.co/600x400/CCCCCC/000000?text=Image+1",
                  "https://placehold.co/600x400/CCCCCC/000000?text=Image+2",
                  "https://placehold.co/600x400/CCCCCC/000000?text=Image+3",
                  "https://placehold.co/600x400/CCCCCC/000000?text=Image+4",
              ];

    // --- JSX Rendering ---
    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <Stack.Screen
                options={{
                    // Hide the default fixed header
                    headerShown: false,
                }}
            />

            {/* Use a separate View for the back button and set its padding based on 
safe area insets (top) to clear the status bar/notch. 
This View is inside the ScrollView's content and will scroll.
*/}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: 100,
                    backgroundColor: bgColor, // Ensure the area outside the images matches the theme
                }}
            >
                {/* 1. Custom Header/Back Button Container */}
                <View
                    style={[
                        styles.customHeader,
                        {
                            backgroundColor: bgColor,
                            paddingTop: insets.top + 8, // Add safe area padding + 8px
                            paddingBottom: 8, // padding like in the HTML (p-4 pb-2)
                            flexDirection: isRTL ? "row-reverse" : "row",
                            justifyContent: "flex-start",
                        },
                    ]}
                >
                    <TouchableOpacity
                        onPress={handleBackPress}
                        style={styles.headerIconContainer}
                    >
                        {/* UPDATE: Replaced Ionicons with ArrowLeft/ArrowRight */}
                        {isRTL ? (
                            <ArrowRight
                                size={24}
                                color={textColor}
                                weight="regular"
                            />
                        ) : (
                            <ArrowLeft
                                size={24}
                                color={textColor}
                                weight="regular"
                            />
                        )}
                    </TouchableOpacity>
                    {/* The HTML has another element for flex-1, but since we removed the Host button, 
just a spacer or a justified-between container works.
*/}
                </View>

                {/* --- 2. Horizontal Image Gallery --- */}
                <View>
                    {/* STEP 1: Wrap the entire image listing with Galeria, passing the full array of URIs */}
                    
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            // Apply RTL scale only to the ScrollView container itself
                            style={isRTL ? { transform: [{ scaleX: -1 }] } : {}}
                            contentContainerStyle={[
                                styles.imageScrollContent,
                                styles.imageScrollContentRTL, // This style seems to handle RTL in your custom way
                            ]}
                        >
                            {carPhotos.map((uri, index) => (
                            <Galeria urls={carPhotos}>
                                // STEP 2: Wrap each image component with Galeria.Image
                                <Galeria.Image
                                    key={index}
                                    index={index} // This is the index in the carPhotos array
                                >
                                    <View
                                        style={[
                                            styles.imageCard,
                                            // STEP 3: Apply the reverse RTL scale to the inner View
                                            // This ensures the image content itself is not mirrored.
                                            isRTL && {
                                                transform: [{ scaleX: -1 }],
                                            },
                                        ]}
                                    >
                                        {/* The Image component for the thumbnail display */}
                                        <Image
                                            source={{ uri }}
                                            style={styles.galleryImage}
                                            contentFit="cover" // Using 'contentFit' for expo-image/web equivalent of 'resizeMode'
                                            // Your default image source (using expo-image syntax with uri)
                                            placeholder={{
                                                uri: "https://placehold.co/600x400/CCCCCC/000000?text=Image",
                                            }}
                                        />
                                    </View>
                                </Galeria.Image>
                            </Galeria>
                            ))}
                        </ScrollView>
                    
                </View>

                {/* --- Main Content Starts Here --- */}
                <View style={styles.contentPadding}>
                    {/* --- 3. Title and Description --- */}
                    <Text
                        style={[
                            styles.carTitle,
                            {
                                color: textColor,
                                fontFamily: titleFont,
                                textAlign: isRTL ? "right" : "left",
                            },
                        ]}
                    >
                        {car.title || t("carTitleFallback")}
                    </Text>
                    <Text
                        style={[
                            styles.carDescription,
                            {
                                color: textColor,
                                fontFamily: bodyFont,
                                textAlign: isRTL ? "right" : "left",
                            },
                        ]}
                    >
                        {car.description || t("noDescription")}
                    </Text>
                    {/* --- 4. Pricing Section --- */}
                    <Text
                        style={[
                            styles.sectionTitle,
                            {
                                color: textColor,
                                fontFamily: titleFont,
                                textAlign: isRTL ? "right" : "left",
                            },
                        ]}
                    >
                        {t("pricing")}
                    </Text>
                    <View style={styles.pricingContainer}>
                        <View
                            style={[
                                styles.pricingRow,
                                {
                                    flexDirection: isRTL
                                        ? "row-reverse"
                                        : "row",
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.pricingLabel,
                                    {
                                        color: subTextColor,
                                        fontFamily: bodyFont,
                                    },
                                ]}
                            >
                                {t("dailyRate")}
                            </Text>
                            <Text
                                style={[
                                    styles.pricingValue,
                                    { color: textColor, fontFamily: bodyFont },
                                ]}
                            >
                                ${priceDisplay}
                            </Text>
                        </View>
                        <View
                            style={[
                                styles.pricingRow,
                                {
                                    flexDirection: isRTL
                                        ? "row-reverse"
                                        : "row",
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.pricingLabel,
                                    {
                                        color: subTextColor,
                                        fontFamily: bodyFont,
                                    },
                                ]}
                            >
                                {t("tripFee")}
                            </Text>
                            <Text
                                style={[
                                    styles.pricingValue,
                                    { color: textColor, fontFamily: bodyFont },
                                ]}
                            >
                                $25.00
                            </Text>
                        </View>
                        <View
                            style={[
                                styles.pricingRow,
                                {
                                    flexDirection: isRTL
                                        ? "row-reverse"
                                        : "row",
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.pricingLabel,
                                    {
                                        color: subTextColor,
                                        fontFamily: bodyFont,
                                    },
                                ]}
                            >
                                {t("taxes")}
                            </Text>
                            <Text
                                style={[
                                    styles.pricingValue,
                                    { color: textColor, fontFamily: bodyFont },
                                ]}
                            >
                                $15.00
                            </Text>
                        </View>
                    </View>
                    {/* --- 6. Reviews Section --- */}
                    <Text
                        style={[
                            styles.sectionTitle,
                            {
                                color: textColor,
                                fontFamily: titleFont,
                                textAlign: isRTL ? "right" : "left",
                            },
                        ]}
                    >
                        {t("reviews")}
                    </Text>
                    <View
                        style={[
                            styles.reviewsSummaryContainer,
                            { flexDirection: isRTL ? "row-reverse" : "row" },
                        ]}
                    >
                        {/* Rating Score */}
                        <View
                            style={[
                                styles.ratingScoreBox,
                                {
                                    alignItems: isRTL
                                        ? "flex-end"
                                        : "flex-start",
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.ratingScore,
                                    {
                                        color: textColor,
                                        fontFamily: extraBoldFont,
                                    },
                                ]}
                            >
                                {reviewSummary.average.toFixed(1)}
                            </Text>
                            <View
                                style={{
                                    flexDirection: isRTL
                                        ? "row-reverse"
                                        : "row",
                                    paddingVertical: 4,
                                }}
                            >
                                {/* FIX: Pass starColor instead of textColor */}
                                {renderStars(
                                    Math.floor(reviewSummary.average),
                                    18,
                                    starColor,
                                )}
                            </View>
                            <Text
                                style={[
                                    styles.reviewCount,
                                    { color: textColor, fontFamily: bodyFont },
                                ]}
                            >
                                {reviewSummary.count} {t("reviews")}
                            </Text>
                        </View>

                        {/* Rating Breakdown Bars */}
                        <View style={styles.breakdownBarContainer}>
                            {reviewSummary.breakdown.map((item, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.breakdownRow,
                                        {
                                            flexDirection: isRTL
                                                ? "row-reverse"
                                                : "row",
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.breakdownLabel,
                                            {
                                                color: textColor,
                                                fontFamily: bodyFont,
                                            },
                                        ]}
                                    >
                                        {item.star}
                                    </Text>
                                    {/* FIX: Use progressBarBgColor for the background */}
                                    <View
                                        style={[
                                            styles.progressBarBackground,
                                            {
                                                backgroundColor:
                                                    progressBarBgColor,
                                            },
                                        ]}
                                    >
                                        {/* barFillColor is now accentColor in dark mode */}
                                        <View
                                            style={[
                                                styles.progressBarFill,
                                                {
                                                    backgroundColor:
                                                        barFillColor,
                                                    width: `${item.percent * 100}%`,
                                                    ...(isRTL && {
                                                        alignSelf: "flex-end",
                                                    }),
                                                },
                                            ]}
                                        />
                                    </View>
                                    <Text
                                        style={[
                                            styles.breakdownPercent,
                                            {
                                                color: subTextColor,
                                                fontFamily: bodyFont,
                                                textAlign: isRTL
                                                    ? "left"
                                                    : "right",
                                            },
                                        ]}
                                    >
                                        {Math.round(item.percent * 100)}%
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                    {/* --- 7. Sample Review Card --- */}
                    {reviews.length > 0 ? (
                        reviews.map((review) => (
                            <View
                                style={[
                                    styles.reviewCard,
                                    {
                                        alignItems: isRTL
                                            ? "flex-end"
                                            : "flex-start",
                                    },
                                ]}
                            >
                                <View
                                    style={[
                                        styles.reviewerHeader,
                                        {
                                            flexDirection: isRTL
                                                ? "row-reverse"
                                                : "row",
                                        },
                                    ]}
                                >
                                    <Image
                                        source={{ uri: review.reviewer?.avatar_url || "https://placehold.co/50x50/10b981/ffffff?text=U" }}
                                        style={styles.reviewerAvatar}
                                    />
                                    <View
                                        style={[
                                            styles.reviewerInfo,
                                            {
                                                alignItems: isRTL
                                                    ? "flex-end"
                                                    : "flex-start",
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.reviewerName,
                                                {
                                                    color: textColor,
                                                    fontFamily: mediumFont,
                                                    fontWeight: "600",
                                                },
                                            ]}
                                        >
                                            {review.reviewer?.name || "Anonymous User"}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.reviewDate,
                                                {
                                                    color: subTextColor,
                                                    fontFamily: bodyFont,
                                                },
                                            ]}
                                        >
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </Text>
                                    </View>
                                </View>
                                <View
                                    style={{
                                        marginTop: 8,
                                        flexDirection: isRTL
                                            ? "row-reverse"
                                            : "row",
                                    }}
                                >
                                    {/* FIX: Pass starColor instead of textColor */}
                                    {renderStars(
                                    review.rating,
                                        20,
                                        starColor,
                                    )}
                                </View>
                                <Text
                                    style={[
                                        styles.reviewComment,
                                        {
                                            color: textColor,
                                            fontFamily: bodyFont,
                                            textAlign: isRTL ? "right" : "left",
                                        },
                                    ]}
                                >
                                    {review.comment}
                                </Text>

                                {/* Like/Dislike Buttons */}
                                <View
                                    style={[
                                        styles.reviewActions,
                                        {
                                            flexDirection: isRTL
                                                ? "row-reverse"
                                                : "row",
                                        },
                                    ]}
                                >
                                    <TouchableOpacity
                                        style={[
                                            styles.actionButton,
                                            {
                                                flexDirection: isRTL
                                                    ? "row-reverse"
                                                    : "row",
                                            },
                                        ]}
                                    >
                                        <ThumbsUp
                                            size={20}
                                            color={subTextColor}
                                            weight="regular"
                                        />

                                        <Text
                                            style={{
                                                color: subTextColor,
                                                fontFamily: bodyFont,
                                                marginLeft: isRTL ? 0 : 4,
                                                marginRight: isRTL ? 4 : 0,
                                            }}
                                        >
                                            {review.likes}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.actionButton,
                                            {
                                                flexDirection: isRTL
                                                    ? "row-reverse"
                                                    : "row",
                                            },
                                        ]}
                                    >
                                        <ThumbsDown
                                            size={20}
                                            color={subTextColor}
                                            weight="regular"
                                        />

                                        <Text
                                            style={{
                                                color: subTextColor,
                                                fontFamily: bodyFont,
                                                marginLeft: isRTL ? 0 : 4,
                                                marginRight: isRTL ? 4 : 0,
                                            }}
                                        >
                                            {review.dislikes}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text
                            style={{
                                color: subTextColor,
                                fontFamily: bodyFont,
                            }}
                        >
                            No reviews yet.
                        </Text>
                    )}
                    {/* Filler space for bottom bar */}
                    <View style={{ height: 10 }} /> 
                </View>
            </ScrollView>

            {/* --- 8. Fixed Booking Bar (Remains fixed at the bottom) --- */}
            <View
                style={[
                    styles.bookingBar,
                    {
                        backgroundColor: bgColor,
                        borderTopColor: isDark ? "#2a2a2a" : "#e5e7eb",
                        flexDirection: isRTL ? "row-reverse" : "row",
                    },
                ]}
            >
                <View style={{ alignItems: isRTL ? "flex-end" : "flex-start" }}>
                    <Text
                        style={[
                            styles.barPrice,
                            { color: textColor, fontFamily: titleFont },
                        ]}
                    >
                         {t("bookNow")} 
                    </Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.bookButton,
                        { backgroundColor: accentColor },
                    ]}
                    onPress={handleBookPress}
                >
                    <Text
                        style={[
                            styles.bookButtonText,
                            { fontFamily: titleFont },
                        ]}
                    >
                        {t("bookNow")} ${priceDisplay}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// Updated styles (No changes needed here as the fix was in the dynamic color logic)
const styles = StyleSheet.create({
    // ... (rest of the styles are unchanged)
    // ...
    // ...
    // Global Containers
    container: { flex: 1 },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    contentPadding: {
        paddingHorizontal: 16,
    },

    // --- UPDATED Custom Header Styles ---
    customHeader: {
        // This view is now responsible for the header's layout and safe area handling
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        zIndex: 5, // Keep it above the images if they start higher up
    },
    headerIconContainer: {
        // Match the HTML size-12 (48px) container
        //width: 48,
        height: 48,
        justifyContent: "center",
        // No extra margin/padding inside the container, as it's built into the container size
    },
    // ----------------------------------

    // Image Gallery
    imageScrollContent: {
        paddingHorizontal: 16,
        paddingRight: 30, // For the "peek" effect on the right
        gap: 12,
    },
    imageScrollContentRTL: {
        //flexDirection: "row-reverse",
        paddingLeft: 16,
        paddingRight: 16,
    },
    imageCard: {
        width: screenWidth * 0.8,
        borderRadius: 8,
        overflow: "hidden",
        aspectRatio: 16 / 9,
    },
    galleryImage: {
        width: "100%",
        height: "100%",
    },

    // Text & Description
    carTitle: {
        fontSize: 22,
        fontWeight: "900",
        lineHeight: 28,
        paddingVertical: 12,
        paddingTop: 20, // Match HTML pt-5 (20px)
        paddingBottom: 12, // Match HTML pb-3 (12px)
    },
    carDescription: {
        fontSize: 16,
        fontWeight: "400",
        lineHeight: 24,
        paddingBottom: 20, // Match HTML pb-3 (12px) + extra space for the next heading
        paddingTop: 4, // Match HTML pt-1 (4px)
    },

    // Shared Headings
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        paddingVertical: 10,
        paddingTop: 16, // Match HTML pt-4 (16px)
    },

    // Pricing
    pricingContainer: {
        paddingBottom: 20,
        paddingHorizontal: 0, // Removed padding here since contentPadding covers it
    },
    pricingRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8, // Match HTML py-2 (8px)
    },
    pricingLabel: {
        fontSize: 14,
        fontWeight: "400",
    },
    pricingValue: {
        fontSize: 14,
        fontWeight: "500",
    },

    // Calendar Placeholder
    calendarPlaceholder: {
        paddingVertical: 10,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        paddingHorizontal: 0, // Calendar itself has p-4 in HTML, but we apply it via contentPadding
    },
    calendarHeader: {
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        paddingHorizontal: 5,
    },
    calendarMonth: {
        fontSize: 16,
        fontWeight: "700",
        flex: 1,
        textAlign: "center",
    },
    calendarGrid: {
        flexWrap: "wrap",
        width: "100%",
        marginTop: 10,
    },
    calendarDayLabel: {
        width: `${100 / 7}%`,
        textAlign: "center",
        height: 48,
        lineHeight: 48,
        fontSize: 13,
        fontWeight: "700",
    },
    calendarDayButton: {
        width: `${100 / 7}%`,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
    },
    dayStartRadius: {
        borderTopLeftRadius: 50,
        borderBottomLeftRadius: 50,
    },
    dayEndRadius: {
        borderTopRightRadius: 50,
        borderBottomRightRadius: 50,
    },

    // Reviews Summary
    reviewsSummaryContainer: {
        flexWrap: "wrap",
        gap: 32,
        paddingVertical: 10,
        marginBottom: 15,
        paddingHorizontal: 0, // Removed padding here since contentPadding covers it
    },
    ratingScoreBox: {
        gap: 5,
    },
    ratingScore: {
        fontSize: 36,
        fontWeight: "900",
    },
    reviewCount: {
        fontSize: 16,
        fontWeight: "400",
    },
    breakdownBarContainer: {
        flex: 1,
        minWidth: 200,
        maxWidth: 400,
        gap: 12,
        justifyContent: "center",
        paddingVertical: 4,
    },
    breakdownRow: {
        alignItems: "center",
        gap: 8,
    },
    breakdownLabel: {
        width: 15,
        fontSize: 14,
        textAlign: "right",
    },
    progressBarBackground: {
        flex: 1,
        height: 8,
        borderRadius: 4,
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        borderRadius: 4,
    },
    breakdownPercent: {
        width: 35,
        fontSize: 14,
        textAlign: "right",
    },

    // Review Card
    reviewCard: {
        flexDirection: "column",
        gap: 8,
        paddingVertical: 15,
        paddingHorizontal: 0, // Removed padding here since contentPadding covers it
    },
    reviewerHeader: {
        alignItems: "center",
        gap: 12,
    },
    reviewerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    reviewerInfo: {
        flex: 1,
    },
    reviewerName: {
        fontSize: 16,
        fontWeight: "600",
    },
    reviewDate: {
        fontSize: 14,
    },
    reviewComment: {
        fontSize: 16,
        lineHeight: 24,
        marginTop: 10,
    },
    reviewActions: {
        gap: 30,
        marginTop: 10,
    },
    actionButton: {
        alignItems: "center",
        padding: 5,
    },

    // Fixed Booking Bar
    bookingBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 10,
    },
    barPrice: {
        fontSize: 20,
        fontWeight: "800",
    },
    barPerDay: {
        fontSize: 14,
        fontWeight: "400",
    },
    bookButton: {
        paddingHorizontal: 30,
        paddingVertical: 14,
        borderRadius: 10,
    },
    bookButtonText: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "700",
    },
});
