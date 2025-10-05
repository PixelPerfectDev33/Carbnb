import { View, Text, Image, StyleSheet } from "react-native";
import { useThemeContext } from "@/context/ThemeContext";
import { useI18n } from "@/context/I18nContext";

export default function CarCard({ car }: { car: any }) {
    const { theme } = useThemeContext();
    const { currentLang } = useI18n();
    const isRTL = currentLang === "ar";

    // Dynamic colors based on theme, matching HTML
    const titleColor = theme === "dark" ? "#fff" : "#111618";
    const priceColor = theme === "dark" ? "#9db0b9" : "#617c89";
    const bgColor = theme === "dark" ? "#1c2327" : "#fff"; // Assuming card background is white/darkBg

    // Conditional Font Logic
    // Title: NotoSans-Medium (500) for LTR, NotoSansArabic-Medium (500) for RTL
    const titleFont = isRTL ? "NotoSansArabic-Medium" : "NotoSans-Medium";

    // Price: NotoSans-Regular (400) for LTR, NotoSansArabic-Regular (400) for RTL
    const priceFont = isRTL ? "NotoSansArabic-Regular" : "NotoSans-Regular";

    // Text alignment for RTL
    const textAlignStyle = isRTL ? styles.textRight : styles.textLeft;

    return (
        // The HTML uses a fixed min-w-60 (~240px) and gap-4 (~16px) for internal spacing
        <View style={[styles.card, { backgroundColor: bgColor }]}>
            {/* The HTML uses an aspect-video (16:9 ratio) for the image container */}
            <View style={styles.imageContainer}>
                <Image source={{ uri: car.image }} style={styles.image} />
            </View>

            <View style={styles.textBlock}>
                {/* Car Title (text-base font-medium) */}
                <Text
                    style={[
                        styles.title,
                        textAlignStyle,
                        { color: titleColor, fontFamily: titleFont },
                    ]}
                >
                    {car.name}
                </Text>

                {/* Price (text-sm font-normal) */}
                <Text
                    style={[
                        styles.price,
                        textAlignStyle,
                        { color: priceColor, fontFamily: priceFont },
                    ]}
                >
                    {car.price}/day
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        // Matches min-w-60 (~240px) from HTML
        width: 240,
        // HTML has p-4 around the whole structure, but here we set margin and internal padding
        marginHorizontal: 4, // Assuming this card is part of a horizontal list with p-4 around it
        borderRadius: 8, // rounded-lg

        // Flexbox styles from HTML: flex h-full flex-1 flex-col gap-4
        flexDirection: "column",
        gap: 16, // gap-4
        padding: 8, // Internal padding to visually match the content area
    },
    imageContainer: {
        // To achieve aspect-video (16:9) style for the image area
        width: "100%",
        aspectRatio: 16 / 9,
    },
    image: {
        width: "100%",
        height: "100%",
        borderRadius: 8, // rounded-lg
        resizeMode: "cover",
    },
    textBlock: {
        // This view holds the title and price, creating the separation from the image
        paddingHorizontal: 4, // Small padding for alignment inside the card
        paddingBottom: 4,
        gap: 2, // Small gap between title and price
    },
    title: {
        // Matches HTML: text-base font-medium
        fontSize: 16,
        // Font weight is handled by the custom font (NotoSans-Medium)
        fontWeight: "500",
        lineHeight: 24, // leading-normal
    },
    price: {
        // Matches HTML: text-sm font-normal
        fontSize: 14,
        // Font weight is handled by the custom font (NotoSans-Regular)
        fontWeight: "400",
        lineHeight: 20, // leading-normal
    },
    textLeft: {
        textAlign: "left",
    },
    textRight: {
        textAlign: "right",
    },
});
