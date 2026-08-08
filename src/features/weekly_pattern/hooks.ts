import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { WeeklyPatternRow, DayOverride } from "./types";
import { resolveDayType, toDateString } from "./utils";

// ── Weekly Pattern ──────────────────────────────────────────
export function useWeeklyPatternQuery() {
    return useQuery<WeeklyPatternRow[]>({
        queryKey: ["weekly_pattern"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("weekly_pattern")
                .select("*, day_type:day_types(*)")
                .order("day_of_week", { ascending: true });
            if (error) throw error;
            return (data ?? []) as unknown as WeeklyPatternRow[];
        },
    });
}

// One row per weekday, unique on (user_id, day_of_week) — upsert keeps this a single write.
export function useSetWeeklyPatternDay() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ day_of_week, day_type_id }: { day_of_week: number; day_type_id: string }) => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const { error } = await supabase
                .from("weekly_pattern")
                .upsert({ user_id: user.id, day_of_week, day_type_id }, { onConflict: "user_id,day_of_week" });
            if (error) throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["weekly_pattern"] }),
    });
}

// ── Day Overrides ───────────────────────────────────────────
export function useDayOverrideQuery(date: string | undefined) {
    return useQuery<DayOverride | null>({
        queryKey: ["day_overrides", date],
        queryFn: async () => {
            if (!date) return null;
            const { data, error } = await supabase
                .from("day_overrides")
                .select("*, day_type:day_types(*)")
                .eq("the_date", date)
                .maybeSingle();
            if (error) throw error;
            return data as DayOverride | null;
        },
        enabled: Boolean(date),
    });
}

// Used by the Week screen to fetch a whole week's overrides in one call
// instead of 7 separate single-date queries.
export function useDayOverridesRangeQuery(startDate: string | undefined, endDate: string | undefined) {
    return useQuery<DayOverride[]>({
        queryKey: ["day_overrides", "range", startDate, endDate],
        queryFn: async () => {
            if (!startDate || !endDate) return [];
            const { data, error } = await supabase
                .from("day_overrides")
                .select("*, day_type:day_types(*)")
                .gte("the_date", startDate)
                .lte("the_date", endDate);
            if (error) throw error;
            return (data ?? []) as unknown as DayOverride[];
        },
        enabled: Boolean(startDate && endDate),
    });
}

// Unique on (user_id, the_date) — upsert writes exactly one override row per date.
export function useSetDayOverride() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ the_date, day_type_id }: { the_date: string; day_type_id: string }) => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const { error } = await supabase
                .from("day_overrides")
                .upsert({ user_id: user.id, the_date, day_type_id }, { onConflict: "user_id,the_date" });
            if (error) throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["day_overrides"] }),
    });
}

// Removes an override so the date falls back to the weekly default.
export function useClearDayOverride() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (the_date: string) => {
            const { error } = await supabase.from("day_overrides").delete().eq("the_date", the_date);
            if (error) throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["day_overrides"] }),
    });
}

// ── Resolved day-type for a single date ────────────────────
// Combines an override lookup + the weekly pattern into one resolved value,
// per §6's resolution rule. Today/Week screens should use this directly.
export function useResolvedDayTypeForDate(date: Date) {
    const dateStr = toDateString(date);
    const { data: override, isLoading: isOverrideLoading } = useDayOverrideQuery(dateStr);
    const { data: pattern = [], isLoading: isPatternLoading } = useWeeklyPatternQuery();

    const resolved = resolveDayType(override, pattern, date);

    return {
        ...resolved,
        override: override ?? null,
        isLoading: isOverrideLoading || isPatternLoading,
    };
}
