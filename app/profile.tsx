import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeContext } from "@/context/ThemeContext";
import { useI18n } from "@/context/I18nContext";
import BottomNav from "@/components/BottomNav";
import ThemeToggle from "@/components/ThemeToggle"; // Re-added as a list item
import LanguageSwitcher from "@/components/LanguageSwitcher"; // Re-added as a list item
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { 
    Gear, 
    ArrowRight // Imported ArrowRight from Phosphor
} from "phosphor-react-native"; 

// --- Reusable Component Mimicking HTML/Tailwind List Item ---
const ListItem = ({ title, onPress, theme }) => {
    const iconColor = theme === "dark" ? "#fff" : "#111618";

    return (
        <TouchableOpacity style={styles.listItemContainer} onPress={onPress}>
            <Text 
                style={[ 
                    styles.listItemText, 
                    { color: iconColor }, 
                ]} 
                numberOfLines={1}
            >
                {title}
            </Text>
            {/* Right Arrow Icon (Using Phosphor Icon) */}
            <View style={styles.listItemIconWrapper}>
                {/* Icon size increased to 26 for better clarity */}
                <ArrowRight size={26} color={iconColor} weight="regular" /> 
            </View>
        </TouchableOpacity>
    );
};

export default function Profile() {
    const { theme, toggleTheme } = useThemeContext() || { theme: "light", toggleTheme: () => {} }; 
    const { t, changeLanguage } = useI18n() || { t: (key) => key, changeLanguage: () => {} }; 
    const router = useRouter(); 

    const [user, setUser] = useState<any>({ 
        user_metadata: { 
            full_name: "Sophia Carter", 
            avatar_url: "https://i.imgur.com/4ZQZ6pO.png", 
            joined_year: "2021",
        }, 
        email: "sophia.carter@example.com", 
    }); 
    const [loading, setLoading] = useState(false);

    useEffect(() => { 
        const { data: subscription } = supabase.auth.onAuthStateChange( 
            (_event, session) => { /* ... */ }, 
        ); 
        return () => { 
            subscription?.subscription.unsubscribe(); 
        }; 
    }, []); 

    const handleLogout = async () => { 
        console.log("Logging out..."); 
    }; 

    const navigateTo = (path) => { 
        console.log(`Navigating to ${path}`); 
    }; 

    const textColor = theme === "dark" ? "#fff" : "#111618"; 
    const mutedTextColor = theme === "dark" ? "#aaa" : "#617c89"; 
    const backgroundColor = theme === "dark" ? "#000" : "#fff"; 

    if (loading) {
        return (
            <View 
                style={[
                    styles.container, 
                    styles.loadingContainer,
                    { backgroundColor: backgroundColor },
                ]}
            >
                <ActivityIndicator 
                    size="large" 
                    color={textColor}
                />
            </View>
        );
    }

    // Custom List Item Logic for Theme and Language Switch
    const ThemeSwitchListItem = () => (
        <TouchableOpacity style={styles.listItemContainer} onPress={toggleTheme}>
            <Text 
                style={[styles.listItemText, { color: textColor }]}
                numberOfLines={1}
            >
                {t("Theme")} (Current: {t(theme)})
            </Text>
            {/* Using the component directly for the toggle logic/visual */}
            <ThemeToggle /> 
        </TouchableOpacity>
    );

    const LanguageSwitchListItem = () => (
        <TouchableOpacity style={styles.listItemContainer} onPress={() => changeLanguage()}>
            <Text 
                style={[styles.listItemText, { color: textColor }]}
                numberOfLines={1}
            >
                {t("Language")} (Current: {t("langCode")})
            </Text>
            {/* Using the component directly for the switcher logic/visual */}
            <LanguageSwitcher />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>

            <ScrollView 
                style={styles.scrollViewContent} 
                contentContainerStyle={styles.scrollContentContainer} 
                showsVerticalScrollIndicator={false} 
            >
                {/* --- Header (Now scrolling) --- */}
                <View 
                    style={styles.header}
                >
                    {/* Title - Centered */}
                    <View style={styles.headerTitleContainer}>
                        <Text style={[styles.headerTitleText, { color: textColor }]}>
                            {t("Account") || "Account"}
                        </Text>
                    </View>

                    {/* Gear Icon - Right Aligned */}
                    <TouchableOpacity style={styles.settingsIcon} onPress={() => navigateTo("/settings")}> 
                        {/* Increased size to 26 for better visibility and vertical center */}
                        <Gear size={26} color={textColor} /> 
                    </TouchableOpacity> 
                </View>

                {/* --- Profile Header --- */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{
                                uri: user?.user_metadata?.avatar_url || "https://i.imgur.com/4ZQZ6pO.png",
                            }}
                            style={styles.avatar}
                        />
                    </View>
                    <Text style={[styles.username, { color: textColor }]}>
                        {user?.user_metadata?.full_name || t("profileNamePlaceholder") || "Guest User"}
                    </Text>
                    <Text style={[styles.joinedText, { color: mutedTextColor }]}>
                        {t("joinedIn", { year: user?.user_metadata?.joined_year }) || 
                            `Joined in ${user?.user_metadata?.joined_year || "N/A"}`}
                    </Text>
                </View>

                {/* --- Trips Section --- */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>
                        {t("Trips") || "Trips"}
                    </Text>
                    <ListItem title={t("upcomingTrips") || "Upcoming trips"} onPress={() => navigateTo("/trips/upcoming")} theme={theme} />
                    <ListItem title={t("pastTrips") || "Past trips"} onPress={() => navigateTo("/trips/past")} theme={theme} />
                </View>

                {/* --- Cars Section --- */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>
                        {t("Cars") || "Cars"}
                    </Text>
                    <ListItem title={t("savedCars") || "Saved cars"} onPress={() => navigateTo("/cars/saved")} theme={theme} />
                    <ListItem title={t("listYourCar") || "List your car"} onPress={() => navigateTo("/cars/list")} theme={theme} />
                </View>

                {/* --- Settings Section (Theme & Language switches are here) --- */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>
                        {t("Settings") || "Settings"}
                    </Text>

                    {/* Theme and Language Switchers kept as list items */}
                    <ThemeSwitchListItem />
                    <LanguageSwitchListItem />

                    <ListItem title={t("personalInfo") || "Personal information"} onPress={() => navigateTo("/settings/info")} theme={theme} />
                    <ListItem title={t("paymentMethods") || "Payment methods"} onPress={() => navigateTo("/settings/payment")} theme={theme} />
                    <ListItem title={t("notifications") || "Notifications"} onPress={() => navigateTo("/settings/notifications")} theme={theme} />
                    <ListItem title={t("privacy") || "Privacy"} onPress={() => navigateTo("/settings/privacy")} theme={theme} />
                </View>

                {/* --- Help Section --- */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>
                        {t("Help") || "Help"}
                    </Text>
                    <ListItem title={t("helpCenter") || "Help center"} onPress={() => navigateTo("/help/center")} theme={theme} />
                    <ListItem title={t("contactUs") || "Contact us"} onPress={() => navigateTo("/help/contact")} theme={theme} />
                </View>

                {/* --- Logout Button --- */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}> 
                    <Text style={styles.logoutText}>{t("Log Out") || "Log Out"}</Text> 
                </TouchableOpacity> 

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

    // --- Header/Navigation Bar (Scrolling) ---
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10, 
        marginBottom: 10,
    },
    headerTitleContainer: {
        position: 'absolute', 
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 40, 
    },
    headerTitleText: {
        fontSize: 18,
        // Custom Font: Noto Sans Bold (700)
        fontFamily: 'NotoSans-Bold', 
        textAlign: "center",
        // Removed fontWeight: "bold"
    },
    settingsIcon: {
        marginLeft: 'auto',
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
    },
    avatar: {
        width: "100%",
        height: "100%",
    },
    username: {
        fontSize: 22,
        // Custom Font: Noto Sans Bold (700)
        fontFamily: 'NotoSans-Bold',
        marginBottom: 4,
        // Removed fontWeight: "bold"
    },
    joinedText: {
        fontSize: 16,
        // Custom Font: Noto Sans Regular (400)
        fontFamily: 'NotoSans-Regular',
        color: "#617c89",
        marginBottom: 20,
        // Removed fontWeight: "normal"
    },

    // --- Sections (Trips, Cars, Settings, Help) ---
    section: {
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        // Custom Font: Noto Sans Bold (700)
        fontFamily: 'NotoSans-Bold',
        paddingBottom: 8,
        paddingTop: 16,
        // Removed fontWeight: "bold"
    },

    // --- List Item ---
    listItemContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
    },
    listItemText: {
        fontSize: 16,
        // Custom Font: Noto Sans Regular (400)
        fontFamily: 'NotoSans-Regular',
        flex: 1,
        marginRight: 10,
        // Removed fontWeight: "normal"
    },
    listItemIconWrapper: {
        alignItems: "center",
        justifyContent: "center",
        opacity: 0.5,
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
        // Custom Font: Plus Jakarta Sans Medium (500)
        fontFamily: 'PJS-Medium', 
        // Removed fontWeight: "600"
    },
    scrollSpacer: {
        height: 40
    }
});