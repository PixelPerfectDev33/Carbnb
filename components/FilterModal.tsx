// FilterModal.tsx (Full Screen Modal, No Rounded Edges)
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    ScrollView,
    Dimensions,
    I18nManager,
    StyleSheet,
    Platform,
} from "react-native";
// @ts-ignore
import { Slider } from "@miblanchard/react-native-slider";
import { X } from "phosphor-react-native";
import { useI18n } from "@/context/I18nContext";
import { useThemeContext } from "@/context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: screenHeight } = Dimensions.get("window");

// --- Type Definitions ---
interface OptionButtonProps {
    text: string;
    isSelected: boolean;
    onPress: () => void;
    isRTL: boolean;
    colors: ReturnType<typeof getColors>;
}

interface FilterModalProps {
    isVisible: boolean;
    onClose: () => void;
    onApply: (
        minPrice: number,
        maxPrice: number,
        selectedCarType: string | null,
        selectedFeatureTags: string[],
    ) => void;
    currentMinPrice: number;
    currentMaxPrice: number;
    currentSelectedCarType: string | null;
    currentSelectedTags: string[];
}

// --- Constants ---
const MIN_PRICE_LIMIT = 0;
const MAX_PRICE_LIMIT = 500;
const STEP = 5;

const CarTypes = ["Sedan", "SUV", "Truck", "4x4"];
const AvailableTags = [
    "GPS",
    "A/C",
    "Heated Seats",
    "Bluetooth",
    "Sunroof",
    "All-Wheel Drive",
    "All-Wheel Drive",
    "All-Wheel Drive",
    "All-Wheel Drive",
];

// --- Theme/Color Utilities ---
const PRIMARY_BLUE = "#1193d4";
const LIGHT_GREY = "#dbe2e6";
const DARK_BG = "#1c2327";
const OVERLAY_COLOR = "rgba(20, 20, 20, 0.4)";
/** Helper to get theme-dependent colors */
const getColors = (theme: "light" | "dark") => ({
    primaryText: theme === "dark" ? "#fff" : "#111618",
    secondaryText: theme === "dark" ? "#9db0b9" : "#617c89",
    modalBackground: theme === "dark" ? DARK_BG : "#fff",
    // Use a slightly lighter/darker color for separators in both modes for contrast
    separator: theme === "dark" ? "#28343b" : LIGHT_GREY, 
    primaryButtonBg: PRIMARY_BLUE,
    secondaryButtonBg: theme === "dark" ? "#28343b" : "#f0f3f4",
    secondaryButtonText: theme === "dark" ? "#fff" : "#111618",
    sliderActive: PRIMARY_BLUE,
    sliderInactive: theme === "dark" ? "#3c4950" : LIGHT_GREY, // Darker inactive track for dark mode
    radioBorder: theme === "dark" ? "#3c4950" : LIGHT_GREY, // Darker border for dark mode
    radioBorderActive: PRIMARY_BLUE,
});

// --- Reusable Component (Radio/Tag Style Button) ---
const OptionButton: React.FC<OptionButtonProps> = ({
    text,
    isSelected,
    onPress,
    isRTL,
    colors,
}) => {
    // Uses Medium weight for buttons/options
    const font = isRTL ? "NotoSansArabic-Medium" : "PJS-Medium";

    const containerStyle = [
        styles.optionContainer,
        {
            // Border is PRIMARY_BLUE when active, or the dynamic radioBorder when inactive
            borderColor: isSelected ? colors.radioBorderActive : colors.radioBorder,
            backgroundColor: isSelected ? colors.modalBackground : colors.modalBackground, // Buttons should match modal background for clean look
        },
        // Active container uses a thicker border
        isSelected && styles.optionContainerActive,
    ];

    const textStyle = {
        // Text is primary text when active, secondary when inactive
        color: isSelected ? colors.primaryText : colors.secondaryText,
        fontFamily: font,
    };

    return (
        <TouchableOpacity
            style={containerStyle}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Text style={[styles.optionText, textStyle]}>{text}</Text>
        </TouchableOpacity>
    );
};

// --- Main Component ---

