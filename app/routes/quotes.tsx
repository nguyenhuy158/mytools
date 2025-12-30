import { useTranslation } from "react-i18next";
import type { MetaArgs } from "react-router";
import { PageHeader } from "~/components/PageHeader";
import RandomQuote from "~/components/RandomQuote";

export function meta({}: MetaArgs) {
  return [
    { title: "Random Quotes - ToolHub" },
    { name: "description", content: "Get inspired with daily quotes." },
  ];
}

export default function Quotes() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <PageHeader
        title={t("quotes.title")}
        description={t("quotes.description")}
      />
      <div className="container mx-auto px-4 py-12">
        <RandomQuote />
      </div>
    </div>
  );
}
