import { useTranslation } from "react-i18next";
import { 
  Shield, Zap, Globe, 
  Check, Type, ArrowRightLeft, CaseSensitive, FileType, AlignLeft, Code, Braces, Copy, ClipboardPaste, Download, Upload, History, Trash2, Settings, MoveRight, FileDiff 
} from "lucide-react";
import type { Route } from "./+types/about";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About - MyTools" },
    { name: "description", content: "About MyTools and its features." },
  ];
}

export default function About() {
  const { t } = useTranslation();

  const features = [
    { key: "sentence_case", icon: AlignLeft },
    { key: "lower_case", icon: CaseSensitive },
    { key: "upper_case", icon: Type },
    { key: "capitalized_case", icon: FileType },
    { key: "alternating_case", icon: ArrowRightLeft },
    { key: "title_case", icon: Check },
    { key: "inverse_case", icon: ArrowRightLeft },
    { key: "json_format", icon: Code },
    { key: "json_minify", icon: Braces },
    { key: "json_fix", icon: Code },
    { key: "json_validate", icon: Check },
    { key: "json_history", icon: History },
    { key: "json_clipboard_copy", icon: Copy },
    { key: "json_clipboard_paste", icon: ClipboardPaste },
    { key: "json_file_upload", icon: Upload },
    { key: "json_file_download", icon: Download },
    { key: "json_tab_size", icon: Settings },
    { key: "json_move_output_to_input", icon: MoveRight },
    { key: "json_history_remove", icon: Trash2 },
    { key: "text_diff", icon: FileDiff },
  ];

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

        <div className="space-y-6">
          <div className="text-center">
             <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {t("features.title")}
             </h2>
             <p className="text-slate-500 dark:text-gray-400">
              {t("features.description")}
             </p>
          </div>
          
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
    </div>
  );
}
