import { FileJson, FileDiff, Image } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../components/PageHeader";
import { ToolGrid } from "../components/ToolGrid";
import { ToolCard } from "../components/ToolCard";

export default function ITToolsLanding() {
  const { t } = useTranslation();

  const tools = [
    {
      name: t("it_tools.json_tools.name"),
      description: t("it_tools.json_tools.description"),
      href: "/it/json-tools",
      icon: FileJson,
      color: "bg-blue-600",
    },
    {
      name: t("it_tools.text_diff.name"),
      description: t("it_tools.text_diff.description"),
      href: "/it/text-diff",
      icon: FileDiff,
      color: "bg-green-600",
    },
    {
      name: t("it_tools.image_tools.name"),
      description: t("it_tools.image_tools.description"),
      href: "/it/image-tools",
      icon: Image,
      color: "bg-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader 
          title={t("it_tools.title")} 
          description={t("it_tools.description")} 
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
