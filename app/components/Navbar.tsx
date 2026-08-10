import { Link, useLocation } from "react-router";
import { Menu, X, Home, Info, Sun, Moon, FileJson, Calendar, FileDiff, Timer, Code, Coffee, Gamepad2, Activity, Bomb, LayoutGrid, Grid3x3, Hash, Lightbulb, Rocket, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { TetCountdown } from "./TetCountdown";
import { OnlineUsers } from "./OnlineUsers";

import { toast } from "sonner";

/** Exact match for "/", prefix match for everything else — "/" must not light up on every route. */
function isActivePath(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  /** Which submenu is expanded — desktop sidebar and mobile drawer share this. */
  const [openSection, setOpenSection] = useState<string | null>(null);
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Check initial theme from localStorage or system preference
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    const currentTheme = savedTheme || systemTheme;
    setTheme(currentTheme);

    // Apply theme class
    if (currentTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      toast.success(t("nav.toast.dark_mode"));
    } else {
      document.documentElement.classList.remove("dark");
      toast.success(t("nav.toast.light_mode"));
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    toast.success(t("nav.toast.language_changed"));
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'vi' ? 'en' : 'vi';
    changeLanguage(newLang);
  };

  const navigation = [
    { name: t("nav.home"), href: "/", icon: Home },
     {
       name: t("nav.it_tools"),
       href: "/it",
       icon: Code,
       children: [
         { name: t("nav.json_tools"), href: "/it/json-tools", icon: FileJson },
         { name: t("nav.text_diff"), href: "/it/text-diff", icon: FileDiff },
         { name: t("nav.number_reading"), href: "/it/number-reading", icon: Hash },
       ]
     },
    {
      name: t("nav.lifestyle"),
      href: "/lifestyle",
      icon: Coffee,
      children: [
        { name: t("nav.pomodoro"), href: "/lifestyle/pomodoro", icon: Timer },
        { name: t("nav.quotes"), href: "/lifestyle/quotes", icon: Lightbulb },
      ]
    },
    {
      name: t("nav.games"),
      href: "/games",
      icon: Gamepad2,
      children: [
        { name: "2048", href: "/games/2048", icon: Gamepad2 },
        { name: "Sudoku", href: "/games/sudoku", icon: Grid3x3 },
        { name: "Snake", href: "/games/snake", icon: Activity },
        { name: "Minesweeper", href: "/games/minesweeper", icon: Bomb },
        { name: "Tetris", href: "/games/tetris", icon: LayoutGrid },
      ]
    },
    { name: t("nav.calendar"), href: "/calendar", icon: Calendar },
    { name: t("nav.projects"), href: "/projects", icon: Rocket },
    { name: t("nav.about"), href: "/about", icon: Info },
  ];

  // Route change closes the mobile drawer, but leaves the expanded section
  // alone — landing inside "/it/json-tools" should keep IT Tools expanded.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  function NavList({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <nav aria-label="Điều hướng chính" className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {navigation.map((item) => {
          const active = isActivePath(pathname, item.href);
          const expanded = openSection === item.href;
          return item.children ? (
            <div key={item.href} className="space-y-1">
              <div
                className={`flex items-center rounded-lg transition-colors ${
                  active
                    ? "bg-zinc-900 font-semibold text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
                    : "font-medium text-gray-600 dark:text-gray-300"
                }`}
              >
                <Link
                  to={item.href}
                  onClick={onNavigate}
                  className={`flex flex-1 items-center gap-3 px-3 py-2.5 text-sm ${
                    !active ? "hover:text-gray-900 dark:hover:text-white" : ""
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
                <button
                  type="button"
                  onClick={() => setOpenSection(expanded ? null : item.href)}
                  aria-expanded={expanded}
                  aria-label={item.name}
                  className={`cursor-pointer p-2.5 mr-1 rounded-lg ${
                    active ? "hover:bg-white/10" : "hover:bg-gray-100 dark:hover:bg-white/10"
                  }`}
                >
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
                </button>
              </div>
              {expanded && item.children.map((child) => {
                const childActive = isActivePath(pathname, child.href);
                return (
                  <Link
                    key={child.href}
                    to={child.href}
                    onClick={onNavigate}
                    className={`flex items-center gap-3 ml-4 px-3 py-2 rounded-lg text-sm transition-colors ${
                      childActive
                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <child.icon className="h-3.5 w-3.5" />
                    {child.name}
                  </Link>
                );
              })}
            </div>
          ) : (
            <Link
              key={item.href}
              to={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-zinc-900 font-semibold text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
                  : "font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    );
  }

  function SidebarFooter() {
    return (
      <div className="border-t border-gray-200 dark:border-white/10 p-3 space-y-3">
        <div className="hidden xl:block">
          <TetCountdown variant="compact" />
        </div>
        <OnlineUsers />
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div
            onClick={toggleLanguage}
            className="bg-gray-100 dark:bg-white/10 dark:backdrop-blur-md p-1 rounded-lg flex items-center relative h-9 flex-1 cursor-pointer border border-gray-300 dark:border-white/20"
          >
            <div
              className={`absolute w-[calc(50%-4px)] h-[calc(100%-8px)] top-1 bg-white/30 dark:bg-white/20 rounded-md shadow-lg transition-transform duration-200 ease-in-out ${
                i18n.language === 'en' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-1'
              }`}
            />
            <div
              className={`relative z-10 w-1/2 text-xs font-semibold text-center transition-colors duration-200 pointer-events-none flex items-center justify-center gap-1 ${
                i18n.language === 'vi' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <span>🇻🇳</span> VI
            </div>
            <div
              className={`relative z-10 w-1/2 text-xs font-semibold text-center transition-colors duration-200 pointer-events-none flex items-center justify-center gap-1 ${
                i18n.language === 'en' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <span>🇺🇸</span> EN
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="cursor-pointer p-2 h-9 w-9 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 focus:outline-none rounded-lg border border-gray-300 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Toggle Dark Mode"
          >
            {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-white sm:flex dark:border-white/10 dark:bg-slate-900">
        <Link
          to="/"
          className="flex items-center gap-2.5 border-b border-gray-200 px-4 py-4 dark:border-white/10 hover:opacity-80 transition-opacity"
          aria-label="Home"
        >
          <img src="/favicon.png" alt="" className="w-8 h-8 object-contain rounded-lg shadow-sm shrink-0" />
          <div className="min-w-0">
            <p className="text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              {t("app_name")}
            </p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">{t("slogan")}</p>
          </div>
        </Link>
        <NavList />
        <SidebarFooter />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white/90 px-4 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/80 sm:hidden">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold hover:opacity-80 transition-opacity" aria-label="Home">
          <img src="/favicon.png" alt="" className="w-7 h-7 object-contain rounded-lg shadow-sm" />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            {t("app_name")}
          </span>
        </Link>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="cursor-pointer inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 focus:outline-none"
        >
          <span className="sr-only">Open main menu</span>
          {isOpen ? <X className="block h-6 w-6" aria-hidden="true" /> : <Menu className="block h-6 w-6" aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-30 sm:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-14 bottom-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-slate-800/95">
            <NavList onNavigate={() => setIsOpen(false)} />
            <SidebarFooter />
          </div>
        </div>
      )}
    </>
  );
}
