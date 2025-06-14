"use client";

import LanguageSwitcher from "./LanguageSwitcher";
import { getDictionary } from "@/dictionaries";
import LocaleLink from "./LocaleLink";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header({
  dictionary,
  showButtons = true,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["header"];
  showButtons?: boolean;
}) {
  const [token, setToken] = useLocalStorage<string>("token");
  const [hasMounted, setHasMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!hasMounted)
    return (
      <header className="w-full bg-[#990000] shadow-sm fixed min-h-[74px] top-0 z-50"></header>
    );

  return (
    <header className="w-full bg-[#990000] shadow-sm fixed min-h-[74px] top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center h-[74px]">
        <LocaleLink
          href="/"
          className="text-xl text-white"
          style={{ fontFamily: "var(--font-comfortaa)" }}
        >
          Glasser Study
        </LocaleLink>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          {showButtons && !token && (
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
          {token && (
            <>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => {
                    setIsMenuOpen(!isMenuOpen);
                  }}
                  className="text-white p-2 hover:bg-[#c92121] rounded transition duration-300 ease-in-out"
                >
                  <Menu size={24} />
                </button>
                <div
                  id="user-menu"
                  className={`${
                    isMenuOpen ? "block" : "hidden"
                  } absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50`}
                >
                  <LocaleLink
                    href="/profile"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {dictionary.profile}
                  </LocaleLink>
                  <LocaleLink
                    href="/groups"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {dictionary.groups}
                  </LocaleLink>
                  <LocaleLink
                    href="/posts"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {dictionary.posts}
                  </LocaleLink>
                  <button
                    onClick={() => {
                      setToken(undefined);
                      toast.success(dictionary.logoutSuccess);
                      setIsMenuOpen(false);
                      router.push("/login");
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {dictionary.logout}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