export default function FilterModal({
    isVisible,
    onClose,
    onApply,
    currentMinPrice,
    currentMaxPrice,
    currentSelectedCarType,
    currentSelectedTags,
}: FilterModalProps) {
    const { t} = useI18n();
    const { theme } = useThemeContext();
    const colors = getColors(theme);
    const { currentLang } = useI18n();
    // Assuming 'ar' is the only RTL language for simplicity
    const isRTL = currentLang === "ar" || I18nManager.isRTL; 

    // Dynamic Font Family selection
    const titleFont = isRTL ? "NotoSansArabic-Bold" : "PJS-Bold";
    const bodyFont = isRTL ? "NotoSansArabic-Regular" : "PJS-Regular";
    const headerFont = isRTL ? "NotoSansArabic-Medium" : "PJS-Medium";
    const insets = useSafeAreaInsets();

    // Initialize state with props
    const [minPrice, setMinPrice] = useState(currentMinPrice);
    const [maxPrice, setMaxPrice] = useState(currentMaxPrice);
    const [selectedCarType, setSelectedCarType] = useState<string | null>(
        currentSelectedCarType,
    );
    const [selectedTags, setSelectedTags] =
        useState<string[]>(currentSelectedTags);

    // Sync local state when modal opens/changes external values
    useEffect(() => {
        setMinPrice(currentMinPrice);
        setMaxPrice(currentMaxPrice);
        setSelectedCarType(currentSelectedCarType);
        setSelectedTags(currentSelectedTags);
    }, [
        currentMinPrice,
        currentMaxPrice,
        currentSelectedCarType,
        currentSelectedTags,
        isVisible,
    ]);

    const handleSliderChange = (values: readonly number[]) => {
        if (values.length === 2) {
            setMinPrice(values[0]);
            setMaxPrice(values[1]);
        }
    };

    const toggleTag = (tag: string) => {
        setSelectedTags((prevTags) =>
            prevTags.includes(tag)
                ? prevTags.filter((t) => t !== tag)
                : [...prevTags, tag],
        );
    };

    const handleApply = () => {
        const finalMinPrice = isFinite(minPrice)
            ? Math.floor(minPrice)
            : MIN_PRICE_LIMIT;
        const finalMaxPrice = isFinite(maxPrice)
            ? Math.floor(maxPrice)
            : MAX_PRICE_LIMIT;

        onApply(finalMinPrice, finalMaxPrice, selectedCarType, selectedTags);
        onClose();
    };

    const handleClear = () => {
        setMinPrice(MIN_PRICE_LIMIT);
        setMaxPrice(MAX_PRICE_LIMIT);
        setSelectedCarType(null);
        setSelectedTags([]);
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            {/* Modal Overlay is the same for both themes to ensure a consistent dimming effect */}
            <View style={[styles.modalOverlay, { backgroundColor: OVERLAY_COLOR }]}>
                <View
                    style={[
                        styles.modalContent,
                        {
                            backgroundColor: colors.modalBackground,
                            paddingTop: insets.top, // Use safe area for status bar
                        },
                    ]}
                >
                    {/* --- Header Bar --- */}
                    <View
                        style={[
                            styles.headerBar,
                            { borderBottomColor: colors.separator },
                        ]}
                    >
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                            activeOpacity={0.7}
                        >
                            <X size={24} color={colors.primaryText} />
                        </TouchableOpacity>
                        <Text
                            style={[
                                styles.headerTitle,
                                {
                                    color: colors.primaryText,
                                    fontFamily: titleFont,
                                },
                            ]}
                        >
                            {t("filters") || "Filters"}
                        </Text>
                        <TouchableOpacity
                            style={styles.clearHeaderButton}
                            onPress={handleClear}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.clearButtonText,
                                    { color: colors.secondaryText, fontFamily: headerFont },
                                ]}
                            >
                                {t("clear") || "Clear"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.scrollContent}
                        // Add extra padding for footer and safe area
                        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }} 
                    >
                        {/* --- 1. Price Range (Slider) --- */}
                        <View style={[styles.sectionContainer, { borderBottomColor: colors.separator }]}>
                            <View
                                style={[
                                    styles.sectionHeaderRow,
                                    // Ensure header text alignment respects RTL
                                    { flexDirection: isRTL ? "row-reverse" : "row" }, 
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.sectionTitle,
                                        { 
                                            color: colors.primaryText, 
                                            fontFamily: titleFont,
                                            textAlign: isRTL ? 'right' : 'left',
                                        },
                                    ]}
                                >
                                    {t("price_range") || "Price Range"}
                                </Text>
                            </View>

                            {/* Min/Max Price Display */}
                            <View
                                style={[
                                    styles.priceDisplayRow,
                                    { flexDirection: isRTL ? "row-reverse" : "row" },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.priceText,
                                        { color: colors.secondaryText, fontFamily: bodyFont },
                                    ]}
                                >
                                    {t("min") || "Min"}:{" "}
                                    <Text style={{ fontFamily: titleFont, color: colors.primaryText }}>
                                        ${Math.floor(minPrice)}
                                    </Text>
                                </Text>
                                <Text
                                    style={[
                                        styles.priceText,
                                        { color: colors.secondaryText, fontFamily: bodyFont },
                                    ]}
                                >
                                    {t("max") || "Max"}:{" "}
                                    <Text style={{ fontFamily: titleFont, color: colors.primaryText }}>
                                        ${Math.floor(maxPrice)}
                                    </Text>
                                </Text>
                            </View>

                            <View style={styles.sliderWrapper}>
                                <Slider
                                    value={[
                                        isFinite(minPrice) ? minPrice : MIN_PRICE_LIMIT,
                                        isFinite(maxPrice) ? maxPrice : MAX_PRICE_LIMIT,
                                    ]}
                                    onValueChange={handleSliderChange}
                                    minimumValue={MIN_PRICE_LIMIT}
                                    maximumValue={MAX_PRICE_LIMIT}
                                    step={STEP}
                                    minimumTrackTintColor={colors.sliderActive}
                                    maximumTrackTintColor={colors.sliderInactive}
                                    trackStyle={[
                                        styles.sliderTrack,
                                        { backgroundColor: colors.sliderInactive },
                                    ]}
                                    containerStyle={styles.sliderContainerOverride}
                                    renderThumbComponent={(index: number) => (
                                        <View style={styles.customThumbTouchWrapper}>
                                            <View style={styles.fixedSliderThumbContainer}>
                                                {/* Price Label */}
                                                <Text
                                                    style={[
                                                        styles.fixedSliderThumbLabel,
                                                        { color: colors.primaryText, fontFamily: bodyFont },
                                                    ]}
                                                >
                                                    ${Math.floor(index === 0 ? minPrice : maxPrice)}
                                                </Text>
                                                {/* Circle Dot */}
                                                <View
                                                    style={[
                                                        styles.fixedSliderThumbCircle,
                                                        { 
                                                            backgroundColor: colors.sliderActive, 
                                                            borderColor: colors.modalBackground // Contrast dot with background
                                                        },
                                                    ]}
                                                />
                                            </View>
                                        </View>
                                    )}
                                />
                            </View>
                        </View>

                        {/* --- 2. Car Types (Radio Buttons) --- */}
                        <View style={[styles.sectionContainer, { borderBottomColor: colors.separator }]}>
                            <Text
                                style={[
                                    styles.sectionTitle,
                                    { 
                                        color: colors.primaryText, 
                                        fontFamily: titleFont, 
                                        flexBasis: "100%", // Take full width
                                        textAlign: isRTL ? 'right' : 'left',
                                    },
                                ]}
                            >
                                {t("car_type") || "Car Type"}
                            </Text>
                            <View style={styles.optionsContainer}>
                                {CarTypes.map((type) => (
                                    <OptionButton
                                        key={type}
                                        text={t(type.toLowerCase()) || type}
                                        isSelected={selectedCarType === type}
                                        onPress={() =>
                                            setSelectedCarType(selectedCarType === type ? null : type)
                                        }
                                        isRTL={isRTL}
                                        colors={colors}
                                    />
                                ))}
                            </View>
                        </View>

                        {/* --- 3. Features (Tags) --- */}
                        <View style={styles.sectionContainer}>
                            <Text
                                style={[
                                    styles.sectionTitle,
                                    { 
                                        color: colors.primaryText, 
                                        fontFamily: titleFont, 
                                        flexBasis: "100%", // Take full width
                                        textAlign: isRTL ? 'right' : 'left',
                                    },
                                ]}
                            >
                                {t("features") || "Features"}
                            </Text>
                            <View style={styles.optionsContainer}>
                                {AvailableTags.map((tag) => (
                                    <OptionButton
                                        key={tag}
                                        text={t(tag.toLowerCase().replace(/ /g, '_')) || tag}
                                        isSelected={selectedTags.includes(tag)}
                                        onPress={() => toggleTag(tag)}
                                        isRTL={isRTL}
                                        colors={colors}
                                    />
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    {/* --- Footer (Fixed Bottom Buttons) --- */}
                    <View
                        style={[
                            styles.footer,
                            {
                                borderTopColor: colors.separator,
                                backgroundColor: colors.modalBackground,
                                paddingBottom: insets.bottom + 12, // Use safe area for bottom
                            },
                        ]}
                    >
                        <View style={styles.footerButtonContainer}>
                            {/* Clear All Button */}
                            <TouchableOpacity
                                style={[
                                    styles.clearButton,
                                    { backgroundColor: colors.secondaryButtonBg },
                                ]}
                                onPress={handleClear}
                                activeOpacity={0.8}
                            >
                                <Text
                                    style={[
                                        styles.clearButtonText,
                                        {
                                            color: colors.secondaryButtonText,
                                            fontFamily: titleFont,
                                        },
                                    ]}
                                >
                                    {t("clear_all") || "Clear All"}
                                </Text>
                            </TouchableOpacity>

                            {/* Apply Filters Button (Primary Blue) */}
                            <TouchableOpacity
                                style={[
                                    styles.applyButton,
                                    { backgroundColor: colors.primaryButtonBg },
                                ]}
                                onPress={handleApply}
                                activeOpacity={0.8}
                            >
                                <Text
                                    style={[
                                        styles.applyButtonText,
                                        // Text is always white on the primary blue button
                                        { color: "#fff", fontFamily: titleFont },
                                    ]}
                                >
                                    {t("apply_filters") || "Apply Filters"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
    // --- General Styles ---
    modalOverlay: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "stretch",
    },
    modalContent: {
        flex: 1, 
        width: "100%",
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        overflow: "hidden",
    },

    // --- Header Bar ---
    headerBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        //borderBottomWidth: StyleSheet.hairlineWidth,
    },
    closeButton: {
        padding: 4, 
    },
    clearHeaderButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        lineHeight: 24,
        flex: 1, 
        textAlign: "center",
        letterSpacing: -0.015 * 18,
    },
    clearButtonText: {
        fontSize: 14,
        lineHeight: 20,
        letterSpacing: 0.015 * 14,
    },
    scrollContent: {
        flex: 1,
    },

    // --- Section Styles ---
    sectionTitle: {
        fontSize: 18,
        lineHeight: 24,
        paddingVertical: 8,
    },
    sectionContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        flexWrap: "wrap",
        //borderBottomWidth: StyleSheet.hairlineWidth,
    },
    sectionHeaderRow: {
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
    },
    priceDisplayRow: {
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 4,
        marginBottom: 10,
    },
    priceText: {
        fontSize: 14,
        lineHeight: 20,
    },

    // --- Price Range Section (Slider) ---
    sliderWrapper: {
        width: "100%",
        height: 50,
    },
    sliderContainerOverride: {
        paddingVertical: 0,
        paddingHorizontal: 0,
        height: 50,
    },
    sliderTrack: {
        height: 4,
    },
    customThumbTouchWrapper: {
        width: 50,
        height: 50,
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 0,
    },
    fixedSliderThumbContainer: {
        alignItems: "center",
        justifyContent: "center",
        height: 50,
        width: 50,
    },
    fixedSliderThumbCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        bottom: 0,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    fixedSliderThumbLabel: {
        fontSize: 12,
        lineHeight: 16,
        position: "absolute",
        top: 0,
    },

    // --- Option Buttons ---
    optionsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        paddingBottom: 4,
        paddingTop: 4,
    },
    optionContainer: {
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    optionContainerActive: {
        borderWidth: 3,
        paddingHorizontal: 14, // Adjust padding slightly to account for thicker border
    },
    optionText: {
        fontSize: 14,
        lineHeight: 20,
    },

    // --- Footer ---
    footer: {
        position: "absolute", 
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: 12,
        paddingHorizontal: 16,
        borderTopWidth: StyleSheet.hairlineWidth,
        zIndex: 10, 
    },
    footerButtonContainer: {
        flexDirection: "row",
        gap: 12,
        justifyContent: "space-between",
        alignItems: "center",
    },
    clearButton: {
        flex: 1,
        minWidth: 84,
        height: 48,
        borderRadius: 8,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    applyButton: {
        flex: 2,
        minWidth: 84,
        height: 48, 
        borderRadius: 8,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    applyButtonText: {
        fontSize: 16,
        lineHeight: 24,
        letterSpacing: 0.015 * 16,
    },
});