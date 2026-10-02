import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Timer,
  BarChart3,
  Bookmark,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Network,
  Flame,
  FileJson,
  NotebookText,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useEffect, useState } from "react";
import { getStreak } from "../services/storageService";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/practice", label: "Practice", icon: BookOpen },
  { to: "/mock", label: "Mock Test", icon: Timer },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { to: "/custom-mocks", label: "Custom Mocks", icon: FileJson },
  { to: "/notes", label: "Notes", icon: NotebookText },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

// A trimmed subset for the mobile bottom nav bar, to avoid crowding small screens.
const MOBILE_NAV_ITEMS = [
  NAV_ITEMS[0], // Dashboard
  NAV_ITEMS[1], // Practice
  NAV_ITEMS[2], // Mock Test
  NAV_ITEMS[5], // Custom Mocks
  NAV_ITEMS[6], // Notes
  NAV_ITEMS[7], // Settings
];

export default function Layout({ children }) {
  const { theme, toggleTheme } = useTheme();
  const [streak, setStreak] = useState({ currentStreak: 0 });

  useEffect(() => {
    setStreak(getStreak());
  }, []);

  return (
    <div className="min-h-screen mesh-bg flex flex-col md:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-mist-200 dark:border-navy-700 bg-white/70 dark:bg-navy-900/70 backdrop-blur-sm sticky top-0 h-screen">
        <div className="px-5 py-6 flex items-center gap-2.5 border-b border-mist-200 dark:border-navy-700">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-signal-500 to-amber-500 flex items-center justify-center shrink-0">
            <Network size={18} className="text-navy-950" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-display font-bold text-sm leading-tight">NetPrep</p>
            <p className="text-[11px] text-navy-500 dark:text-mist-200/60 leading-tight">IT Officer Networking</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-signal-500/15 text-signal-600 dark:text-signal-400"
                    : "text-navy-700 dark:text-mist-200/80 hover:bg-mist-100 dark:hover:bg-navy-800"
                }`
              }
            >
              <Icon size={17} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-mist-200 dark:border-navy-700 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-navy-600 dark:text-mist-200/70">
            <Flame size={14} className="text-amber-500" />
            <span>{streak.currentStreak || 0} day streak</span>
          </div>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-mist-100 dark:hover:bg-navy-800 transition-colors"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </aside>

      {/* Mobile topbar */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/90 dark:bg-navy-900/90 backdrop-blur-sm border-b border-mist-200 dark:border-navy-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-signal-500 to-amber-500 flex items-center justify-center">
            <Network size={16} className="text-navy-950" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-sm">NetPrep</span>
        </div>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-mist-100 dark:hover:bg-navy-800"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </header>

      <main className="flex-1 pb-20 md:pb-6">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-navy-900/95 backdrop-blur-sm border-t border-mist-200 dark:border-navy-700 flex justify-around py-2">
        {MOBILE_NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium ${
                isActive ? "text-signal-600 dark:text-signal-400" : "text-navy-500 dark:text-mist-200/60"
              }`
            }
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
