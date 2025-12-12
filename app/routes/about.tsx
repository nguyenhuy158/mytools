import { useTranslation } from "react-i18next";
import { Info, Shield, Zap, Globe } from "lucide-react";
import type { Route } from "./+types/about";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About - Case Converter" },
    { name: "description", content: "About our text case converter tool." },
  ];
}

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t("about.title")}
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-lg">
            {t("about.description")}
          </p>
        </header>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 space-y-6">
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg leading-relaxed text-slate-700 dark:text-gray-300">
              {t("about.content")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100 dark:border-gray-800">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Privacy First</h3>
              <p className="text-sm text-slate-500 dark:text-gray-400">Client-side processing only</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Lightning Fast</h3>
              <p className="text-sm text-slate-500 dark:text-gray-400">Instant conversion</p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Accessible</h3>
              <p className="text-sm text-slate-500 dark:text-gray-400">Works everywhere</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
