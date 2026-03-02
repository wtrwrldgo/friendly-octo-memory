// file: components/Header.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, Bell, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFirmData } from "@/contexts/FirmDataContext";

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const { orders, clients, drivers } = useFirmData();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Map pathname → page title
  const pathTitleMap: Record<string, string> = {
    "/firm-dashboard":    t.nav.dashboard,
    "/firm-orders":       t.nav.orders,
    "/firm-order-create": t.nav.createOrder,
    "/firm-clients":      t.nav.clients,
    "/firm-products":     t.nav.products,
    "/firm-drivers":      t.nav.drivers,
    "/firm-staff":        t.nav.staff,
    "/firm-finances":     t.nav.finances,
    "/firm-regions":      t.nav.regions,
    "/firm-settings":     t.nav.settings,
    "/pricing":           t.nav.subscription,
    "/":                  t.nav.dashboard,
    "/firms":             t.nav.firms,
    "/orders":            t.nav.orders,
    "/drivers":           t.nav.drivers,
    "/accounts":          t.nav.accounts,
    "/billing":           t.nav.billing,
  };

  const pageTitle = pathTitleMap[pathname] ?? t.nav.dashboard;

  // Pending orders badge
  const pendingCount = orders.filter(
    (o) => o.status === "PENDING" || o.status === "CONFIRMED" || o.status === "PREPARING"
  ).length;

  // Search results
  const query = searchQuery.toLowerCase().trim();
  const searchResults =
    query.length >= 2
      ? [
          ...orders
            .filter(
              (o) =>
                o.clientName?.toLowerCase().includes(query) ||
                String(o.orderNumber ?? "").includes(query)
            )
            .slice(0, 3)
            .map((o) => ({
              type: "order",
              label: `#${o.orderNumber ?? o.id.slice(0, 6)} — ${o.clientName}`,
              href: "/firm-orders",
            })),
          ...clients
            .filter((c) => c.name?.toLowerCase().includes(query))
            .slice(0, 3)
            .map((c) => ({ type: "client", label: c.name, href: "/firm-clients" })),
          ...drivers
            .filter((d) => d.name?.toLowerCase().includes(query))
            .slice(0, 2)
            .map((d) => ({ type: "driver", label: d.name, href: "/firm-drivers" })),
        ]
      : [];

  // Close dropdown on outside click
  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchOpen]);

  return (
    <header className="flex items-center h-16 px-4 md:px-6 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 gap-4 flex-shrink-0 z-20">
      {/* Mobile hamburger */}
      <button
        onClick={onMobileMenuToggle}
        className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Toggle menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white hidden md:block">
        {pageTitle}
      </h1>

      <div className="flex-1" />

      {/* Search */}
      <div className="relative" ref={searchRef}>
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 rounded-xl px-3 py-2 w-40 sm:w-56 md:w-64 transition-all">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder={t.common.search}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none min-w-0"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="flex-shrink-0">
              <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
            </button>
          )}
        </div>

        {/* Search results dropdown */}
        {searchOpen && searchResults.length > 0 && (
          <div className="absolute top-full mt-2 right-0 w-72 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-xl overflow-hidden z-50">
            {searchResults.map((result, i) => (
              <button
                key={i}
                onClick={() => {
                  router.push(result.href);
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                <span className="text-xs text-gray-400 capitalize w-12 flex-shrink-0">
                  {result.type}
                </span>
                <span className="truncate text-left">{result.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notifications bell */}
      <button
        onClick={() => router.push("/firm-orders")}
        className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Pending orders"
      >
        <Bell className="w-5 h-5" />
        {pendingCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
            {pendingCount > 99 ? "99+" : pendingCount}
          </span>
        )}
      </button>
    </header>
  );
}
