import { useTranslation } from "react-i18next";
import { Check, Type,  ArrowRightLeft, CaseSensitive, FileType, AlignLeft } from "lucide-react";
import type { Route } from "./+types/features";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Features - Case Converter" },
    { name: "description", content: "Explore the text case conversion features." },
  ];
}

export default function Features() {
  const { t } = useTranslation();

  const features = [
    { key: "sentence_case", icon: AlignLeft },
    { key: "lower_case", icon: CaseSensitive },
    { key: "upper_case", icon: Type },
    { key: "capitalized_case", icon: FileType },
    { key: "alternating_case", icon: ArrowRightLeft },
    { key: "title_case", icon: Check },
    { key: "inverse_case", icon: ArrowRightLeft },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="space-y-2 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t("features.title")}
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-lg max-w-2xl">
            {t("features.description")}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div 
              key={feature.key}
              className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
                {t(`features.list.${feature.key}.title`)}
              </h3>
              <p className="text-slate-500 dark:text-gray-400 leading-relaxed">
                {t(`features.list.${feature.key}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
