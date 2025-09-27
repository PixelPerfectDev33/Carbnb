import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    I18nManager,
} from "react-native";
import { useThemeContext } from "@/context/ThemeContext";
import { useI18n } from "@/context/I18nContext";

type Category = {
    label: string;
    // Icon property is now ignored, but kept in the type for compatibility
    icon?: string; 
};

export default function CategoryTabs({
    categories,
}: {
    categories: Category[];
}) {
    const { theme } = useThemeContext();
    const [active, setActive] = useState(0);
    const { currentLang } = useI18n();
    // Assuming 'ar' is the only RTL language for simplicity
    const isRTL = currentLang === "ar" || I18nManager.isRTL; 

    // Custom Colors based on theme (Matching HTML/Tailwind)
    const activeColor = theme === "dark" ? "#fff" : "#111618";
    const inactiveColor = theme === "dark" ? "#9db0b9" : "#617c89";
    const borderColor = theme === "dark" ? "#283339" : "#dbe2e6"; // Base border color

    return (
        <View style={{ borderBottomWidth: 1, borderBottomColor: borderColor }}>
            <View style={[styles.container, isRTL && styles.containerRTL]}>
                {categories.map((cat, index) => {
                    const isActive = active === index;
                    const color = isActive ? activeColor : inactiveColor;

                    // Simple Logic:
                    // If LTR, use the custom 'NotoSans-Bold'.
                    // If RTL (Arabic), do NOT set a fontFamily, just set the fontWeight to '600'
                    // to leverage the system's high-quality bold Arabic font.
                    const textStyle = { 
                        color: color,
                        fontFamily: isRTL ? 'NotoSansArabic-Bold' : 'NotoSans-Bold', 
                    };

                    return (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.tab,
                                // Aligning with HTML gap: 8 (margin: 16)
                                isRTL ? styles.tabRTL : styles.tabLTR, 
                                isActive && {
                                    // Active border color uses the active text color
                                    borderBottomColor: activeColor,
                                    borderBottomWidth: 3, // Increased border thickness to match perceived HTML style
                                },
                            ]}
                            onPress={() => setActive(index)}
                        >
                            <Text
                                style={[
                                    styles.text,
                                    textStyle,
                                    // Applying the simple, conditional style
                                ]}
                            >
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        marginHorizontal: 16, // px-4
    },
    containerRTL: {
        flexDirection: "row-reverse",
    },
    tab: {
        flexDirection: "row",
        alignItems: "center",
        // Vertically aligned with HTML pt-4 pb-[13px]
        paddingVertical: 10, 
        paddingBottom: 13, // To compensate for the 3px border
    },
    // margin-right: 32px to match the HTML gap-8 spacing
    tabLTR: { 
        marginRight: 32,
    },
    // margin-left: 32px for RTL
    tabRTL: { 
        marginLeft: 32,
        flexDirection: "row-reverse",
    },
    text: {
        // Base size and alignment are defined here
        fontSize: 14, // text-sm
        textAlign: "left",
    },
});
