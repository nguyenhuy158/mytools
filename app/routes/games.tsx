import type { MetaFunction } from "react-router";
import { Outlet } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "Games - ToolHub" },
    { name: "description", content: "Play 2048, Snake, Minesweeper, Tetris, Sudoku and Loto in your browser." },
  ];
};

export default function GamesLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </div>
  );
}
