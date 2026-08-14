import { useEffect, useRef } from "react";
import { useTasksQuery, useTaskCompletionsQuery } from "@/features/tasks/hooks";
import { computeRecurringState } from "@/features/tasks/recurrence";
import { usePendingAssignmentsQuery, useAssignTaskToDay } from "./hooks";
import { useNow } from "@/hooks/useNow";
import { toDateString } from "./utils";

export function useAutoAssignRecurringTasks() {
    const nowMs = useNow();
    const { data: tasks = [] } = useTasksQuery();
    const { data: completions = [] } = useTaskCompletionsQuery();
    const { data: pendingAssignments = [] } = usePendingAssignmentsQuery();
    const assignToDay = useAssignTaskToDay();

    const attemptedRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (tasks.length === 0) return;
        const todayStr = toDateString(new Date(nowMs));

        for (const task of tasks) {
            if (task.type !== "recurring") continue;

            const state = computeRecurringState(task, completions, nowMs);
            if (state.isFinished || !state.nextDue) continue;
            if (state.nextDue.getTime() > nowMs) continue; // not due yet

            const alreadyAssignedToday = pendingAssignments.some(
                (a) => a.task_id === task.id && a.assigned_date === todayStr,
            );
            if (alreadyAssignedToday) continue;

            const key = `${task.id}:${todayStr}`;
            if (attemptedRef.current.has(key)) continue;
            attemptedRef.current.add(key);

            assignToDay.mutate({ task_id: task.id, assigned_date: todayStr });
        }
    }, [tasks, completions, pendingAssignments, nowMs]); // eslint-disable-line react-hooks/exhaustive-deps
}
