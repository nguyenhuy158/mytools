import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "~/components/PageHeader";
import { toEnglish, toVietnamese } from "~/utils/number-to-words";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "Number Reading - ToolHub" },
    { name: "description", content: "Learn to read large numbers in English and Vietnamese." },
  ];
};

export default function NumberReading() {
  const { t, i18n } = useTranslation();
  const [input, setInput] = useState("");
  
  // Clean input to get number string
  const cleanInput = input.replace(/[^0-9]/g, "");
  
  // Format input for display based on locale
  const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';
  const displayInput = cleanInput ? parseInt(cleanInput).toLocaleString(locale) : "";
  
  const englishText = cleanInput ? toEnglish(cleanInput) : "";
  const vietnameseText = cleanInput ? toVietnamese(cleanInput) : "";
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t("number_reading.toast_copied"));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PageHeader 
        title={t("number_reading.title")} 
        description={t("number_reading.description")} 
      />
      
      <div className="mt-12 max-w-3xl mx-auto space-y-8">
        {/* Input Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("number_reading.input_label")}
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => {
                 // Allow digits and commas/spaces only
                 if (/^[0-9,.\s]*$/.test(e.target.value)) {
                    setInput(e.target.value);
                 }
              }}
              placeholder="e.g. 123456"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
            />
            {displayInput && (
              <div className="mt-2 text-right text-sm text-gray-500 dark:text-gray-400 font-mono">
                {displayInput}
              </div>
            )}
        </div>

        {/* Results */}
        {cleanInput && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* English */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 relative group transition-colors hover:border-indigo-300 dark:hover:border-indigo-700">
               <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🇺🇸</span>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">English</h3>
                  </div>
                  <button 
                    onClick={() => handleCopy(englishText)}
                    className="p-2 text-gray-400 hover:text-indigo-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Copy"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
               </div>
               <p className="text-xl text-gray-800 dark:text-gray-200 capitalize leading-relaxed">
                 {englishText}
               </p>
            </div>

            {/* Vietnamese */}
             <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 relative group transition-colors hover:border-indigo-300 dark:hover:border-indigo-700">
               <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🇻🇳</span>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tiếng Việt</h3>
                  </div>
                   <button 
                    onClick={() => handleCopy(vietnameseText)}
                    className="p-2 text-gray-400 hover:text-indigo-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Copy"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
               </div>
               <p className="text-xl text-gray-800 dark:text-gray-200 capitalize leading-relaxed">
                 {vietnameseText}
               </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
