import { Download, Copy, Trash2, History, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { Route } from "./+types/home";
import { useLocalStorageHistory } from "../utils/history";
import { downloadFile } from "../utils/download";
import * as textCase from "../utils/text-case";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ToolHub - Cloudflare" },
    { name: "description", content: "Convert text case easily." },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return { message: "Powered by Cloudflare Pages" };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const { history, setHistory, clearHistory, removeFromHistory } = useLocalStorageHistory<string>("case-converter-history");

  const addToHistory = (newText: string) => {
    if (!newText.trim()) return;
    
    setHistory((prev) => {
      // Avoid duplicates at the top of the list
      if (prev.length > 0 && prev[0] === newText) return prev;
      
      return [newText, ...prev].slice(0, 20); // Keep last 20 items
    });
  };

  const handleRemoveFromHistory = (e: React.MouseEvent, indexToRemove: number) => {
    e.stopPropagation();
    removeFromHistory(indexToRemove);
  };

  // Apply one of the pure converters from utils/text-case, then record it.
  const applyConversion = (convert: (input: string) => string) => () => {
    const res = convert(text);
    setText(res);
    addToHistory(res);
  };

  const toSentenceCase = applyConversion(textCase.toSentenceCase);
  const toLowerCase = applyConversion(textCase.toLowerCase);
  const toUpperCase = applyConversion(textCase.toUpperCase);
  const toCapitalizedCase = applyConversion(textCase.toCapitalizedCase);
  const toAlternatingCase = applyConversion(textCase.toAlternatingCase);
  const toTitleCase = applyConversion(textCase.toTitleCase);
  const toInverseCase = applyConversion(textCase.toInverseCase);

  const handleDownload = () => {
      if (!text) return;
      downloadFile(text, "text/plain", "text.txt");
      toast.success(t("home.toast.download_success"));
  };

  const handleCopy = () => {
      if (!text) return;
      navigator.clipboard.writeText(text);
      toast.success(t("home.toast.copy_success"));
  };

  const handleClear = () => {
    setText("");
    toast.info(t("home.toast.clear_success"));
  };

  const handleClearHistory = () => {
    clearHistory();
    toast.info(t("home.toast.clear_history_success"));
  };

  // Counts
  const charCount = text.length;
  // Word count logic: split by whitespace and filter empty strings
  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).filter(w => w.length > 0).length;
  // Sentence count: approximate counting .!?
  const sentenceCount = text.trim() === "" ? 0 : (text.match(/[.!?]+/g) || []).length;
  const lineCount = text === "" ? 0 : text.split(/\n/).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 items-start justify-center h-full">
        
        {/* Main Content */}
        <div className="flex-1 w-full space-y-6">
          <header className="space-y-2 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t("home.title")}
              </h1>
              <p className="text-slate-500 dark:text-gray-400 text-lg">
                  {t("home.description")}
              </p>
          </header>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-6">
            <textarea
                aria-label={t("home.title")}
                className="w-full h-80 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-950 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none resize-y text-lg text-slate-700 dark:text-gray-300 placeholder-gray-400 transition-all"
                placeholder={t("home.placeholder")}
                value={text}
                onChange={(e) => setText(e.target.value)}
            />

            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
               <div className="flex flex-wrap gap-2 flex-1">
                   <Button onClick={toSentenceCase} variant="outline">{t("home.buttons.sentence_case")}</Button>
                   <Button onClick={toLowerCase} variant="outline">{t("home.buttons.lower_case")}</Button>
                   <Button onClick={toUpperCase} variant="outline">{t("home.buttons.upper_case")}</Button>
                   <Button onClick={toCapitalizedCase} variant="outline">{t("home.buttons.capitalized_case")}</Button>
                   <Button onClick={toAlternatingCase} variant="outline">{t("home.buttons.alternating_case")}</Button>
                   <Button onClick={toTitleCase} variant="outline">{t("home.buttons.title_case")}</Button>
                   <Button onClick={toInverseCase} variant="outline">{t("home.buttons.inverse_case")}</Button>
               </div>
              
               <div className="flex flex-wrap gap-2 shrink-0 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 pt-4 md:pt-0 md:pl-4">
                   <Button onClick={handleCopy} variant="primary">
                     <span className="flex items-center gap-2">
                       <Copy className="w-4 h-4" />
                       {t("home.buttons.copy")}
                     </span>
                   </Button>
                   <Button onClick={handleDownload} variant="ghost">
                     <span className="flex items-center gap-2">
                       <Download className="w-4 h-4" />
                       {t("home.buttons.download")}
                     </span>
                   </Button>
                   <Button onClick={handleClear} variant="danger">
                     <span className="flex items-center gap-2">
                       <Trash2 className="w-4 h-4" />
                       {t("home.buttons.clear")}
                     </span>
                   </Button>
               </div>
            </div>
          </div>

          <div className="text-sm text-slate-500 dark:text-gray-500 flex justify-center gap-6 bg-white dark:bg-gray-900 py-3 px-6 rounded-full shadow-sm border border-gray-100 dark:border-gray-800 w-fit mx-auto">
              <span><strong className="text-slate-900 dark:text-gray-200">{charCount}</strong> {t("home.stats.characters")}</span>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <span><strong className="text-slate-900 dark:text-gray-200">{wordCount}</strong> {t("home.stats.words")}</span>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <span><strong className="text-slate-900 dark:text-gray-200">{sentenceCount}</strong> {t("home.stats.sentences")}</span>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <span><strong className="text-slate-900 dark:text-gray-200">{lineCount}</strong> {t("home.stats.lines")}</span>
          </div>
        </div>

        {/* History Sidebar */}
        {history.length > 0 && (
          <div className="w-full lg:w-80 shrink-0 space-y-4">
             <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <History className="w-5 h-5" />
                  {t("home.history")}
                </h3>
                <button 
                  onClick={handleClearHistory}
                  className="text-xs text-slate-500 hover:text-red-600 transition-colors"
                >
                  {t("home.clear_all")}
                </button>
             </div>
             
             <div className="space-y-3">
                {history.map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      setText(item);
                      toast.success(t("home.toast.history_restored"));
                    }}
                    className="group relative bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer shadow-sm transition-all hover:shadow-md"
                  >
                    {/* Right padding clears the always-visible action bar. */}
                    <p className="text-sm text-slate-600 dark:text-gray-300 line-clamp-3 font-mono break-words pr-24 md:pr-16">
                      {item}
                    </p>
                    {/*
                      Always visible up to md: a touch screen never hovers, so
                      the reveal-on-hover version left these unreachable on a
                      phone — with no other way to delete an entry.
                    */}
                    <div className="absolute top-1 right-1 md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100 transition-opacity flex gap-0.5 bg-white/95 dark:bg-gray-800/95 p-0.5 rounded-md shadow-sm">
                       <button
                         onClick={(e) => handleRemoveFromHistory(e, idx)}
                         className="w-11 h-11 md:w-8 md:h-8 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 rounded transition-colors"
                         title={t("home.remove_item")}
                         aria-label={t("home.remove_item")}
                       >
                         <X className="w-4 h-4" />
                       </button>
                       <div className="w-px self-stretch my-2 bg-gray-200 dark:bg-gray-700"></div>
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
                           setText(item);
                           toast.success(t("home.toast.history_restored"));
                         }}
                         className="w-11 h-11 md:w-8 md:h-8 flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-600 rounded transition-colors"
                         title={t("home.restore_item")}
                         aria-label={t("home.restore_item")}
                       >
                          <RotateCcw className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

      </div>
    </div>
  );
}

function Button({ children, onClick, variant = 'outline' }: { children: React.ReactNode, onClick: () => void, variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' }) {
    const baseClass = "px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-900 cursor-pointer select-none flex items-center justify-center";
    
    const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 focus:ring-blue-500",
        secondary: "bg-gray-100 hover:bg-gray-200 text-slate-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200",
        outline: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-sm",
        ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-slate-600 dark:text-gray-400",
        danger: "bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400"
    };

    return (
        <button onClick={onClick} className={`${baseClass} ${variants[variant]}`}>
            {children}
        </button>
    )
}
