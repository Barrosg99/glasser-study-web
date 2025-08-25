"use client";

import LanguageSwitcher from "./LanguageSwitcher";
import { getDictionary } from "@/dictionaries";
import LocaleLink from "./LocaleLink";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { Bell, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import NotificationModal, { Notification } from "./NotificationModal";

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
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  // Mock notifications data - replace with actual data from your backend
  const [notifications] = useState<Notification[]>([
    {
      id: "1",
      message: "New message from John Doe",
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      type: "info",
      read: false,
    },
    {
      id: "2",
      message: "Your post received 5 new likes",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      type: "success",
      read: false,
    },
    {
      id: "3",
      message: "New comment on your post",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      type: "info",
      read: true,
    },
  ]);

  const notificationCount = notifications.filter((n) => !n.read).length;

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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsMenuOpen(!isMenuOpen);
                    }}
                    className="text-white p-2 hover:bg-[#c92121] rounded transition duration-300 ease-in-out"
                  >
                    <Menu size={24} />
                  </button>
                  <div className="relative">
                    <button
                      ref={notificationButtonRef}
                      onClick={() => {
                        setIsNotificationModalOpen(!isNotificationModalOpen);
                      }}
                      className={`text-white p-2 rounded transition duration-300 ease-in-out ${
                        isNotificationModalOpen
                          ? "bg-[#c92121]"
                          : "hover:bg-[#c92121]"
                      }`}
                    >
                      <Bell size={24} />
                      {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[18px] flex items-center justify-center border-2 border-white">
                          {notificationCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
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
                    href="/chat"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {dictionary.chat}
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

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={notifications}
        excludeElement={notificationButtonRef.current}
        dictionary={{
          notifications: dictionary.notifications,
          noNotifications: dictionary.noNotifications,
          markAllAsRead: dictionary.markAllAsRead,
        }}
        onMarkAsRead={(id) => {
          // Handle marking notification as read
          // In a real app, you'd update the backend here
          console.log(`Marking notification ${id} as read`);
        }}
        onMarkAllAsRead={() => {
          // Handle marking all notifications as read
          // In a real app, you'd update the backend here
          console.log("Marking all notifications as read");
        }}
      />
    </header>
  );
}
