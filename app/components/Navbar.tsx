import { Link } from "react-router";
import { Menu, X, Home, Settings, Info, Globe } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const navigation = [
    { name: t("nav.home"), href: "/", icon: Home },
    { name: t("nav.features"), href: "/features", icon: Settings },
    { name: t("nav.about"), href: "/about", icon: Info },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-900">
                {t("app_name")}
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
             <div className="flex items-center space-x-2">
                <button 
                  onClick={() => changeLanguage("vi")} 
                  className={`p-1 rounded ${i18n.language === 'vi' ? 'bg-gray-200' : ''}`}
                >
                  VI
                </button>
                <span className="text-gray-300">|</span>
                <button 
                  onClick={() => changeLanguage("en")}
                  className={`p-1 rounded ${i18n.language === 'en' ? 'bg-gray-200' : ''}`}
                >
                  EN
                </button>
             </div>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
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
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center">
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.name}
                </div>
              </Link>
            ))}
             <div className="pl-3 pr-4 py-2 border-l-4 border-transparent">
               <div className="flex items-center space-x-4">
                  <button onClick={() => changeLanguage("vi")} className={i18n.language === 'vi' ? 'font-bold' : ''}>Tiếng Việt</button>
                  <button onClick={() => changeLanguage("en")} className={i18n.language === 'en' ? 'font-bold' : ''}>English</button>
               </div>
             </div>
          </div>
        </div>
      )}
    </nav>
  );
}
