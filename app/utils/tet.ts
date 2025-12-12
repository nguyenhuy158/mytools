import { Solar, Lunar } from "lunar-javascript";
import { isSameDay } from "date-fns";

export function getNextTetDate(): Date {
  const now = new Date();
  const solarNow = Solar.fromYmd(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const lunarNow = solarNow.getLunar();
  const currentLunarYear = lunarNow.getYear();

  // Check Tet of current lunar year
  const tetCurrentYear = getSolarDateFromLunar(currentLunarYear, 1, 1);
  
  // If today is Tet or Tet is in future
  if (isSameDay(now, tetCurrentYear) || tetCurrentYear.getTime() > now.getTime()) {
    return tetCurrentYear;
  }
  
  // Otherwise, next Tet
  return getSolarDateFromLunar(currentLunarYear + 1, 1, 1);
}

function getSolarDateFromLunar(year: number, month: number, day: number): Date {
    const lunar = Lunar.fromYmd(year, month, day);
    const solar = lunar.getSolar();
    return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay(), 0, 0, 0);
}
