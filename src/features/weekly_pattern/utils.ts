import type { WeeklyPatternRow, DayOverride } from "./types";

export interface ResolvedDayType {
    dayTypeId: string | null;
    source: "override" | "weekly_pattern" | null;
}

// Resolution order per §6: day_overrides first, then weekly_pattern by weekday.
export function resolveDayType(
    override: DayOverride | null | undefined,
    weeklyPattern: WeeklyPatternRow[],
    date: Date,
): ResolvedDayType {
    if (override) {
        return { dayTypeId: override.day_type_id, source: "override" };
    }
    const dayOfWeek = date.getDay(); // 0 = Sunday, matches schema convention
    const patternRow = weeklyPattern.find((p) => p.day_of_week === dayOfWeek);
    if (patternRow) {
        return { dayTypeId: patternRow.day_type_id, source: "weekly_pattern" };
    }
    return { dayTypeId: null, source: null };
}

export function toDateString(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export const DAY_NAMES_BY_INDEX = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const DAY_NAMES_SHORT_BY_INDEX = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Monday-first display order used throughout the UI (Week screen convention),
// mapped back to the 0=Sunday values stored in the DB.
export const WEEK_DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
