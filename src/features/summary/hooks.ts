import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useNow } from "@/hooks/useNow";

import { useTasksQuery, useTaskCompletionsQuery } from "@/features/tasks/hooks";
import { useAssignmentsRangeQuery } from "@/features/task_assignments/hooks";
import type { ShoppingItem } from "@/features/shopping/types";

import {
    toDateString,
    getWeekRange,
    computeWeekStats,
    computeOverdueRecurringTasks,
    computeTaskStreaks,
    computeShoppingMonthStats,
    buildHistory,
} from "./utils";
import type { WeekStats, OverdueRecurringTask, TaskStreak, ShoppingMonthStats, HistoryEntry } from "./types";

// The Shopping tab's hooks only expose "pending" + "all bought" (for the
// Bought section), not a month-scoped read — so Summary queries bought items
// directly. Small personal dataset, same pattern as tasks/hooks.ts's
// useTaskCompletionsQuery.
function useBoughtShoppingItemsQuery() {
    return useQuery<ShoppingItem[]>({
        queryKey: ["shopping", "bought", "all"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("shopping_items")
                .select("*, category:categories(*)")
                .eq("status", "bought")
                .order("bought_at", { ascending: false });
            if (error) throw error;
            return (data ?? []) as unknown as ShoppingItem[];
        },
    });
}

// ── This week ───────────────────────────────────────────────
export function useWeekStats(): { data: WeekStats; isLoading: boolean } {
    const nowMs = useNow();
    const { start, end } = useMemo(() => getWeekRange(new Date(nowMs)), [nowMs]);
    const startStr = toDateString(start);
    const endStr = toDateString(end);

    const { data: assignments = [], isLoading } = useAssignmentsRangeQuery(startStr, endStr);
    const data = useMemo(() => computeWeekStats(assignments), [assignments]);

    return { data, isLoading };
}

// ── Overdue recurring tasks ────────────────────────────────
export function useOverdueRecurringTasks(): { data: OverdueRecurringTask[]; isLoading: boolean } {
    const nowMs = useNow();
    const { data: tasks = [], isLoading: isTasksLoading } = useTasksQuery();
    const { data: completions = [], isLoading: isCompletionsLoading } = useTaskCompletionsQuery();

    const data = useMemo(() => computeOverdueRecurringTasks(tasks, completions, nowMs), [tasks, completions, nowMs]);

    return { data, isLoading: isTasksLoading || isCompletionsLoading };
}

// ── Streaks ─────────────────────────────────────────────────
export function useTaskStreaks(): { data: TaskStreak[]; isLoading: boolean } {
    const nowMs = useNow();
    const { data: tasks = [], isLoading: isTasksLoading } = useTasksQuery();
    const { data: completions = [], isLoading: isCompletionsLoading } = useTaskCompletionsQuery();

    const data = useMemo(() => computeTaskStreaks(tasks, completions, nowMs), [tasks, completions, nowMs]);

    return { data, isLoading: isTasksLoading || isCompletionsLoading };
}

// ── Shopping (this month) ──────────────────────────────────
export function useShoppingMonthStats(): { data: ShoppingMonthStats; isLoading: boolean } {
    const nowMs = useNow();
    const { data: items = [], isLoading } = useBoughtShoppingItemsQuery();
    const data = useMemo(() => computeShoppingMonthStats(items, nowMs), [items, nowMs]);

    return { data, isLoading };
}

// ── History ─────────────────────────────────────────────────
export function useCompletionHistory(): { data: HistoryEntry[]; isLoading: boolean } {
    const { data: tasks = [], isLoading: isTasksLoading } = useTasksQuery();
    const { data: completions = [], isLoading: isCompletionsLoading } = useTaskCompletionsQuery();

    const data = useMemo(() => buildHistory(tasks, completions), [tasks, completions]);

    return { data, isLoading: isTasksLoading || isCompletionsLoading };
}
