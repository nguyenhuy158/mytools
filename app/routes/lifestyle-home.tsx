import { Link } from "react-router";
import { Timer } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function LifestyleHome() {
  const { t } = useTranslation();

  const tools = [
    {
      name: t("pomodoro.title"),
      description: t("pomodoro.description"),
      href: "/lifestyle/pomodoro",
      icon: Timer,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-900/20",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t("nav.lifestyle")}
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-lg">
            {t("nav.lifestyle_description")}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              to={tool.href}
              className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow group"
            >
              <div className={`w-12 h-12 ${tool.bgColor} rounded-xl flex items-center justify-center mb-4 ${tool.color}`}>
                <tool.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {tool.name}
              </h3>
              <p className="text-slate-500 dark:text-gray-400 leading-relaxed">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
