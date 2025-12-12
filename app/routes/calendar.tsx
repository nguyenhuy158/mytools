import { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday 
} from "date-fns";
import { Solar } from "lunar-javascript";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "Solar & Lunar Calendar" },
    { name: "description", content: "View solar and lunar dates" },
  ];
};

export default function Calendar() {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = [
    t("calendar.weekdays.mon"),
    t("calendar.weekdays.tue"),
    t("calendar.weekdays.wed"),
    t("calendar.weekdays.thu"),
    t("calendar.weekdays.fri"),
    t("calendar.weekdays.sat"),
    t("calendar.weekdays.sun"),
  ];

  const getLunarDate = (date: Date) => {
    const solar = Solar.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate());
    const lunar = solar.getLunar();
    return {
      day: lunar.getDay(),
      month: lunar.getMonth(),
      year: lunar.getYear(),
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden transition-colors duration-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                <CalendarIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {format(currentDate, "MMMM yyyy")}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToToday}
                className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors"
              >
                {t("calendar.today")}
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            {weekDays.map((day, index) => (
              <div
                key={index}
                className={`py-3 text-center text-sm font-semibold ${
                  index >= 5 ? "text-red-500 dark:text-red-400" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 bg-gray-200 dark:bg-gray-700 gap-[1px]">
            {calendarDays.map((date, index) => {
              const lunar = getLunarDate(date);
              const isCurrentMonth = isSameMonth(date, currentDate);
              const isTodayDate = isToday(date);
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;

              return (
                <div
                  key={date.toISOString()}
                  className={`min-h-[100px] p-2 bg-white dark:bg-gray-800 relative transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-750 flex flex-col justify-between ${
                    !isCurrentMonth ? "opacity-40 bg-gray-50 dark:bg-gray-800/50" : ""
                  } ${isTodayDate ? "ring-2 ring-inset ring-indigo-500 z-10" : ""}`}
                >
                  <div className="flex justify-between items-start">
                    <span
                      className={`text-lg font-semibold ${
                        isTodayDate
                          ? "w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-full -ml-1 -mt-1 shadow-sm"
                          : isWeekend
                          ? "text-red-500 dark:text-red-400"
                          : "text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {format(date, "d")}
                    </span>
                    {isTodayDate && (
                      <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        Today
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-2 text-right">
                    <div className={`text-xs ${
                        lunar.day === 1 || lunar.day === 15 ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-gray-500 dark:text-gray-400"
                      }`}>
                      <span>{lunar.day}/{lunar.month}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
