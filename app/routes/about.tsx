import { useTranslation } from "react-i18next";
import { 
  Shield, Zap, Globe, 
  Check, Type, ArrowRightLeft, CaseSensitive, FileType, AlignLeft, Code, Braces, Copy, ClipboardPaste, Download, Upload, History, Trash2, Settings, MoveRight, FileDiff,
  CheckCircle2, Hammer, Lightbulb, Construction
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

  const roadmapItems: Array<{
    status: string;
    phase: string;
    title: string;
    items: Array<{
      name: string;
      desc: string;
      link?: string;
    }>;
  }> = [
    {
      status: "done",
      phase: "Phase 1",
      title: "Core Tools",
      items: [
        { name: "JSON Formatter/Minifier", desc: "Format and validate JSON data", link: "/it/json-tools" },
        { name: "Text Diff Checker", desc: "Compare text differences", link: "/it/text-diff" },
        { name: "Pomodoro Timer", desc: "Productivity timer with custom settings", link: "/pomodoro" },
        { name: "Calendar & Events", desc: "Lunar calendar and event tracking", link: "/calendar" },
        { name: "Tet Countdown", desc: "Countdown to Vietnamese New Year", link: "/" },
      ]
    },
    {
      status: "planned",
      phase: "Phase 2",
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
      phase: "Phase 3",
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
      case "done": return <CheckCircle2 className="w-6 h-6 text-white" />;
      case "planned": return <Hammer className="w-6 h-6 text-white" />;
      case "idea": return <Lightbulb className="w-6 h-6 text-white" />;
      default: return <Construction className="w-6 h-6 text-white" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done": return "bg-green-500 border-green-200";
      case "planned": return "bg-blue-500 border-blue-200";
      case "idea": return "bg-yellow-500 border-yellow-200";
      default: return "bg-gray-500 border-gray-200";
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
                 <h3 className="font-semibold text-slate-900 dark:text-white">{t("about.privacy_first")}</h3>
                 <p className="text-sm text-slate-500 dark:text-gray-400">{t("about.client_side_processing")}</p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Zap className="w-6 h-6" />
                </div>
                 <h3 className="font-semibold text-slate-900 dark:text-white">{t("about.lightning_fast")}</h3>
                 <p className="text-sm text-slate-500 dark:text-gray-400">{t("about.instant_conversion")}</p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <Globe className="w-6 h-6" />
                </div>
                 <h3 className="font-semibold text-slate-900 dark:text-white">{t("about.accessible")}</h3>
                 <p className="text-sm text-slate-500 dark:text-gray-400">{t("about.works_everywhere")}</p>
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

        {/* Section 3: Roadmap (Vertical Timeline) */}
        <section className="space-y-16">
          <div className="text-center max-w-2xl mx-auto">
             <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
               {t("about.roadmap")}
             </h2>
             <p className="text-xl text-slate-500 dark:text-gray-400">
               {t("about.roadmap_description")}
             </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
             {/* Central Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gray-200 dark:bg-gray-800 rounded-full" />

            <div className="space-y-16">
              {roadmapItems.map((category, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <div key={idx} className={`relative flex items-center ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
                    
                    {/* Content Box */}
                    <div className="w-1/2 px-8">
                       <div className={`text-right ${isEven ? 'text-right' : 'text-left'}`}>
                          <div className={`inline-block mb-2 font-bold uppercase tracking-wider text-sm ${
                              category.status === 'done' ? 'text-green-600 dark:text-green-400' :
                              category.status === 'planned' ? 'text-blue-600 dark:text-blue-400' :
                              'text-yellow-600 dark:text-yellow-400'
                          }`}>
                            {category.phase}
                          </div>
                          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{category.title}</h3>
                          
                          <div className={`bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 relative z-10 ${isEven ? 'ml-auto' : 'mr-auto'}`}>
                             {/* Arrow pointing to center */}
                             <div className={`absolute top-8 w-4 h-4 bg-white dark:bg-gray-900 border-t border-r border-gray-200 dark:border-gray-800 transform rotate-45 ${isEven ? '-right-2 border-l-0 border-b-0' : '-left-2 border-t-0 border-r-0 border-l border-b'}`}></div>

                             <ul className="space-y-3">
                              {category.items.map((item, itemIdx) => (
                                <li key={itemIdx} className="flex items-start gap-3">
                                  <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                    category.status === 'done' ? 'bg-green-500' :
                                    category.status === 'planned' ? 'bg-blue-500' :
                                    'bg-yellow-500'
                                  }`} />
                                  <div className={`flex-1 ${isEven ? 'text-right' : 'text-left'}`}>
                                     <span className="font-medium text-slate-900 dark:text-white block">
                                       {item.name}
                                        {item.link && (
                                         <a href={item.link} className="inline-block ml-1 text-xs font-normal text-blue-600 hover:text-blue-500 hover:underline">
                                           {t("about.open_link")}
                                         </a>
                                       )}
                                     </span>
                                    <span className="text-sm text-slate-500 dark:text-gray-400 block">{item.desc}</span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                       </div>
                    </div>

                    {/* Central Icon Hexagon */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center z-20">
                      <div className={`w-16 h-16 ${getStatusColor(category.status)} rounded-2xl rotate-45 flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-950`}>
                         <div className="-rotate-45">
                            {getStatusIcon(category.status)}
                         </div>
                      </div>
                    </div>

                    {/* Empty Space for the other side */}
                    <div className="w-1/2 px-8"></div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-8 border border-gray-200 dark:border-gray-800 text-center max-w-3xl mx-auto mt-16 relative z-10">
            <Construction className="w-12 h-12 text-gray-400 mx-auto mb-4" />
             <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t("about.new_idea_title")}</h3>
             <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
               {t("about.new_idea_description")}
             </p>
          </div>
        </section>
      </div>
    </div>
  );
}
