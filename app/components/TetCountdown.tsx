import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { Duration } from "date-fns";
import { getNextTetDate } from "~/utils/tet";

export function TetCountdown({ variant = "default" }: { variant?: "default" | "compact" }) {
    const { t } = useTranslation();
    const [timeLeft, setTimeLeft] = useState<Duration>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [targetDate, setTargetDate] = useState<Date | null>(null);

    useEffect(() => {
        // Initialize target date on client side
        setTargetDate(getNextTetDate());
    }, []);

    useEffect(() => {
        if (!targetDate) return;

        const updateTimer = () => {
            const now = new Date();
            const diff = targetDate.getTime() - now.getTime();

            // If target passed, recalculate
            if (diff <= 0) {
                setTargetDate(getNextTetDate());
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds });
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (!targetDate) return null; // Avoid hydration mismatch

    if (variant === "compact") {
        return (
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-100 dark:border-gray-700">
                <span className="text-red-500 font-bold mr-1">Tết</span>
                <span className="tabular-nums">{String(timeLeft.days ?? 0).padStart(2, '0')}d</span>
                <span className="tabular-nums">{String(timeLeft.hours ?? 0).padStart(2, '0')}h</span>
                <span className="tabular-nums">{String(timeLeft.minutes ?? 0).padStart(2, '0')}m</span>
                <span className="tabular-nums w-5">{String(timeLeft.seconds ?? 0).padStart(2, '0')}s</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 sm:gap-4">
             {/* Logo / Text */}
             <div className="hidden lg:flex items-center justify-center">
                 <span className="text-red-600 font-bold text-3xl font-serif">Tết</span>
             </div>
             
             {/* Countdown */}
             <div className="flex gap-1 sm:gap-2">
                 <TimeBox value={timeLeft.days ?? 0} label={t("countdown.day")} />
                 <TimeBox value={timeLeft.hours ?? 0} label={t("countdown.hour")} />
                 <TimeBox value={timeLeft.minutes ?? 0} label={t("countdown.minute")} />
                 <TimeBox value={timeLeft.seconds ?? 0} label={t("countdown.second")} />
             </div>
        </div>
    );
}

function TimeBox({ value, label }: { value: number, label: string }) {
    return (
        <div className="flex flex-col items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-1 min-w-[45px] sm:min-w-[50px]">
            <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 leading-none">
                {String(value).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
                {label}
            </span>
        </div>
    )
}
