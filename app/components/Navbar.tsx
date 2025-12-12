import { Link } from "react-router";
import { Menu, X, Home, Settings, Info, Sun, Moon, CaseUpper, FileJson } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { toast } from "sonner";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { t, i18n } = useTranslation();
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
    { name: t("nav.features"), href: "/features", icon: Settings },
    { name: t("nav.json_tools"), href: "/json-tools", icon: FileJson },
    { name: t("nav.about"), href: "/about", icon: Info },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white hover:opacity-80 transition-opacity" aria-label="Home">
                <img src="/favicon.png" alt="Logo" className="w-8 h-8 object-contain" />
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-700"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {/* Language Switcher */}
            <div 
              onClick={toggleLanguage}
              className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex items-center relative h-9 w-28 cursor-pointer"
            >
              <div 
                className={`absolute w-[calc(50%-4px)] h-[calc(100%-8px)] top-1 bg-white dark:bg-gray-600 rounded-md shadow-sm transition-transform duration-200 ease-in-out ${
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
              className="cursor-pointer p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="-mr-2 flex items-center sm:hidden gap-2">
            <button
              onClick={toggleTheme}
              className="cursor-pointer p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none"
            >
              {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="cursor-pointer inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
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

      {isOpen && (
        <div className="sm:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center">
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.name}
                </div>
              </Link>
            ))}
             <div className="pl-3 pr-4 py-2 border-l-4 border-transparent flex items-center justify-between">
               <span className="text-gray-500 dark:text-gray-400 text-base font-medium">Language</span>
               <div 
                 onClick={toggleLanguage}
                 className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-28 relative cursor-pointer"
               >
                  <div 
                    className={`absolute w-[calc(50%-4px)] h-[calc(100%-8px)] top-1 bg-white dark:bg-gray-600 rounded-md shadow-sm transition-transform duration-200 ease-in-out ${
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
