"use client";

import LanguageSwitcher from "./LanguageSwitcher";
import { getDictionary } from "@/dictionaries";
import LocaleLink from "./LocaleLink";

export default function Header({
  dictionary,
  showButtons = true,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["header"];
  showButtons?: boolean;
}) {
  return (
    <header className="w-full bg-[#990000] shadow-sm fixed min-h-[74px] top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <LocaleLink
          href="/"
          className="text-xl text-white"
          style={{ fontFamily: "var(--font-comfortaa)" }}
        >
          Glasser Study
        </LocaleLink>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          {showButtons && (
            <>
              <LocaleLink
                href="/login"
                className="text-white bg-[#B22222] font-medium px-4 py-2 rounded hover:bg-[#c92121] hover:text-white transition duration-300 ease-in-out"
              >
                {dictionary.login}
              </LocaleLink>
              <LocaleLink
                href="/signup"
                className="bg-white text-[#990000] font-medium px-4 py-2 rounded hover:bg-[#cfcfcf] transition duration-300 ease-in-out"
              >
                {dictionary.signUp}
              </LocaleLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
