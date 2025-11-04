// file: components/Sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Truck, Users, Sparkles, Sun, Moon, LogOut, UserCircle, Briefcase, Map, DollarSign, Package, PlusCircle } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  // Different navigation for admin vs firm owner
  const adminLinks = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/orders", icon: ShoppingCart, label: "Orders" },
    { href: "/drivers", icon: Truck, label: "Drivers" },
    { href: "/accounts", icon: Users, label: "Accounts" },
  ];

  const firmLinks = [
    { href: "/firm-dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/firm-order-create", icon: PlusCircle, label: "Create Order" },
    { href: "/firm-products", icon: Package, label: "Products" },
    { href: "/firm-finances", icon: DollarSign, label: "Finances" },
    { href: "/firm-clients", icon: UserCircle, label: "Clients" },
    { href: "/firm-orders", icon: ShoppingCart, label: "Orders" },
    { href: "/firm-drivers", icon: Truck, label: "Drivers" },
    { href: "/firm-staff", icon: Briefcase, label: "Staff" },
    { href: "/firm-regions", icon: Map, label: "Regions" },
  ];

  const links = user?.type === "admin" ? adminLinks : firmLinks;

  const isActive = (href: string) => {
    if (href === "/" || href === "/firm-dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-72 gradient-navy text-white flex flex-col shadow-2xl">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="text-white">Water</span>
              <span className="text-blue-400">Go</span>
            </h1>
            <p className="text-xs text-blue-200">Platform CRM</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                active
                  ? "bg-white/15 shadow-lg backdrop-blur-sm"
                  : "hover:bg-white/10"
              }`}
            >
              {Icon && (
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                  active ? "text-blue-200" : "text-white/70"
                }`} />
              )}
              <span className={`font-medium ${active ? "text-white" : "text-white/80"}`}>
                {link.label}
              </span>
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-4 space-y-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 hover:bg-white/10 group"
        >
          {theme === "dark" ? (
            <>
              <Sun className="w-5 h-5 text-white/70 transition-transform group-hover:scale-110" />
              <span className="font-medium text-white/80">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-5 h-5 text-white/70 transition-transform group-hover:scale-110" />
              <span className="font-medium text-white/80">Dark Mode</span>
            </>
          )}
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 hover:bg-red-500/20 group text-red-300 hover:text-red-200"
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:scale-110" />
          <span className="font-medium">Logout</span>
        </button>
      </div>

      <div className="p-6 border-t border-white/10 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
            {user?.type === "admin" ? "SA" : "FO"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.type === "admin" ? "Super Admin" : "Firm Owner"}
            </p>
            <p className="text-xs text-blue-200 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
