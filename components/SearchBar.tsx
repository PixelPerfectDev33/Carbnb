import { View, TextInput, StyleSheet, I18nManager, NativeSyntheticEvent, TextInputSubmitEditingEventData } from "react-native";
import { useThemeContext } from "@/context/ThemeContext";
import { useI18n } from "@/context/I18nContext";
import { MagnifyingGlass } from "phosphor-react-native";

interface SearchBarProps {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    // New optional prop for submitting the search (e.g., when pressing 'Enter' or 'Search' on keyboard)
    onSubmitEditing?: (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => void; 
}

export default function SearchBar({ placeholder, value, onChangeText, onSubmitEditing }: SearchBarProps) {
    const { theme } = useThemeContext();
    const { currentLang } = useI18n();

    const isRTL = currentLang === "ar" || I18nManager.isRTL;

    const inputBg = theme === "dark" ? "#1c2327" : "#f0f3f4";
    const placeholderColor = theme === "dark" ? "#9db0b9" : "#617c89";
    const textColor = theme === "dark" ? "#fff" : "#111618";

    const inputFontFamily = isRTL ? 'NotoSansArabic-Regular' : 'NotoSans-Regular';

    const baseMargin = 8;
    const arabicExtraMargin = 4;

    const iconMarginStyle = isRTL
        ? { marginLeft: baseMargin + arabicExtraMargin }
        : { marginRight: baseMargin };

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: inputBg },
                isRTL && { flexDirection: 'row-reverse' }
            ]}
        >
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
                textAlign={isRTL ? 'right' : 'left'}
                style={[
                    styles.input,
                    {
                        color: textColor,
                        fontFamily: inputFontFamily,
                        writingDirection: isRTL ? 'rtl' : 'ltr',
                    }
                ]}
                value={value}
                onChangeText={onChangeText}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
                // Pass the new prop to the TextInput
                onSubmitEditing={onSubmitEditing}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        height: 48,
        marginHorizontal: 16,
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    iconWrapper: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 0,
    },
});