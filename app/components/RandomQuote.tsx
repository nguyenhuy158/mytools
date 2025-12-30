import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getRandomQuote, type Quote } from "~/utils/quotes";

export default function RandomQuote() {
  const { t, i18n } = useTranslation();
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);

  useEffect(() => {
    setCurrentQuote(getRandomQuote());
  }, []);

  const handleGetNewQuote = () => {
    setCurrentQuote(getRandomQuote());
  };

  if (!currentQuote) {
    return null;
  }

  const quoteText =
    i18n.language === "vi" ? currentQuote.vi : currentQuote.en;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
        {/* Quote Text */}
        <blockquote className="text-xl md:text-2xl leading-relaxed text-gray-900 dark:text-gray-100 italic mb-6">
          "{quoteText}"
        </blockquote>

        {/* Source */}
        {currentQuote.source && (
          <p className="text-right text-sm md:text-base text-gray-600 dark:text-gray-400 mb-8">
            — {currentQuote.source}
          </p>
        )}

        {/* Button */}
        <div className="flex justify-center">
          <button
            onClick={handleGetNewQuote}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {t("quotes.button_next")}
          </button>
        </div>
      </div>
    </div>
  );
}
