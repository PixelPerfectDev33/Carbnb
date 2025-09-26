import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18nManager } from "react-native";
import en from "@/assets/locales/en.json";
import fr from "@/assets/locales/fr.json";
import ar from "@/assets/locales/ar.json";

// i18n setup
i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    ar: { translation: ar },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

const I18nContext = createContext<{
  currentLang: string;
  changeLanguage: (lng: string) => void;
  t: (key: string) => string;
}>({
  currentLang: "en",
  changeLanguage: () => {},
  t: (key: string) => key,
});

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  const [currentLang, setLang] = useState("en");

  // 🔄 Load saved language
  useEffect(() => {
    (async () => {
      const savedLang = await AsyncStorage.getItem("lang");
      if (savedLang) {
        i18n.changeLanguage(savedLang);
        setLang(savedLang);
        I18nManager.forceRTL(savedLang === "ar");
      }
    })();
  }, []);

  const changeLanguage = async (lng: string) => {
    i18n.changeLanguage(lng);
    setLang(lng);
    await AsyncStorage.setItem("lang", lng);

    // For RTL changes, you might need to handle layout direction differently
    // Instead of reloading, consider using a state to trigger re-render
    I18nManager.forceRTL(lng === "ar");

    // The language change should take effect immediately without app restart
    // for most cases, unless you're dealing with deep RTL layout changes
  };

  return (
    <I18nContext.Provider value={{ currentLang, changeLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);