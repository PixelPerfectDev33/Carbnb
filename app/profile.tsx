//profile.tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    I18nManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeContext } from "@/context/ThemeContext";
import { useI18n } from "@/context/I18nContext";
import BottomNav from "@/components/BottomNav";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { Gear, ArrowRight } from "phosphor-react-native";

// --- Reusable Component Mimicking HTML/Tailwind List Item ---
const ListItem = ({ title, onPress, theme, isRTL, icon }) => {
    const iconColor = theme === "dark" ? "#fff" : "#111618";

    // Determine title text alignment based on language direction
    const textStyle = isRTL ? styles.listItemTextRTL : styles.listItemText;

    // Use default ArrowRight unless a specific icon component is passed
    const IconComponent = icon || ArrowRight;

    return (
        <TouchableOpacity
            style={[
                styles.listItemContainer,
                // CRITICAL FIX: Reverse container flow for RTL
                isRTL && styles.listItemContainerRTL,
            ]}
            onPress={onPress}
        >
            <Text style={[textStyle, { color: iconColor }]} numberOfLines={1}>
                {title}
            </Text>
            {/* Right Arrow Icon: Flipped visually for RTL navigation direction */}
            <View
                style={[
                    styles.listItemIconWrapper,
                    isRTL && styles.listItemIconWrapperRTL, // Flips the icon visually
                ]}
            >
                <IconComponent size={26} color={iconColor} weight="regular" />
            </View>
        </TouchableOpacity>
    );
};

