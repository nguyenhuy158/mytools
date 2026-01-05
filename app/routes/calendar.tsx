import { useState, useEffect } from "react";
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
  isToday,
  parse,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  isAfter,
  startOfDay
} from "date-fns";
import { Solar } from "lunar-javascript";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Moon, Sun } from "lucide-react";
import type { MetaFunction } from "react-router";

interface Holiday {
  date: string; // DD/MM/YYYY
  lunarDate?: string;
  name: string;
  type: "solar" | "lunar";
}

export const meta: MetaFunction = () => {
  return [
    { title: "Solar & Lunar Calendar" },
    { name: "description", content: "View solar and lunar dates" },
  ];
};

export default function Calendar() {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetch("/api/holidays")
      .then((res) => res.json())
      .then((data) => {
        const typedData = data as { holidays: Holiday[] };
        setHolidays(typedData.holidays);
      })
      .catch((err) => console.error("Failed to fetch holidays:", err));
  }, []);

  // Update current time every minute for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const getHolidayForDate = (date: Date) => {
    const dateStr = format(date, "dd/MM/yyyy");
    return holidays.find((h) => h.date === dateStr);
  };

  const parseHolidayDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split("/").map(Number);
    return new Date(year, month - 1, day);
  };

  const getUpcomingHolidays = () => {
    const now = startOfDay(currentTime);
    return holidays
      .map((holiday) => ({
        ...holiday,
        dateObj: parseHolidayDate(holiday.date),
      }))
      .filter((holiday) => isAfter(holiday.dateObj, now) || isSameDay(holiday.dateObj, now))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
      .slice(0, 15);
  };

  const getCountdown = (targetDate: Date) => {
    const now = currentTime;
    const days = differenceInDays(targetDate, now);

    if (days > 0) {
      return `${days} ${days === 1 ? 'day' : 'days'}`;
    } else if (days === 0) {
      const hours = differenceInHours(targetDate, now);
      if (hours > 0) {
        return `${hours}h`;
      }
      const minutes = differenceInMinutes(targetDate, now);
      return minutes > 0 ? `${minutes}m` : 'Now';
    }
    return 'Today';
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const upcomingHolidays = getUpcomingHolidays();

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
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Calendar Section */}
          <div className="flex-1">
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
              const holiday = getHolidayForDate(date);

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
                          : isWeekend || holiday
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

                  <div className="mt-2 space-y-1">
                    <div className={`text-xs text-right ${
                        lunar.day === 1 || lunar.day === 15 ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-gray-500 dark:text-gray-400"
                      }`}>
                      <span>{lunar.day}/{lunar.month}</span>
                    </div>
                    {holiday && (
                      <div className="text-[10px] text-red-600 dark:text-red-400 font-medium leading-tight line-clamp-2" title={holiday.name}>
                        {holiday.name.replace(" năm 2026", "")}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="lg:w-80 w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden transition-colors duration-200">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-500 to-purple-600">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-white" />
              <h2 className="text-lg font-semibold text-white">
                {t("calendar.upcoming_events", "Upcoming Events")}
              </h2>
            </div>
          </div>

          <div className="max-h-[600px] overflow-y-auto">
            {upcomingHolidays.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <p className="text-sm">{t("calendar.no_upcoming_events", "No upcoming events")}</p>
              </div>
            ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {upcomingHolidays.map((holiday, index) => {
                      const countdown = getCountdown(holiday.dateObj);
                      const isToday = isSameDay(holiday.dateObj, currentTime);

                      return (
                        <div
                          key={`${holiday.date}-${index}`}
                          className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                            isToday ? "bg-indigo-50 dark:bg-indigo-900/20" : ""
                          }`}
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
                                {holiday.name.replace(" năm 2026", "")}
                              </h3>
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <span>{format(holiday.dateObj, "dd/MM/yyyy")}</span>
                                {holiday.lunarDate && (
                                  <>
                                    <span>•</span>
                                    <span className="text-indigo-600 dark:text-indigo-400">
                                      {holiday.lunarDate}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col items-end flex-shrink-0">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  isToday
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {countdown}
                              </span>
                              <span
                                className={`mt-1 px-1.5 py-1 rounded-full inline-flex items-center ${
                                  holiday.type === "lunar"
                                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                                    : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                                }`}
                                title={holiday.type === "lunar" ? t("calendar.lunar") : t("calendar.solar")}
                              >
                                {holiday.type === "lunar" ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
