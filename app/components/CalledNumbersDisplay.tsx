import { memo } from "react";
import { useTranslation } from "react-i18next";

interface CalledNumbersDisplayProps {
  calledNumbers: number[];
  currentNumber: number | null;
}

export const CalledNumbersDisplay = memo(function CalledNumbersDisplay({
  calledNumbers,
  currentNumber
}: CalledNumbersDisplayProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-6">
      {currentNumber !== null && (
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {t('loto.current_number')}
          </p>
          <div className="inline-block bg-yellow-400 dark:bg-yellow-600 text-gray-900 dark:text-white text-6xl md:text-8xl font-bold rounded-lg px-8 py-4 shadow-xl animate-pulse">
            {currentNumber}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          {t('loto.called_numbers')} ({calledNumbers.length}/90)
        </h3>

        {calledNumbers.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            {t('loto.no_numbers_yet')}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
            {calledNumbers.map((num) => (
              <span
                key={num}
                className={`
                  inline-flex items-center justify-center
                  w-10 h-10 rounded-md font-semibold
                  ${num === currentNumber
                    ? 'bg-yellow-400 dark:bg-yellow-600 text-gray-900 dark:text-white ring-2 ring-yellow-500'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }
                `}
              >
                {num}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
