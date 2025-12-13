import { Link } from "react-router";
import { Gamepad2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function GamesHome() {
  const { t } = useTranslation();

  const games = [
    {
      name: t("games.2048.name"),
      description: t("games.2048.description"),
      href: "/games/2048",
      icon: Gamepad2,
      color: "bg-yellow-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {t("nav.games")}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          {t("games.description")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <Link
            key={game.name}
            to={game.href}
            className="group relative bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200 dark:border-gray-800"
          >
            <div className={`h-2 absolute top-0 left-0 right-0 ${game.color}`} />
            <div className="p-6">
              <div className={`w-12 h-12 ${game.color} rounded-xl flex items-center justify-center mb-4 text-white shadow-lg`}>
                <game.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {game.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {game.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
