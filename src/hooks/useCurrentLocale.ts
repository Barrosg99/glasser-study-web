"use client";

import { usePathname } from "next/navigation";
import { i18n } from "../../i18n-config";

export function useCurrentLocale() {
  const pathname = usePathname();

  const locale = pathname?.split("/")[1] ?? i18n.defaultLocale;

  if (i18n.locales.includes(locale as typeof i18n.locales[number])) {
    return locale as typeof i18n.locales[number];
  }

  return i18n.defaultLocale;
}
