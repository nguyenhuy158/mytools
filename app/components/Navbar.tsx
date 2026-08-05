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

  return (
    <nav className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link
                to="/"
                className="flex items-center gap-2.5 text-xl font-bold text-gray-900 dark:text-white hover:opacity-80 transition-opacity"
                aria-label="Home"
              >
                <img src="/favicon.png" alt="" className="w-8 h-8 object-contain rounded-lg shadow-sm" />
                <span className="hidden sm:inline bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  {t("app_name")}
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-1">
              {navigation.map((item) => {
                const active = isActivePath(pathname, item.href);
                return item.children ? (
                  <div key={item.href} className="relative group flex items-center">
                    <Link
                      to={item.href}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        active
                          ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10"
                          : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                      <ChevronDown className="h-3.5 w-3.5 text-gray-400 transition-transform duration-200 group-hover:rotate-180 group-hover:text-current" />
                    </Link>
                    <div className="absolute left-0 top-full pt-2 w-56 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50">
                       <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden p-1.5">
                        {item.children.map((child) => {
                          const childActive = isActivePath(pathname, child.href);
                          return (
                            <Link
                              key={child.href}
                              to={child.href}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                childActive
                                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10"
                                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                              }`}
                            >
                              <span
                                className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${
                                  childActive
                                    ? "bg-blue-100 dark:bg-blue-500/20"
                                    : "bg-gray-100 dark:bg-white/10"
                                }`}
                              >
                                <child.icon className="h-4 w-4" />
                              </span>
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      active
                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Mounted once, outside both conditional blocks below, so it
                shows at every breakpoint without opening a second WebSocket. */}
            <OnlineUsers />

          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <div className="hidden xl:block">
              <TetCountdown variant="compact" />
            </div>

            {/* Language Switcher */}
            <div
              onClick={toggleLanguage}
              className="bg-gray-100 dark:bg-white/10 dark:backdrop-blur-md p-1 rounded-lg flex items-center relative h-9 w-28 cursor-pointer border border-gray-300 dark:border-white/20"
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
              className="cursor-pointer p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 focus:outline-none rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>

          <div className="-mr-2 flex items-center sm:hidden gap-2">
            <button
              onClick={toggleTheme}
              className="cursor-pointer p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 focus:outline-none"
            >
              {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="cursor-pointer inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="sm:hidden bg-gray-50 dark:bg-slate-800/80 dark:backdrop-blur-md border-t border-gray-200 dark:border-white/10">
          <div className="pt-2 pb-3 px-2 space-y-1">
            {navigation.map((item) => {
              const active = isActivePath(pathname, item.href);
              return item.children ? (
                <div key={item.href} className="space-y-1">
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                      active
                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <span
                      className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${
                        active ? "bg-blue-100 dark:bg-blue-500/20" : "bg-gray-100 dark:bg-white/10"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                    </span>
                    {item.name}
                  </Link>
                  {item.children.map((child) => {
                    const childActive = isActivePath(pathname, child.href);
                    return (
                      <Link
                        key={child.href}
                        to={child.href}
                        className={`flex items-center gap-3 ml-4 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          childActive
                            ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <span
                          className={`flex items-center justify-center w-7 h-7 rounded-md shrink-0 ${
                            childActive ? "bg-blue-100 dark:bg-blue-500/20" : "bg-gray-100 dark:bg-white/10"
                          }`}
                        >
                          <child.icon className="h-3.5 w-3.5" />
                        </span>
                        {child.name}
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                    active
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <span
                    className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${
                      active ? "bg-blue-100 dark:bg-blue-500/20" : "bg-gray-100 dark:bg-white/10"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                  </span>
                  {item.name}
                </Link>
              );
            })}
              <div className="pl-3 pr-4 py-2 flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300 text-base font-medium">{t("nav.language")}</span>
               <div
                  onClick={toggleLanguage}
                  className="flex bg-gray-100 dark:bg-white/10 dark:backdrop-blur-md p-1 rounded-lg w-28 relative cursor-pointer border border-gray-300 dark:border-white/20"
                >
                   <div
                     className={`absolute w-[calc(50%-4px)] h-[calc(100%-8px)] top-1 bg-white/30 dark:bg-white/20 rounded-md shadow-lg transition-transform duration-200 ease-in-out ${
                       i18n.language === 'en' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-1'
                     }`}
                   />
                  <div className={`relative z-10 w-1/2 text-xs font-semibold py-1 text-center pointer-events-none flex items-center justify-center gap-1 ${i18n.language === 'vi' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                    <span>🇻🇳</span> VI
                  </div>
                  <div className={`relative z-10 w-1/2 text-xs font-semibold py-1 text-center pointer-events-none flex items-center justify-center gap-1 ${i18n.language === 'en' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                    <span>🇺🇸</span> EN
                  </div>
               </div>
             </div>
          </div>
        </div>
      )}
    </nav>
  );
}
