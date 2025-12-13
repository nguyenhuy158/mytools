import { Gamepad2, Activity, Bomb, LayoutGrid, Grid3x3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../components/PageHeader";
import { ToolGrid } from "../components/ToolGrid";
import { ToolCard } from "../components/ToolCard";

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
    {
      name: t("games.sudoku.name", "Sudoku"),
      description: t("games.sudoku.description", "Classic number puzzle"),
      href: "/games/sudoku",
      icon: Grid3x3,
      color: "bg-indigo-500",
    },
    {
      name: t("games.snake.name"),
      description: t("games.snake.description"),
      href: "/games/snake",
      icon: Activity,
      color: "bg-green-600",
    },
    {
      name: t("games.minesweeper.name"),
      description: t("games.minesweeper.description"),
      href: "/games/minesweeper",
      icon: Bomb,
      color: "bg-red-500",
    },
    {
      name: t("games.tetris.name"),
      description: t("games.tetris.description"),
      href: "/games/tetris",
      icon: LayoutGrid,
      color: "bg-blue-500",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader 
        title={t("nav.games")} 
        description={t("games.description")} 
      />

      <ToolGrid>
        {games.map((game) => (
          <ToolCard
            key={game.name}
            {...game}
          />
        ))}
      </ToolGrid>
    </div>
  );
}
