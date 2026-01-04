// file: components/Sidebar.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Truck,
  Users,
  Sun,
  Moon,
  LogOut,
  UserCircle,
  Briefcase,
  Map,
  DollarSign,
  Package,
  PlusCircle,
  Building2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Shield,
  CreditCard,
  Globe,
  Check
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useLanguage, languages } from "@/contexts/LanguageContext";

const BACKEND_URL = "http://localhost:3001";

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, firm, logout, isWatergoAdmin, isOwner, isManager, profile } = useAuth();
  const { subscription } = useSubscription();
  const { language, setLanguage, t } = useLanguage();
  const [logoError, setLogoError] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  // Get full logo URL (handle relative paths)
  const getLogoUrl = () => {
    if (!firm?.logoUrl) return null;
    if (firm.logoUrl.startsWith('http')) return firm.logoUrl;
    return `${BACKEND_URL}${firm.logoUrl}`;
  };
  const logoUrl = getLogoUrl();

  // Reset logo error when firm changes
  useEffect(() => {
    setLogoError(false);
  }, [firm?.logoUrl]);

  // Get subscription badge label
  const getSubscriptionBadge = () => {
    if (isWatergoAdmin) return "Admin";

    if (!subscription) return "Free Trial";

    switch (subscription.status) {
      case "TRIAL_ACTIVE":
        return "Free Trial";
      case "TRIAL_EXPIRED":
        return "Expired";
      case "BASIC":
        return "Basic";
      case "PRO":
        return "Pro";
      case "MAX":
        return "Max";
      default:
        return "Free Trial";
    }
  };

  // Load collapsed state from localStorage
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  // Save collapsed state
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
  };

  // Navigation sections for admin
  const adminLinks = [
    { href: "/", icon: LayoutDashboard, label: t.nav.dashboard, section: "main" },
    { href: "/firms", icon: Building2, label: t.nav.firms, section: "main" },
    { href: "/firm-moderation", icon: Shield, label: t.nav.firmModeration, section: "main" },
    { href: "/orders", icon: ShoppingCart, label: t.nav.orders, section: "management" },
    { href: "/drivers", icon: Truck, label: t.nav.drivers, section: "management" },
    { href: "/accounts", icon: Users, label: t.nav.accounts, section: "management" },
    { href: "/billing", icon: CreditCard, label: t.nav.billing, section: "management" },
  ];

  // Navigation sections for firm
  const firmLinks = [
    { href: "/firm-dashboard", icon: LayoutDashboard, label: t.nav.dashboard, section: "main" },
    { href: "/firm-order-create", icon: PlusCircle, label: t.nav.createOrder, section: "main" },
    { href: "/firm-products", icon: Package, label: t.nav.products, section: "catalog" },
    { href: "/firm-finances", icon: DollarSign, label: t.nav.finances, section: "catalog" },
    { href: "/firm-clients", icon: UserCircle, label: t.nav.clients, section: "management" },
    { href: "/firm-orders", icon: ShoppingCart, label: t.nav.orders, section: "management" },
    { href: "/firm-drivers", icon: Truck, label: t.nav.drivers, section: "management" },
    { href: "/firm-staff", icon: Briefcase, label: t.nav.staff, section: "management" },
    { href: "/firm-regions", icon: Map, label: t.nav.regions, section: "settings" },
    { href: "/firm-settings", icon: Settings, label: t.nav.settings, section: "settings" },
    { href: "/pricing", icon: CreditCard, label: t.nav.subscription, section: "settings" },
  ];

  // Filter firm links based on role permissions
  const filteredFirmLinks = firmLinks;
  const links = isWatergoAdmin ? adminLinks : filteredFirmLinks;

  // Group links by section
  const sections = isWatergoAdmin
    ? [
        { id: "main", label: t.sections.overview },
        { id: "management", label: t.sections.management },
      ]
    : [
        { id: "main", label: t.sections.quickActions },
        { id: "catalog", label: t.sections.catalog },
        { id: "management", label: t.sections.operations },
        { id: "settings", label: t.sections.settings },
      ];

  const isActive = (href: string) => {
    if (href === "/" || href === "/firm-dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  if (!mounted) return null;

  return (
    <aside
      className={`
        ${isCollapsed ? 'w-20' : 'w-72'}
        relative flex flex-col h-screen
        bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950
        border-r border-white/5
        transition-all duration-300 ease-in-out
        shadow-2xl shadow-black/50
      `}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/5 pointer-events-none" />

      {/* Collapse Toggle Button */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-3 top-8 z-50 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-200 shadow-lg"
      >
        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Logo Section */}
      <div className={`relative p-6 ${isCollapsed ? 'px-4' : ''}`}>
        <div className={`flex ${isCollapsed ? 'justify-center' : 'items-center gap-4'}`}>
          {/* Logo Avatar */}
          <div className="relative group">
            <div className={`
              ${isCollapsed ? 'w-12 h-12' : 'w-14 h-14'}
              rounded-2xl overflow-hidden
              bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700
              flex items-center justify-center
              shadow-lg shadow-blue-500/25
              ring-2 ring-white/10
              transition-all duration-300
              group-hover:shadow-blue-500/40 group-hover:scale-105
            `}>
              {logoUrl && !logoError ? (
                <img
                  src={logoUrl}
                  alt={firm?.name || "Firm logo"}
                  className="w-full h-full object-cover"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className={`${isCollapsed ? 'text-lg' : 'text-xl'} font-bold text-white`}>
                  {(firm?.name || "W").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {/* Online status dot */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-lg">
              <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75" />
            </div>
          </div>

          {/* Firm Name & Badge */}
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-white truncate">
                {firm?.name || "WaterGo"}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    subscription?.status === "TRIAL_EXPIRED"
                      ? "bg-red-500/20 text-red-300 border-red-500/30"
                      : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                  }`}>
                  <Sparkles className="w-2.5 h-2.5" />
                  {getSubscriptionBadge()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
        {sections.map((section) => {
          const sectionLinks = links.filter(link => link.section === section.id);
          if (sectionLinks.length === 0) return null;

          return (
            <div key={section.id} className="mb-6">
              {/* Section Header */}
              {!isCollapsed && (
                <div className="px-3 mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {section.label}
                  </span>
                </div>
              )}

              {/* Section Links */}
              <div className="space-y-1">
                {sectionLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      title={isCollapsed ? link.label : undefined}
                      className={`
                        relative flex items-center gap-3
                        ${isCollapsed ? 'justify-center px-3' : 'px-4'}
                        py-3 rounded-xl
                        transition-all duration-200 group
                        ${active
                          ? 'bg-gradient-to-r from-blue-600/20 to-blue-600/10 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }
                      `}
                    >
                      {/* Active indicator */}
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-r-full shadow-lg shadow-blue-500/50" />
                      )}

                      <div className={`
                        relative flex items-center justify-center
                        ${active ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'}
                        transition-all duration-200
                      `}>
                        <Icon className={`w-5 h-5 ${active ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : ''}`} />
                      </div>

                      {!isCollapsed && (
                        <span className={`font-medium text-sm ${active ? 'text-white' : ''}`}>
                          {link.label}
                        </span>
                      )}

                      {/* Active dot indicator */}
                      {active && !isCollapsed && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-3 pb-3 space-y-1">
        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            title={isCollapsed ? languages.find(l => l.code === language)?.label : undefined}
            className={`
              w-full flex items-center gap-3
              ${isCollapsed ? 'justify-center px-3' : 'px-4'}
              py-3 rounded-xl
              text-slate-400 hover:text-white hover:bg-white/5
              transition-all duration-200 group
            `}
          >
            <Globe className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
            {!isCollapsed && (
              <span className="font-medium text-sm flex-1 text-left">
                {languages.find(l => l.code === language)?.flag} {languages.find(l => l.code === language)?.label}
              </span>
            )}
          </button>

          {/* Language Dropdown */}
          {langDropdownOpen && (
            <div className={`
              absolute bottom-full mb-2 ${isCollapsed ? 'left-full ml-2' : 'left-0 right-0'}
              bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50
              min-w-[160px]
            `}>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setLangDropdownOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5
                    text-sm transition-colors
                    ${language === lang.code
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'}
                  `}
                >
                  <span>{lang.flag}</span>
                  <span className="flex-1 text-left">{lang.label}</span>
                  {language === lang.code && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={isCollapsed ? (theme === "dark" ? t.nav.lightMode : t.nav.darkMode) : undefined}
          className={`
            w-full flex items-center gap-3
            ${isCollapsed ? 'justify-center px-3' : 'px-4'}
            py-3 rounded-xl
            text-slate-400 hover:text-white hover:bg-white/5
            transition-all duration-200 group
          `}
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 group-hover:text-amber-400 transition-colors" />
          ) : (
            <Moon className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
          )}
          {!isCollapsed && (
            <span className="font-medium text-sm">
              {theme === "dark" ? t.nav.lightMode : t.nav.darkMode}
            </span>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          title={isCollapsed ? t.nav.logout : undefined}
          className={`
            w-full flex items-center gap-3
            ${isCollapsed ? 'justify-center px-3' : 'px-4'}
            py-3 rounded-xl
            text-slate-400 hover:text-red-400 hover:bg-red-500/10
            transition-all duration-200 group
          `}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && (
            <span className="font-medium text-sm">{t.nav.logout}</span>
          )}
        </button>
      </div>

      {/* User Profile Section */}
      <div className={`
        p-4 mx-3 mb-3 rounded-2xl
        bg-gradient-to-br from-white/5 to-white/[0.02]
        border border-white/5
        ${isCollapsed ? 'px-2' : ''}
      `}>
        <div className={`flex ${isCollapsed ? 'justify-center' : 'items-center gap-3'}`}>
          {/* Avatar */}
          <div className={`
            ${isCollapsed ? 'w-10 h-10' : 'w-11 h-11'}
            rounded-xl
            bg-gradient-to-br from-emerald-500 to-teal-600
            flex items-center justify-center
            text-white font-bold text-sm
            shadow-lg shadow-emerald-500/20
            flex-shrink-0
          `}>
            {isWatergoAdmin ? "SA" : profile?.role?.charAt(0) || "U"}
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {isWatergoAdmin ? t.auth.superAdmin : profile?.role === "OWNER" ? t.auth.firmOwner : profile?.role === "MANAGER" ? t.staff.manager : t.staff.operator}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
