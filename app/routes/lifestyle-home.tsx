import { Timer } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../components/PageHeader";
import { ToolGrid } from "../components/ToolGrid";
import { ToolCard } from "../components/ToolCard";

export default function LifestyleHome() {
  const { t } = useTranslation();

  const tools = [
    {
      name: t("pomodoro.title"),
      description: t("pomodoro.description"),
      href: "/lifestyle/pomodoro",
      icon: Timer,
      color: "bg-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader 
          title={t("nav.lifestyle")} 
          description={t("nav.lifestyle_description")} 
        />

        <ToolGrid>
          {tools.map((tool) => (
            <ToolCard
              key={tool.href}
              {...tool}
            />
          ))}
        </ToolGrid>
      </div>
    </div>
  );
}
