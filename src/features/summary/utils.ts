import type { Task, TaskCompletion } from "@/features/tasks/types";
import { computeRecurringState } from "@/features/tasks/recurrence";
import type { TaskAssignment } from "@/features/task_assignments/types";
import type { ShoppingItem } from "@/features/shopping/types";

import type { WeekStats, OverdueRecurringTask, TaskStreak, ShoppingMonthStats, HistoryEntry } from "./types";

export function toDateString(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Monday-start week range containing `today` — mirrors WeekPage's convention.
export function getWeekRange(today: Date): { start: Date; end: Date } {
    const currentDay = today.getDay(); // 0 = Sun
    const distToMon = currentDay === 0 ? -6 : 1 - currentDay;

    const monday = new Date(today);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(today.getDate() + distToMon);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return { start: monday, end: sunday };
}

export function computeWeekStats(assignments: TaskAssignment[]): WeekStats {
    return {
        totalAssigned: assignments.length,
        completed: assignments.filter((a) => a.status === "done").length,
        skipped: assignments.filter((a) => a.status === "skipped").length,
    };
}

export function computeOverdueRecurringTasks(
    tasks: Task[],
    completions: TaskCompletion[],
    nowMs: number,
): OverdueRecurringTask[] {
    const overdue: OverdueRecurringTask[] = [];

    for (const task of tasks) {
        if (task.type !== "recurring") continue;
        const state = computeRecurringState(task, completions, nowMs);
        if (state.isFinished || !state.nextDue) continue;
        if (state.nextDue.getTime() < nowMs) {
            overdue.push({
                id: task.id,
                title: task.title,
                category: task.category ?? null,
                nextDue: state.nextDue,
                priority: task.priority,
            });
        }
    }

    return overdue.sort((a, b) => a.nextDue.getTime() - b.nextDue.getTime());
}

// Consecutive weeks (counting back from the current week) that had at least
// one real (non-skip) completion. A week with zero completions breaks it.
function computeStreakForCompletions(completions: TaskCompletion[], nowMs: number): number {
    const real = completions.filter((c) => c.note !== "skipped");
    if (real.length === 0) return 0;

    const weekStarts = new Set<number>();
    for (const c of real) {
        const { start } = getWeekRange(new Date(c.completed_at));
        weekStarts.add(start.getTime());
    }

    let streak = 0;
    const cursor = getWeekRange(new Date(nowMs)).start;
    while (weekStarts.has(cursor.getTime())) {
        streak++;
        cursor.setDate(cursor.getDate() - 7);
    }
    return streak;
}

export function computeTaskStreaks(tasks: Task[], completions: TaskCompletion[], nowMs: number): TaskStreak[] {
    const streaks: TaskStreak[] = [];

    for (const task of tasks) {
        if (task.type !== "recurring") continue;
        const taskCompletions = completions.filter((c) => c.task_id === task.id);
        const currentStreak = computeStreakForCompletions(taskCompletions, nowMs);
        if (currentStreak > 0) {
            streaks.push({
                taskId: task.id,
                title: task.title,
                category: task.category ?? null,
                currentStreak,
            });
        }
    }

    return streaks.sort((a, b) => b.currentStreak - a.currentStreak);
}

export function computeShoppingMonthStats(items: ShoppingItem[], nowMs: number): ShoppingMonthStats {
    const now = new Date(nowMs);
    const boughtThisMonth = items.filter((i) => {
        if (i.status !== "bought" || !i.bought_at) return false;
        const d = new Date(i.bought_at);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });

    const categoryCounts = new Map<string, number>();
    for (const item of boughtThisMonth) {
        const key = item.category?.name ?? "Uncategorized";
        categoryCounts.set(key, (categoryCounts.get(key) ?? 0) + 1);
    }

    let topCategory: { name: string; count: number } | null = null;
    for (const [name, count] of categoryCounts) {
        if (!topCategory || count > topCategory.count) topCategory = { name, count };
    }

    return { boughtCount: boughtThisMonth.length, topCategory };
}

export function buildHistory(tasks: Task[], completions: TaskCompletion[]): HistoryEntry[] {
    const taskById = new Map(tasks.map((t) => [t.id, t]));

    return completions
        .map((c) => {
            const task = taskById.get(c.task_id);
            return {
                id: c.id,
                taskId: c.task_id,
                taskTitle: task?.title ?? "Deleted task",
                category: task?.category ?? null,
                completedAt: c.completed_at,
                cycleNumber: c.cycle_number,
                isSkip: c.note === "skipped",
            };
        })
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
}
