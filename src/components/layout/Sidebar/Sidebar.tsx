"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
import {
  Home,
  PiggyBank,
  Users,
  CreditCard,
  Settings,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function useIsMobile() {
  return useSyncExternalStore(
    (callback) => {
      if (typeof window === "undefined" || !window.matchMedia) {
        return () => {};
      }
      const mql = window.matchMedia("(max-width: 767px)");
      mql.addEventListener?.("change", callback);
      return () => mql.removeEventListener?.("change", callback);
    },
    () => {
      if (typeof window === "undefined") return false;
      if (typeof window.matchMedia === "function") {
        return window.matchMedia("(max-width: 767px)").matches;
      }
      return window.innerWidth < 768;
    },
    () => false
  );
}

export interface SidebarProps {
  isMobile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobile: isMobileProp }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const detectedMobile = useIsMobile();
  const isMobile = isMobileProp ?? detectedMobile;

  const toggleRef = useRef<HTMLButtonElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  const wasOpenRef = useRef(false);

  const navItems = [
    { name: "Home", icon: Home, href: "/dashboard" },
    { name: "Savings", icon: PiggyBank, href: "/groups" },
    { name: "Groups", icon: Users, href: "/groups" },
    { name: "Payments", icon: CreditCard, href: "/payments" },
    { name: "Settings", icon: Settings, href: "/profile" },
  ];

  // Handle Escape key to close the drawer
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus management: move focus into drawer on open, return to toggle on close
  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true;
      const firstFocusable = asideRef.current?.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      toggleRef.current?.focus();
    }
  }, [isOpen]);

  // Focus trap inside open mobile drawer
  const handleDrawerKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!isOpen || !isMobile) return;

    if (event.key === "Tab") {
      const focusableElements = asideRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  const isClosedOnMobile = isMobile && !isOpen;

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className="md:hidden fixed bottom-6 right-6 z-50 bg-[#047857] text-white p-3 rounded-full shadow-xl focus:outline-none focus:ring-2 focus:ring-[#047857] focus:ring-offset-2"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
        aria-expanded={isOpen}
        aria-controls="mobile-sidebar"
      >
        {isOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
      </button>

      <aside
        id="mobile-sidebar"
        ref={asideRef}
        aria-label="Sidebar navigation"
        aria-hidden={isClosedOnMobile ? true : undefined}
        inert={isClosedOnMobile ? true : undefined}
        onKeyDown={handleDrawerKeyDown}
        className={`fixed md:static inset-y-0 left-0 z-40 transform ${
          isOpen
            ? "translate-x-0 visible opacity-100"
            : "-translate-x-full invisible pointer-events-none md:visible md:pointer-events-auto md:opacity-100"
        } md:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-[#f8faf9] border-r border-gray-200 flex flex-col h-full md:h-[calc(100vh-4rem)] shadow-2xl md:shadow-none`}
      >
        <div className="p-6">
          <p className="text-sm font-medium text-gray-500 mb-8">
            Your vault is growing
          </p>
          <nav className="space-y-2" aria-label="Main menu">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  tabIndex={isClosedOnMobile ? -1 : undefined}
                  className={`flex items-center px-4 py-3 rounded-xl transition-colors ${
                    isActive
                      ? "bg-[#5fe3a1] text-gray-900 font-semibold shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon size={20} className="mr-3" aria-hidden="true" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto p-6">
          <Link
            href="/groups"
            tabIndex={isClosedOnMobile ? -1 : undefined}
            className="block text-center w-full bg-[#047857] hover:bg-[#065f46] text-white py-3 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#047857] focus:ring-offset-2"
            onClick={() => setIsOpen(false)}
          >
            Start New Goal
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 bg-black/50 z-30 md:hidden cursor-default focus:outline-none"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
