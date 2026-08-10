import type { Category, Priority } from "@/features/tasks/types";

export interface WeekStats {
    totalAssigned: number;
    completed: number;
    skipped: number;
}

export interface OverdueRecurringTask {
    id: string;
    title: string;
    category: Category | null;
    nextDue: Date;
    priority: Priority;
}

export interface TaskStreak {
    taskId: string;
    title: string;
    category: Category | null;
    currentStreak: number; // consecutive weeks with >=1 real completion
}

export interface ShoppingMonthStats {
    boughtCount: number;
    topCategory: { name: string; count: number } | null;
}

export interface HistoryEntry {
    id: string;
    taskId: string;
    taskTitle: string;
    category: Category | null;
    completedAt: string;
    cycleNumber: number | null;
    isSkip: boolean;
}

export interface HistoryFilter {
    taskId: string | null;
    categoryId: string | null;
}
