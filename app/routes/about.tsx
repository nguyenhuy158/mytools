import { useTranslation } from "react-i18next";
import { 
  Shield, Zap, Globe, 
  Check, Type, ArrowRightLeft, CaseSensitive, FileType, AlignLeft, Code, Braces, Copy, ClipboardPaste, Download, Upload, History, Trash2, Settings, MoveRight, FileDiff,
  CheckCircle2, Circle, Hammer, Lightbulb, Construction
} from "lucide-react";
import type { Route } from "./+types/about";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About - MyTools" },
    { name: "description", content: "About MyTools, its features and roadmap." },
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

  const roadmapItems = [
    {
      status: "done",
      title: "Core Tools",
      items: [
        { name: "JSON Formatter/Minifier", desc: "Format and validate JSON data", link: "/json-tools" },
        { name: "Text Diff Checker", desc: "Compare text differences", link: "/text-diff" },
        { name: "Pomodoro Timer", desc: "Productivity timer with custom settings", link: "/pomodoro" },
        { name: "Calendar & Events", desc: "Lunar calendar and event tracking", link: "/calendar" },
        { name: "Tet Countdown", desc: "Countdown to Vietnamese New Year", link: "/" },
      ]
    },
    {
      status: "planned",
      title: "Developer Tools (Sắp tới)",
      items: [
        { name: "QR Code Generator", desc: "Create QR codes for URLs and text" },
        { name: "Password Generator", desc: "Secure random password creator" },
        { name: "Base64 Converter", desc: "Encode and decode Base64 strings" },
        { name: "Hash Calculator", desc: "MD5, SHA-1, SHA-256 hash generation" },
      ]
    },
    {
      status: "idea",
      title: "Utilities & Lifestyle (Ý tưởng)",
      items: [
        { name: "Markdown Preview", desc: "Live markdown editor and preview" },
        { name: "Unit Converter", desc: "Convert length, weight, temperature" },
        { name: "Image Converter", desc: "Convert image formats client-side" },
        { name: "Internet Speed Test", desc: "Basic download speed check" },
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "planned": return <Hammer className="w-5 h-5 text-blue-500" />;
      case "idea": return <Lightbulb className="w-5 h-5 text-yellow-500" />;
      default: return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done": return "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800";
      case "planned": return "border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800";
      case "idea": return "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800";
      default: return "border-gray-200 bg-gray-50";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section 1: About */}
        <section className="max-w-4xl mx-auto space-y-8">
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
        </section>

        {/* Section 2: Features */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
             <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              {t("features.title")}
             </h2>
             <p className="text-xl text-slate-500 dark:text-gray-400">
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
        </section>

        {/* Section 3: Roadmap */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Roadmap
            </h2>
            <p className="text-xl text-slate-500 dark:text-gray-400">
              Hành trình phát triển và các tính năng sắp tới
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {roadmapItems.map((category, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col h-full">
                <div className={`px-6 py-4 border-b ${getStatusColor(category.status)} flex items-center gap-2`}>
                  {getStatusIcon(category.status)}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    {category.title}
                  </h3>
                </div>
                <ul className="divide-y divide-gray-200 dark:divide-gray-800 flex-1">
                  {category.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-start">
                        <div className="flex-1">
                          <h4 className="text-base font-medium text-gray-900 dark:text-white flex items-center gap-2">
                            {item.name}
                            {category.status === 'done' && item.link && (
                              <a href={item.link} className="text-xs font-normal text-blue-600 hover:text-blue-500 hover:underline">
                                (Open)
                              </a>
                            )}
                          </h4>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-8 border border-gray-200 dark:border-gray-800 text-center max-w-3xl mx-auto">
            <Construction className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Bạn có ý tưởng mới?</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Chúng tôi luôn lắng nghe ý kiến đóng góp để phát triển bộ công cụ hữu ích hơn.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
