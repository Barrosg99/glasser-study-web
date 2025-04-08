import "server-only";
import type { Locale } from "../../i18n-config";

const dictionaries = {
  en: () => import("./languages/en.json").then((module) => module.default),
  pt: () => import("./languages/pt.json").then((module) => module.default),
};

export const getDictionary = async (locale: Locale) =>
  dictionaries[locale]?.() ?? dictionaries.en();
