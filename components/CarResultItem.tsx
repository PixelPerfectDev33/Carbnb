// CarResultItem.tsx
import { View, Text, StyleSheet, Image, TouchableOpacity, I18nManager } from "react-native";
import { useThemeContext } from "@/context/ThemeContext";
import { useI18n } from "@/context/I18nContext";
import { Star } from "phosphor-react-native";

interface CarResultItemProps {
    id: string;
    name: string;
    price: number;
    image: string;
    location: string;
    rating: number;
    onPress: (carId: string) => void;
}

export default function CarResultItem({ id, name, price, image, location, rating, onPress }: CarResultItemProps) {
    const { theme } = useThemeContext();
    const { t, currentLang } = useI18n();

    const isDark = theme === "dark";
    const isRTL = currentLang === 'ar' || I18nManager.isRTL; // Determine RTL status

    const primaryTextColor = isDark ? "#fff" : "#111618";
    const secondaryTextColor = isDark ? "#9db0b9" : "#617c89";
    const bookButtonBg = isDark ? "#1c2327" : "#f0f3f4";
    const textFontFamily = isRTL ? 'NotoSansArabic-Regular' : 'NotoSans-Regular';
    const boldFontFamily = isRTL ? 'NotoSansArabic-Bold' : 'PJS-Bold';
    const mediumFontFamily = isRTL ? 'NotoSansArabic-Medium' : 'PJS-Medium';

    return (
        <TouchableOpacity 
            style={styles.itemContainer} 
            onPress={() => onPress(id)}
            activeOpacity={0.8}
        >
            <View style={[
                styles.contentWrapper,
                // CRITICAL FIX: Reverse flow for RTL layout
                isRTL && { flexDirection: 'row-reverse' } 
            ]}>
                {/* Left Side: Text and Button (which becomes Right Side in RTL) */}
                <View style={styles.textColumn}>
                    <View style={styles.textGap}>
                        {/* Rating */}
                        <View style={[
                            styles.ratingRow,
                            isRTL && { flexDirection: 'row-reverse' } // Reverse stars for RTL
                        ]}>
                            <Star 
                                size={14} 
                                color={secondaryTextColor} 
                                weight="fill" 
                                style={{ [isRTL ? 'marginLeft' : 'marginRight']: 4 }} 
                            />
                            <Text style={[styles.ratingText, { color: secondaryTextColor, fontFamily: textFontFamily }]}>
                                {rating.toFixed(1)}
                            </Text>
                        </View>

                        {/* Title */}
                        <Text style={[
                            styles.titleText, 
                            { 
                                color: primaryTextColor, 
                                fontFamily: boldFontFamily,
                                textAlign: isRTL ? 'right' : 'left', // Align text based on direction
                            }
                        ]}>
                            {name}
                        </Text>

                        {/* Price and Location */}
                        <Text style={[
                            styles.detailsText, 
                            { 
                                color: secondaryTextColor, 
                                fontFamily: textFontFamily,
                                textAlign: isRTL ? 'right' : 'left', // Align text based on direction
                            }
                        ]}>
                            {`$${price}/${t("perDay")} · ${location}`}
                        </Text>
                    </View>

                    {/* Book Button */}
                    <TouchableOpacity
                        style={[
                            styles.bookButton, 
                            { 
                                backgroundColor: bookButtonBg,
                                // CRITICAL FIX: Ensure button is correctly aligned in RTL (start/end)
                                alignSelf: isRTL ? 'flex-end' : 'flex-start',
                            }
                        ]}
                        onPress={() => onPress(id)} 
                    >
                        <Text style={[styles.bookText, { color: primaryTextColor, fontFamily: mediumFontFamily }]}>
                            {t("book")}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Right Side: Image (which becomes Left Side in RTL) */}
                <Image
                    source={{ uri: image }}
                    style={styles.image}
                />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    itemContainer: {
        paddingVertical: 8, 
        paddingHorizontal: 16,
    },
    contentWrapper: {
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'space-between',
        gap: 16,
        borderRadius: 8,
    },
    textColumn: {
        flex: 2, // Takes 2/3 of the space
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 16,
        paddingVertical: 4,
    },
    textGap: {
        flexDirection: 'column',
        gap: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '400',
        // fontFamily set dynamically
    },
    titleText: {
        fontSize: 16,
        fontWeight: '700',
        lineHeight: 20,
        // fontFamily set dynamically
    },
    detailsText: {
        fontSize: 14,
        fontWeight: '400',
        // fontFamily set dynamically
    },
    bookButton: {
        height: 32,
        paddingHorizontal: 16,
        borderRadius: 8,
        // alignSelf set dynamically
        justifyContent: 'center',
        alignItems: 'center',
    },
    bookText: {
        fontSize: 14,
        fontWeight: '500',
        // fontFamily set dynamically
    },
    image: {
        width: 130,
        height: 130,
        borderRadius: 8,
        resizeMode: 'cover',
    },
});