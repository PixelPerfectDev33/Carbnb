import { View, TextInput, StyleSheet, I18nManager } from "react-native";
import { useThemeContext } from "@/context/ThemeContext";
import { useI18n } from "@/context/I18nContext"; // Import useI18n
import { MagnifyingGlass } from "phosphor-react-native"; // Import Phosphor Icon

export default function SearchBar({ placeholder }: { placeholder: string }) {
    const { theme } = useThemeContext();
    const { currentLang } = useI18n(); // Access language context

    // Determine RTL status
    const isRTL = currentLang === "ar" || I18nManager.isRTL;

    // Matching HTML/Tailwind Colors
    const inputBg = theme === "dark" ? "#1c2327" : "#f0f3f4"; // bg-[#f0f3f4] / Dark: darkBg from profile.tsx
    const placeholderColor = theme === "dark" ? "#9db0b9" : "#617c89"; // placeholder:text-[#617c89]
    const textColor = theme === "dark" ? "#fff" : "#111618"; // text-[#111618]

    // Determine Font Family based on language/RTL status
    const inputFontFamily = isRTL ? 'NotoSansArabic-Regular' : 'NotoSans-Regular';

    // The base margin is 8px. We want 12px for Arabic (8 + 4).
    const baseMargin = 8;
    const arabicExtraMargin = 4;

    // FIX: Calculate the margin style object explicitly using LTR/RTL properties.
    // LTR (Default row): Margin is on the right of the icon. Value: 8px.
    // RTL (Row-reverse): Icon is on the right, so the margin is on the left of the icon. Value: 12px.
    const iconMarginStyle = isRTL
        ? { marginLeft: baseMargin + arabicExtraMargin } // RTL: space on the left (before the TextInput)
        : { marginRight: baseMargin }; // LTR: space on the right (before the TextInput)

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: inputBg },
                // Adjust layout direction for RTL
                isRTL && { flexDirection: 'row-reverse' } 
            ]}
        >
            {/* Magnifying Glass Icon Wrapper */}
            <View style={[styles.iconWrapper, iconMarginStyle]}> 
                <MagnifyingGlass 
                    size={24} 
                    color={placeholderColor}
                    weight="regular"
                />
            </View>

            <TextInput
                placeholder={placeholder}
                placeholderTextColor={placeholderColor}
                // Important: Set textAlign based on RTL status for correct cursor and text flow
                textAlign={isRTL ? 'right' : 'left'} 
                style={[
                    styles.input, 
                    // Apply conditional font and color
                    { 
                        color: textColor, 
                        fontFamily: inputFontFamily,
                        // Ensure text direction is always logical based on language
                        writingDirection: isRTL ? 'rtl' : 'ltr', 
                    }
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        // Based on HTML padding and margin: px-4 py-3, input h-12
        flexDirection: "row",
        alignItems: "center",
        height: 48, // h-12 (approx 48px)
        marginHorizontal: 16,
        borderRadius: 8, // rounded-lg
        paddingHorizontal: 16,
    },
    // Style for the icon wrapper to ensure consistent sizing
    iconWrapper: {
        width: 24, // Fixed width for the icon
        height: 24, 
        // Margin is set dynamically using marginLeft/marginRight in the component logic
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1, // This input will now take the remaining space correctly
        fontSize: 16, // text-base
        paddingVertical: 0, // Ensure no extra padding is added by RN
    },
});
