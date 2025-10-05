// login.tsx
import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    Platform,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { useRouter, Stack } from "expo-router";
import { useThemeContext } from "@/context/ThemeContext";
import { useI18n } from "@/context/I18nContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EnvelopeSimple, Lock, IconProps } from 'phosphor-react-native';

// --- Custom Component: Primary Button (Reusing app styles) ---
interface PrimaryButtonProps {
    title: string;
    onPress: () => void;
    loading: boolean;
    isRTL: boolean;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
    title,
    onPress,
    loading,
    isRTL,
}) => {
    const { theme } = useThemeContext();
    const PRIMARY_BLUE = "#1193d4";
    const DISABLED_COLOR = theme === "dark" ? "#3c4950" : "#dbe2e6";
    const font = isRTL ? "NotoSansArabic-Bold" : "PJS-Bold";

    return (
        <TouchableOpacity
            style={[
                styles.primaryButton,
                {
                    backgroundColor: loading ? DISABLED_COLOR : PRIMARY_BLUE,
                },
            ]}
            onPress={onPress}
            disabled={loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={[styles.primaryButtonText, { fontFamily: font }]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

// --- Main Component ---
export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const router = useRouter();
    const { theme } = useThemeContext();
    const { t, isRTL } = useI18n();
    const insets = useSafeAreaInsets();

    // Dynamic Colors based on theme
    const colors = {
        background: theme === "dark" ? "#0f1316" : "#fff",
        primaryText: theme === "dark" ? "#fff" : "#111618",
        secondaryText: theme === "dark" ? "#9db0b9" : "#617c89",
        inputBackground: theme === "dark" ? "#1c2327" : "#f0f3f4", // Input background color
        inputPlaceholder: theme === "dark" ? "#9db0b9" : "#617c89", // Placeholder and Icon color
        successText: "#22c55e",
        errorText: "#ef4444",
        linkText: "#1193d4",
    };

    // Dynamic Fonts
    const titleFont = isRTL ? "NotoSansArabic-Bold" : "PJS-Bold";
    const bodyFont = isRTL ? "NotoSansArabic-Regular" : "PJS-Regular";

    const handleLogin = async () => {
        if (!email || !password) {
            setMessage(t("login_error_missing_fields") || "Please enter both email and password.");
            return;
        }

        setLoading(true);
        setMessage(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setLoading(false);

        if (error) {
            setMessage(error.message);
        } else {
            router.replace("/");
        }
    };

    // Props for Phosphor Icons
    const iconProps: IconProps = {
        size: 20, 
        color: colors.inputPlaceholder,
        weight: "regular",
    };

    // Style for the text input that takes up the rest of the space
    const inputTextStyle = {
        flex: 1, 
        fontSize: 16,
        paddingVertical: 0, 
        color: colors.primaryText,
        fontFamily: bodyFont,
        writingDirection: isRTL ? 'rtl' : 'ltr',
        paddingHorizontal: 10, // Margin from the icon
    } as const;

    // Style for the container that holds the icon and text input
    const inputContainerStyle = [
        styles.inputContainer,
        { backgroundColor: colors.inputBackground },
        // CRITICAL FIX: Reverse container flow for RTL to place icon on the left
        isRTL && { flexDirection: 'row-reverse' }
    ] as const;


    return (
        <View style={[styles.fullContainer, { backgroundColor: colors.background }]}>
            <Stack.Screen
                options={{
                    headerShown: false,
                    title: t("login") || "Login",
                }}
            />

            <ScrollView 
                contentContainerStyle={[
                    styles.contentPadding, 
                    { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 20 }
                ]}
                keyboardShouldPersistTaps="handled"
            >
                {/* Title */}
                <Text
                    style={[
                        styles.title,
                        { color: colors.primaryText, fontFamily: titleFont, textAlign: isRTL ? 'right' : 'left' },
                    ]}
                >
                    {t("welcome_back") || "Welcome Back"} 👋
                </Text>

                {/* Subtitle / Instructions */}
                <Text
                    style={[
                        styles.subtitle,
                        { color: colors.secondaryText, fontFamily: bodyFont, textAlign: isRTL ? 'right' : 'left' },
                    ]}
                >
                    {t("login_to_continue") || "Sign in to access your account and start renting."}
                </Text>

                {/* --- Email Input --- */}
                <View style={inputContainerStyle}>
                    <View style={styles.iconWrapper}>
                        <EnvelopeSimple {...iconProps} />
                    </View>
                    <TextInput
                        placeholder={t("email") || "Email"}
                        placeholderTextColor={colors.inputPlaceholder}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        textAlign={isRTL ? 'right' : 'left'} 
                        style={inputTextStyle}
                    />
                </View>

                {/* --- Password Input --- */}
                <View style={inputContainerStyle}>
                    <View style={styles.iconWrapper}>
                        <Lock {...iconProps} />
                    </View>
                    <TextInput
                        placeholder={t("password") || "Password"}
                        placeholderTextColor={colors.inputPlaceholder}
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                        autoCapitalize="none"
                        textAlign={isRTL ? 'right' : 'left'}
                        style={inputTextStyle}
                    />
                </View>


                {/* --- Message/Error Display --- */}
                {message && (
                    <Text
                        style={[
                            styles.message,
                            {
                                color: message.includes("successful") ? colors.successText : colors.errorText,
                                fontFamily: bodyFont,
                                textAlign: isRTL ? 'right' : 'left',
                            },
                        ]}
                    >
                        {t(message) || message}
                    </Text>
                )}

                {/* --- Login Button --- */}
                <PrimaryButton
                    title={loading ? (t("logging_in") || "Logging in...") : (t("login") || "Login")}
                    onPress={handleLogin}
                    loading={loading}
                    isRTL={isRTL}
                />

                {/* --- Link to Sign Up --- */}
                <View 
                    style={[
                        styles.linkContainer, 
                        { flexDirection: isRTL ? 'row-reverse' : 'row' }
                    ]}
                >
                    <Text
                        style={[
                            styles.linkText,
                            { color: colors.secondaryText, fontFamily: bodyFont },
                        ]}
                    >
                        {t("no_account_prompt") || "Don't have an account?"}
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push("/signup")}
                        disabled={loading}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.linkButtonText,
                                { color: colors.linkText, fontFamily: bodyFont },
                            ]}
                        >
                            {t("signup") || "Sign Up"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
    fullContainer: {
        flex: 1,
    },
    contentPadding: {
        paddingHorizontal: 24,
    },

    // --- Text Styles ---
    title: {
        fontSize: 32,
        lineHeight: 40,
        marginBottom: 8,
        letterSpacing: -0.015 * 32,
    },
    subtitle: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 32,
    },
    message: {
        fontSize: 14,
        lineHeight: 20,
        marginVertical: 12,
        paddingHorizontal: 4,
    },

    // --- Input Styles (Mirroring SearchBar style) ---
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        height: 52, 
        borderRadius: 12, 
        paddingHorizontal: 16,
        marginBottom: 16, 
    },
    iconWrapper: {
        width: 20, 
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // --- Primary Button Styles ---
    primaryButton: {
        height: 52,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 8,
    },
    primaryButtonText: {
        fontSize: 18,
        color: "#fff",
    },

    // --- Link Styles ---
    linkContainer: {
        marginTop: 24,
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
    },
    linkText: {
        fontSize: 14,
    },
    linkButtonText: {
        fontSize: 14,
        fontWeight: "600",
    },
});