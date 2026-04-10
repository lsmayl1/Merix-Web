import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import az from "./locales/az.json";
import en from "./locales/en.json";
import ru from "./locales/ru.json";

i18next.use(initReactI18next).init({
  resources: {
    az: { translation: az },
    en: { translation: en },
    ru: { translation: ru },
  },
  lng: localStorage.getItem("language") || "az",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18next;
