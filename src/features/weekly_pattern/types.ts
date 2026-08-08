import type { DayType } from "@/features/day_types/types";

export interface WeeklyPatternRow {
    id: string;
    user_id: string;
    day_of_week: number; // 0 = Sunday ... 6 = Saturday (matches schema)
    day_type_id: string;
    day_type?: DayType | null;
}

export interface DayOverride {
    id: string;
    user_id: string;
    the_date: string; // YYYY-MM-DD
    day_type_id: string;
    created_at: string;
    day_type?: DayType | null;
}
