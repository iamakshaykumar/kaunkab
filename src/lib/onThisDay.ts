export interface DayEvent {
  slug: string;
  title: string;
  year: number;
  month: number;
  day: number;
  saar: string;
  img?: string;
}

export interface OnThisDayResult {
  exact: boolean;
  month: number;
  day: number;
  events: DayEvent[];
}

const key = (month: number, day: number) => month * 100 + day;

/**
 * Events for today's month/day; otherwise the next calendar date (wrapping
 * past Dec 31) that has events. Null when there are no events at all.
 */
export function pickOnThisDay(events: DayEvent[], today: Date): OnThisDayResult | null {
  if (events.length === 0) return null;
  const todayKey = key(today.getMonth() + 1, today.getDate());
  const keys = [...new Set(events.map((e) => key(e.month, e.day)))].sort((a, b) => a - b);
  const target = keys.find((k) => k >= todayKey) ?? keys[0];
  const month = Math.floor(target / 100);
  const day = target % 100;
  return {
    exact: target === todayKey,
    month,
    day,
    events: events.filter((e) => key(e.month, e.day) === target).sort((a, b) => a.year - b.year),
  };
}