export default function Profile() {
    const { theme, toggleTheme } = useThemeContext() || {
        theme: "light",
        toggleTheme: () => {},
    };
    const { t, changeLanguage, currentLang } = useI18n() || {
        t: (key) => key,
        changeLanguage: () => {},
        currentLang: "en",
    };
    const router = useRouter();

    const isRTL = currentLang === "ar" || I18nManager.isRTL;

    // State variables
    const [user, setUser] = useState<any>(null);
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [joinYear, setJoinYear] = useState<string | null>(null); // State for join year

    // Style variables
    const textColor = theme === "dark" ? "#fff" : "#111618";
    const mutedTextColor = theme === "dark" ? "#aaa" : "#617c89";
    const backgroundColor = theme === "dark" ? "#000" : "#fff";
    const titleFont = isRTL ? "NotoSansArabic-Bold" : "NotoSans-Bold";

    /**
     * Fetches user role and account creation year from the public 'users' table.
     * Caches the role and year in local state AND localStorage.
     */
    const fetchUserData = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from("users")
                .select("role, created_at") // Fetch both fields in one query
                .eq("id", userId)
                .single();

            if (error && error.code !== "PGRST116") {
                // PGRST116 is "No rows found"
                console.error("Error fetching user data:", error.message);
                setUserRole(null);
                setJoinYear(null);
                localStorage.removeItem(`userRole-${userId}`);
                localStorage.removeItem(`joinYear-${userId}`);
                return;
            }

            if (data) {
                // 1. Set Role and Cache
                const role = data.role || null;
                setUserRole(role);
                if (role) {
                    localStorage.setItem(`userRole-${userId}`, role);
                } else {
                    localStorage.removeItem(`userRole-${userId}`);
                }

                // 2. Set Join Year from created_at and Cache
                if (data.created_at) {
                    try {
                        const year = data.created_at.substring(0, 4);
                        setJoinYear(year);
                        localStorage.setItem(`joinYear-${userId}`, year);
                    } catch (dateError) {
                        console.error(
                            "Error parsing created_at date:",
                            dateError,
                        );
                        setJoinYear(null);
                        localStorage.removeItem(`joinYear-${userId}`);
                    }
                } else {
                    setJoinYear(null);
                    localStorage.removeItem(`joinYear-${userId}`);
                }
            } else {
                setUserRole(null);
                setJoinYear(null);
                localStorage.removeItem(`userRole-${userId}`);
                localStorage.removeItem(`joinYear-${userId}`);
            }
        } catch (e) {
            console.error("Supabase call failed to fetch data:", e);
            setUserRole(null);
            setJoinYear(null);
            // On fetch failure, we keep the state as it was (might be cached data already set)
            // or if no cached data, it stays null.
        }
    };

    useEffect(() => {
        let subscription: { unsubscribe: () => void } | null = null;

        const checkSession = async () => {
            // 1. Fetch initial session status
            const {
                data: { session: initialSession },
                error: sessionError,
            } = await supabase.auth.getSession();

            if (sessionError) {
                console.error("Error fetching initial session:", sessionError);
            }

            if (initialSession) {
                const user = initialSession.user;
                setSession(initialSession);
                setUser(user);

                if (user) {
                    const userId = user.id;

                    // --- CACHING STEP 1: LOAD IMMEDIATELY FROM LOCAL STORAGE ---
                    const cachedRole = localStorage.getItem(
                        `userRole-${userId}`,
                    );
                    const cachedYear = localStorage.getItem(
                        `joinYear-${userId}`,
                    );

                    if (cachedRole) {
                        setUserRole(cachedRole); // Instant set for fast display
                    }
                    if (cachedYear) {
                        setJoinYear(cachedYear); // Instant set for fast display
                    }
                    // -----------------------------------------------------------

                    // --- CACHING STEP 2: REFRESH DATA ASYNCHRONOUSLY ---
                    // This will update the state and cache if the data has changed
                    fetchUserData(userId);
                    // --------------------------------------------------
                }
            } else {
                // If no session, clear all related state/cache info
                setSession(null);
                setUser(null);
                setUserRole(null);
                setJoinYear(null);
            }
            setLoading(false);
        };

        checkSession();

        // 2. Set up real-time listener for auth state changes
        const { data } = supabase.auth.onAuthStateChange(
            (_event, newSession) => {
                setSession(newSession);
                const user = newSession?.user || null;
                setUser(user);

                if (user) {
                    // Fetch data on auth state change (login/signup)
                    fetchUserData(user.id);
                } else {
                    setUserRole(null);
                    setJoinYear(null);
                }

                if (loading) setLoading(false);
            },
        );
        subscription = data.subscription;

        return () => {
            subscription?.unsubscribe();
        };
    }, [loading]); // Added 'loading' to dependency array for clarity, though it's mainly for cleanup

    const handleLogout = async () => {
        setLoading(true);
        const userId = supabase.auth.currentUser?.id;

        // --- CLEAR CACHE ON LOGOUT ---
        if (userId) {
            localStorage.removeItem(`userRole-${userId}`);
            localStorage.removeItem(`joinYear-${userId}`);
        }
        // -----------------------------

        const { error } = await supabase.auth.signOut();
        setLoading(false);
        if (error) {
            console.error("Error logging out:", error.message);
        }
        setUserRole(null); // Clear data on logout
        setJoinYear(null);
    };

    const navigateTo = (path: string) => {
        // Re-adjusting navigation path for guest login button
        const targetPath = path === "/auth/login" ? "/auth/login" : path;
        router.push(targetPath as never);
    };

    // --- Profile Components ---

    const UserProfileHeader = () => (
        <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
                <Image
                    source={{
                        uri:
                            user?.user_metadata?.avatar_url ||
                            "https://i.imgur.com/4ZQZ6pO.png",
                    }}
                    style={styles.avatar}
                />
            </View>
            <Text
                style={[
                    styles.username,
                    { color: textColor, fontFamily: titleFont },
                ]}
            >
                {user?.user_metadata?.full_name ||
                    user?.email ||
                    t("profileNamePlaceholder") ||
                    "User"}
            </Text>
            {/* Display Role if available */}
            {userRole && (
                <Text
                    style={[
                        styles.roleText,
                        { color: mutedTextColor, fontFamily: titleFont },
                    ]}
                >
                    {userRole.toUpperCase()}
                </Text>
            )}
            {/* Display Join Year (uses cached/live joinYear state) */}
            <Text style={[styles.joinedText, { color: mutedTextColor }]}>
                {t("joinedIn")} {joinYear}
            </Text>
        </View>
    );

    const GuestProfileHeader = () => (
        <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
                {/* Neutral Guest Avatar placeholder */}
                <Image
                    source={{ uri: "https://i.imgur.com/gK9qQ4O.png" }}
                    style={styles.avatar}
                />
            </View>
            <Text
                style={[
                    styles.username,
                    { color: textColor, fontFamily: titleFont },
                ]}
            >
                {t("loginPromptTitle") || "Welcome to the App"}
            </Text>
            <Text style={[styles.joinedText, { color: mutedTextColor }]}>
                {t("loginPromptSub") || "Log in or sign up to get started."}
            </Text>

            <TouchableOpacity
                style={[
                    styles.loginBtn,
                    {
                        backgroundColor:
                            textColor === "#fff" ? "#1c2327" : "#111618",
                    },
                ]}
                onPress={() => navigateTo("/auth/login")}
                disabled={loading}
            >
                <Text style={styles.loginBtnText}>
                    {t("loginOrSignUp") || "Log in / Sign up"}
                </Text>
            </TouchableOpacity>
        </View>
    );

    // Custom List Item Logic for Theme and Language Switch (no arrow needed)
    const ThemeSwitchListItem = () => (
        <TouchableOpacity
            style={[
                styles.listItemContainer,
                isRTL && styles.listItemContainerRTL,
            ]}
            onPress={toggleTheme}
        >
            <Text
                style={[
                    isRTL ? styles.listItemTextRTL : styles.listItemText,
                    { color: textColor, fontFamily: "NotoSans-Regular" },
                ]}
                numberOfLines={1}
            >
                {t("Theme")} (Current: {t(theme)})
            </Text>
            <ThemeToggle />
        </TouchableOpacity>
    );

    const LanguageSwitchListItem = () => (
        <TouchableOpacity
            style={[
                styles.listItemContainer,
                isRTL && styles.listItemContainerRTL,
            ]}
            onPress={() => changeLanguage()}
        >
            <Text
                style={[
                    isRTL ? styles.listItemTextRTL : styles.listItemText,
                    { color: textColor, fontFamily: "NotoSans-Regular" },
                ]}
                numberOfLines={1}
            >
                {t("Language")} (Current: {t("langCode")})
            </Text>
            <LanguageSwitcher />
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View
                style={[
                    styles.container,
                    styles.loadingContainer,
                    { backgroundColor: backgroundColor },
                ]}
            >
                <ActivityIndicator size="large" color={textColor} />
            </View>
        );
    }

    // --- Main Render ---

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <ScrollView
                style={styles.scrollViewContent}
                contentContainerStyle={styles.scrollContentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* --- Header (Corrected Flow) --- */}
                <View style={[styles.header, isRTL && styles.headerRTL]}>
                    {/* 1. Placeholder slot (First item in JSX - Left in LTR, Right in RTL) */}
                    {/* This reserves space for a potential back button or keeps the Gear icon in the corner */}
                    <View style={styles.headerPlaceholder} />

                    {/* 2. Title - Centered (Absolute) */}
                    <View style={styles.headerTitleContainer}>
                        <Text
                            style={[
                                styles.headerTitleText,
                                { color: textColor, fontFamily: titleFont },
                            ]}
                        >
                            {t("Account") || "Account"}
                        </Text>
                    </View>

                    {/* 3. Gear Icon (Last item in JSX - Right in LTR, Left in RTL for standard flow) */}
                    <TouchableOpacity
                        style={styles.settingsIcon}
                        onPress={() => navigateTo("/settings")}
                    >
                        <Gear size={26} color={textColor} />
                    </TouchableOpacity>
                </View>

                {/* --- Profile Header (Conditional) --- */}
                {user ? <UserProfileHeader /> : <GuestProfileHeader />}

                {/* --- Trips Section --- */}
                {user && (
                    <View style={styles.section}>
                        <Text
                            style={[
                                styles.sectionTitle,
                                { color: textColor, fontFamily: titleFont },
                                isRTL && styles.sectionTitleRTL,
                            ]}
                        >
                            {t("Trips") || "Trips"}
                        </Text>
                        <ListItem
                            title={t("upcomingTrips") || "Upcoming trips"}
                            onPress={() => navigateTo("/trips/upcoming")}
                            theme={theme}
                            isRTL={isRTL}
                        />
                        <ListItem
                            title={t("pastTrips") || "Past trips"}
                            onPress={() => navigateTo("/trips/past")}
                            theme={theme}
                            isRTL={isRTL}
                        />
                    </View>
                )}

                {/* --- Cars Section --- */}
                <View style={styles.section}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            { color: textColor, fontFamily: titleFont },
                            isRTL && styles.sectionTitleRTL,
                        ]}
                    >
                        {t("Cars") || "Cars"}
                    </Text>
                    <ListItem
                        title={t("savedCars") || "Saved cars"}
                        onPress={() => navigateTo("/cars/saved")}
                        theme={theme}
                        isRTL={isRTL}
                    />
                    <ListItem
                        title={t("listYourCar") || "List your car"}
                        onPress={() => navigateTo("/cars/list")}
                        theme={theme}
                        isRTL={isRTL}
                    />
                </View>

                {/* --- Settings Section (Theme & Language switches are here) --- */}
                <View style={styles.section}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            { color: textColor, fontFamily: titleFont },
                            isRTL && styles.sectionTitleRTL,
                        ]}
                    >
                        {t("Settings") || "Settings"}
                    </Text>

                    <ThemeSwitchListItem />
                    <LanguageSwitchListItem />

                    <ListItem
                        title={t("personalInfo") || "Personal information"}
                        onPress={() => navigateTo("/settings/info")}
                        theme={theme}
                        isRTL={isRTL}
                    />
                    <ListItem
                        title={t("paymentMethods") || "Payment methods"}
                        onPress={() => navigateTo("/settings/payment")}
                        theme={theme}
                        isRTL={isRTL}
                    />
                    <ListItem
                        title={t("notifications") || "Notifications"}
                        onPress={() => navigateTo("/settings/notifications")}
                        theme={theme}
                        isRTL={isRTL}
                    />
                    <ListItem
                        title={t("privacy") || "Privacy"}
                        onPress={() => navigateTo("/settings/privacy")}
                        theme={theme}
                        isRTL={isRTL}
                    />
                </View>

                {/* --- Help Section --- */}
                <View style={styles.section}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            { color: textColor, fontFamily: titleFont },
                            isRTL && styles.sectionTitleRTL,
                        ]}
                    >
                        {t("Help") || "Help"}
                    </Text>
                    <ListItem
                        title={t("helpCenter") || "Help center"}
                        onPress={() => navigateTo("/help/center")}
                        theme={theme}
                        isRTL={isRTL}
                    />
                    <ListItem
                        title={t("contactUs") || "Contact us"}
                        onPress={() => navigateTo("/help/contact")}
                        theme={theme}
                        isRTL={isRTL}
                    />
                </View>

                {/* --- Logout Button (Conditional) --- */}
                {user && (
                    <TouchableOpacity
                        style={styles.logoutBtn}
                        onPress={handleLogout}
                        disabled={loading}
                    >
                        <Text style={styles.logoutText}>
                            {t("Log Out") || "Log Out"}
                        </Text>
                    </TouchableOpacity>
                )}

                <View style={styles.scrollSpacer} />
            </ScrollView>

            {/* --- Bottom Navigation (remains fixed) --- */}
            <BottomNav />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        justifyContent: "center",
        alignItems: "center",
    },

    // --- Header/Navigation Bar ---
    header: {
        flexDirection: "row", // LTR Default: Spacer (Left) | Gear (Right)
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
        marginBottom: 10,
    },
    headerRTL: {
        flexDirection: "row-reverse", // RTL flow: Gear (Left) | Spacer (Right)
    },
    headerPlaceholder: {
        // Must match the size of the settings icon to maintain balanced spacing
        width: 26,
        height: 26,
    },
    headerTitleContainer: {
        position: "absolute",
        left: 0,
        right: 0,
        alignItems: "center",
        paddingHorizontal: 40,
    },
    headerTitleText: {
        fontSize: 18,
        fontWeight: "700", // NotoSans-Bold
        textAlign: "center",
    },
    settingsIcon: {
        zIndex: 1, // Ensure the icon is tappable
        alignItems: "center",
        justifyContent: "center",
    },

    // --- Scroll Content ---
    scrollViewContent: {
        flex: 1,
    },
    scrollContentContainer: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },

    // --- Profile Header ---
    profileHeader: {
        alignItems: "center",
        paddingVertical: 30,
    },
    avatarContainer: {
        height: 128,
        width: 128,
        borderRadius: 64,
        overflow: "hidden",
        marginBottom: 12,
        backgroundColor: "#ccc", // Add a light background for guest avatar
    },
    avatar: {
        width: "100%",
        height: "100%",
    },
    username: {
        fontSize: 22,
        fontWeight: "700", // NotoSans-Bold
        marginBottom: 4,
    },
    // Style for role text
    roleText: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 4,
        textTransform: "uppercase",
    },
    joinedText: {
        fontSize: 16,
        fontWeight: "400", // NotoSans-Regular
        color: "#617c89",
        marginBottom: 20,
    },
    loginBtn: {
        marginTop: 10,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8,
    },
    loginBtnText: {
        color: "#fff",
        fontSize: 16,
        fontFamily: "PJS-Medium",
        fontWeight: "500",
    },

    // --- Sections (Trips, Cars, Settings, Help) ---
    section: {
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700", // NotoSans-Bold
        paddingBottom: 8,
        paddingTop: 16,
    },
    sectionTitleRTL: {
        textAlign: "right",
    },

    // --- List Item ---
    listItemContainer: {
        flexDirection: "row", // LTR Default
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
    },
    listItemContainerRTL: {
        flexDirection: "row-reverse", // CRITICAL FIX: RTL flow
    },
    listItemText: {
        fontSize: 16,
        fontWeight: "400", // NotoSans-Regular
        flex: 1,
        marginRight: 10, // Margin away from LTR arrow
        textAlign: "left",
    },
    listItemTextRTL: {
        fontSize: 16,
        fontWeight: "400", // NotoSans-Regular
        flex: 1,
        marginLeft: 10, // Margin away from RTL arrow
        textAlign: "right", // Text aligns right
    },
    listItemIconWrapper: {
        alignItems: "center",
        justifyContent: "center",
        opacity: 0.5,
        width: 26, // Fixed width for alignment
    },
    listItemIconWrapperRTL: {
        transform: [{ scaleX: -1 }], // Flips the ArrowRight to ArrowLeft visually
    },

    // --- Logout Button ---
    logoutBtn: {
        marginTop: 30,
        padding: 14,
        backgroundColor: "#ef4444",
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 20,
    },
    logoutText: {
        color: "#fff",
        fontSize: 16,
        fontFamily: "PJS-Medium",
        fontWeight: "500",
    },
    scrollSpacer: {
        height: 40,
    },
});
