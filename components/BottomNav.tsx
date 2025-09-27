import { View, TouchableOpacity, Text, StyleSheet, I18nManager } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useThemeContext } from "@/context/ThemeContext";
import { useI18n } from "@/context/I18nContext";
import { 
    House, 
    MagnifyingGlass, 
    Tray, 
    User,
    IconProps
} from "phosphor-react-native";

// Map Ionicon names to Phosphor Components
const IconMap = {
    "home-outline": House,
    "search-outline": MagnifyingGlass,
    "chatbubble-outline": Tray,
    "person-outline": User,
};

// Custom Icon Component to handle the dynamic Phosphor import and styling
interface NavIconProps {
    name: keyof typeof IconMap;
    color: string;
    weight: IconProps['weight'];
}

const NavIcon = ({ name, color, weight }: NavIconProps) => {
    const PhosphorIcon = IconMap[name];
    if (!PhosphorIcon) return null;

    return (
        <View style={styles.iconWrapper}> 
            {/* ICON SIZE INCREASED TO 26 FOR BETTER RESOLUTION PERCEPTION */}
            <PhosphorIcon size={26} color={color} weight={weight} />
        </View>
    );
};


export default function BottomNav() {
    const { theme } = useThemeContext();
    const { t } = useI18n();
    const router = useRouter();
    const pathname = usePathname();

    // --- NEW COLOR MAPPING BASED ON LIGHT/DARK THEME ---
    const isDark = theme === "dark";

    // Light Theme Colors (from previous logic)
    const lightBg = "#fff";
    const lightBorder = "#f0f3f4";
    const lightActive = "#111618";
    const lightInactive = "#617c89";

    // Dark Theme Colors (from your new HTML specification)
    const darkBg = "#1c2327";
    const darkBorder = "#283339";
    const darkActive = "#fff";     // text-white
    const darkInactive = "#9db0b9"; // text-[#9db0b9]

    const backgroundColor = isDark ? darkBg : lightBg;
    const borderColor = isDark ? darkBorder : lightBorder;
    const activeColor = isDark ? darkActive : lightActive;
    const inactiveColor = isDark ? darkInactive : lightInactive;
    // --------------------------------------------------

    const items = [
        { label: t("home"), icon: "home-outline" as keyof typeof IconMap, route: "/" },
        { label: t("search"), icon: "search-outline" as keyof typeof IconMap, route: "/search" },
        { label: t("inbox"), icon: "chatbubble-outline" as keyof typeof IconMap, route: "/inbox" },
        { label: t("profile"), icon: "person-outline" as keyof typeof IconMap, route: "/profile" },
    ];

    return (
        <View
            style={[
                styles.container,
                { 
                    backgroundColor: backgroundColor,
                    borderTopColor: borderColor,
                },
            ]}
        >
            <View style={styles.itemsRow}>
                {items.map((item) => {
                    const isActive = pathname === item.route;
                    const color = isActive ? activeColor : inactiveColor;
                    const weight = isActive ? "fill" : "regular"; 

                    return (
                        <TouchableOpacity
                            key={item.route}
                            style={styles.item}
                            onPress={() => router.push(item.route)}
                        >
                            <NavIcon 
                                name={item.icon}
                                color={color}
                                weight={weight}
                            />
                            <Text
                                style={[
                                    styles.label,
                                    { color: color }
                                ]}
                            >
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
            {/* The bottom margin/spacer div */}
            <View style={[styles.bottomSpacer, { backgroundColor: backgroundColor }]} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        borderTopWidth: 1, 
        zIndex: 10, 
    },
    itemsRow: {
        flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
        justifyContent: "space-around",
        alignItems: 'flex-end',
        paddingHorizontal: 16, 
        paddingTop: 8, 
        paddingBottom: 12, 
    },
    item: {
        alignItems: "center",
        justifyContent: "flex-end",
        flex: 1, 
        gap: 4, 
        marginHorizontal: 4, 
    },
    iconWrapper: {
        // INCREASED HEIGHT TO ACCOMMODATE LARGER ICON
        height: 34, 
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        // INCREASED FONT SIZE FOR BETTER CLARITY
        fontSize: 13,
        fontFamily: 'PJS-Medium',
        letterSpacing: 0.2, 
        textAlign: 'center', 
    },
    bottomSpacer: {
        height: 20, 
        width: '100%',
    }
});
