// Responsive navbar component
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "./LogoutButton";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useI18n } from "@/lib/i18n/context";
import { userApi } from "@/lib/api";
import type { User } from "@/types";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load current user to determine role (role_id 1 = admin, role_id 2 = user)
  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      if (!session) {
        setCurrentUser(null);
        setIsAdmin(false);
        return;
      }

      try {
        const user = await userApi.me();
        if (!cancelled) {
          setCurrentUser(user);
          setIsAdmin(user.role_id === 1);
        }
      } catch {
        if (!cancelled) {
          setCurrentUser(null);
          setIsAdmin(false);
        }
      }
    };

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [session]);

  // Don't show navbar on auth pages
  if (!session || pathname?.startsWith("/auth")) {
    return null;
  }

  const navLinks = [
    { href: "/", label: t.nav.home, icon: "🏠" },
    { href: "/diagnosis/check", label: t.nav.checkSymptoms, icon: "🔍" },
    { href: "/diagnosis/history", label: t.nav.history, icon: "📋" },
    // Single admin entry; within admin pages we show tabs for Users / Symptoms / Outcomes
    ...(isAdmin ? [{ href: "/admin/users", label: "Admin", icon: "🛠️" }] : []),
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg"
          : "bg-white shadow-sm"
      } border-b border-gray-200`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 group"
            onClick={() => setIsOpen(false)}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg
                className="w-6 h-6 md:w-7 md:h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
              Red Rose
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </span>
              </Link>
            ))}
          </div>

          {/* User Info & Actions - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            {session.user?.email && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {session.user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-gray-700 max-w-[150px] truncate">
                  {session.user.email}
                </span>
              </div>
            )}
            <LogoutButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="py-4 space-y-2 border-t border-gray-200">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all ${
                  isActive(link.href)
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="text-xl">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}

            {/* Mobile User Info */}
            {session.user?.email && (
              <div className="px-4 py-3 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {session.user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {session.user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Language Switcher */}
            <div className="px-4 py-2 border-t border-gray-200">
              <LanguageSwitcher />
            </div>

            {/* Mobile Logout */}
            <div className="px-4 py-2 border-t border-gray-200">
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
