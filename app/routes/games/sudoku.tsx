import type { Route } from "./+types/sudoku";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/PageHeader";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sudoku - Play Online" },
    { name: "description", content: "Play Sudoku online with multiple difficulty levels." },
  ];
}

export default function Sudoku() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <PageHeader
        title="Sudoku"
        description="Fill the 9x9 grid so that each column, each row, and each of the nine 3x3 subgrids contain all of the digits from 1 to 9."
      />
      <div className="mt-8 flex justify-center">
        <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
          <p className="text-center text-gray-500">Game Board Coming Soon</p>
        </div>
      </div>
    </div>
  );
}
