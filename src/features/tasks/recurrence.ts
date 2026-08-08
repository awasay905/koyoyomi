import type { Task, TaskCompletion, RecurrenceUnit, RecurringTaskState } from "./types";

export function addRecurrenceInterval(date: Date, unit: RecurrenceUnit, interval: number): Date {
    const d = new Date(date);
    if (unit === "day") d.setDate(d.getDate() + interval);
    else if (unit === "week") d.setDate(d.getDate() + interval * 7);
    else if (unit === "month") d.setMonth(d.getMonth() + interval);
    return d;
}

/**
 * Computes a recurring task's next-due date and whether it has met its end
 * condition, purely from the task row + its completions. Nothing is stored —
 * this is recalculated on every render per §1 of the design doc.
 * "Skipped" cycles (note === 'skipped') push next-due forward like a real
 * completion but don't count toward the after_n end condition.
 */
export function computeRecurringState(task: Task, completions: TaskCompletion[], nowMs: number): RecurringTaskState {
    if (task.type !== "recurring") {
        return { nextDue: null, isFinished: false, completionCount: 0 };
    }

    const taskCompletions = completions.filter((c) => c.task_id === task.id);
    const realCompletions = taskCompletions.filter((c) => c.note !== "skipped");

    const latest = taskCompletions.reduce<TaskCompletion | null>((acc, c) => {
        if (!acc) return c;
        return new Date(c.completed_at).getTime() > new Date(acc.completed_at).getTime() ? c : acc;
    }, null);

    const baseDate = latest ? new Date(latest.completed_at) : new Date(task.start_date ?? task.created_at);

    const nextDue =
        latest && task.recurrence_unit && task.recurrence_interval
            ? addRecurrenceInterval(baseDate, task.recurrence_unit, task.recurrence_interval)
            : baseDate;

    let isFinished = false;
    if (task.recurrence_end_type === "after_n" && task.recurrence_end_count) {
        isFinished = realCompletions.length >= task.recurrence_end_count;
    } else if (task.recurrence_end_type === "on_date" && task.recurrence_end_date) {
        isFinished = nowMs > new Date(task.recurrence_end_date).getTime();
    }

    return { nextDue, isFinished, completionCount: realCompletions.length };
}
