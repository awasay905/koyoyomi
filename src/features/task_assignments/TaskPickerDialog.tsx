import { useMemo } from "react";
import { Repeat, ListChecks } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";

import { useTasksQuery, useTaskCompletionsQuery } from "@/features/tasks/hooks";
import { computeRecurringState } from "@/features/tasks/recurrence";

import { usePendingAssignmentsQuery, useAssignTaskToDay } from "./hooks";
import { useNow } from "@/hooks/useNow";

interface TaskPickerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    date: string; // YYYY-MM-DD
}

export function TaskPickerDialog({ open, onOpenChange, date }: TaskPickerDialogProps) {
    const now = useNow();
    const { data: tasks = [], isLoading: isTasksLoading } = useTasksQuery();
    const { data: completions = [] } = useTaskCompletionsQuery();
    const { data: pendingAssignments = [], isLoading: isAssignmentsLoading } = usePendingAssignmentsQuery();
    const assignToDay = useAssignTaskToDay();

    const isLoading = isTasksLoading || isAssignmentsLoading;

    const unassignedTasks = useMemo(() => {
        // Pending task IDs specifically on this date
        const assignedTaskIdsOnDate = new Set(
            pendingAssignments.filter((a) => a.assigned_date === date).map((a) => a.task_id),
        );

        // Pending task IDs across all dates
        const allAssignedTaskIds = new Set(pendingAssignments.map((a) => a.task_id));

        return tasks.filter((t) => {
            if (t.type === "one_time") {
                if (t.status !== "active") return false;
                return !allAssignedTaskIds.has(t.id);
            }

            // Recurring tasks
            const state = computeRecurringState(t, completions, now);
            if (state.isFinished) return false;

            // Exclude recurring task if it is ALREADY assigned to THIS date
            return !assignedTaskIdsOnDate.has(t.id);
        });
    }, [tasks, completions, pendingAssignments, date, now]);

    const handleSelect = (taskId: string) => {
        assignToDay.mutate({ task_id: taskId, assigned_date: date }, { onSuccess: () => onOpenChange(false) });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm max-h-[75vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Assign a task</DialogTitle>
                    <DialogDescription>Pick an unassigned task to add to this day.</DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-10 w-full rounded-lg" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                ) : unassignedTasks.length === 0 ? (
                    <Empty className="py-6 border border-dashed rounded-xl">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <ListChecks />
                            </EmptyMedia>
                            <EmptyTitle className="text-xs">Nothing unassigned</EmptyTitle>
                            <EmptyDescription className="text-[11px] max-w-xs">
                                Every backlog task is already assigned for this date.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <div className="flex flex-col gap-1 -mx-1">
                        {unassignedTasks.map((task) => (
                            <button
                                key={task.id}
                                type="button"
                                onClick={() => handleSelect(task.id)}
                                disabled={assignToDay.isPending}
                                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors hover:bg-muted/60"
                            >
                                <span
                                    className={
                                        "size-1.5 rounded-full shrink-0 " +
                                        (task.priority === "high"
                                            ? "bg-destructive"
                                            : task.priority === "medium"
                                              ? "bg-amber-500 dark:bg-amber-400"
                                              : "bg-muted-foreground/40")
                                    }
                                />
                                {task.type === "recurring" && (
                                    <Repeat className="size-3 text-muted-foreground shrink-0" />
                                )}
                                <span className="text-xs font-medium text-foreground truncate flex-1">
                                    {task.title}
                                </span>
                                {task.category && (
                                    <Badge
                                        variant="secondary"
                                        className="text-[10px] font-normal px-1.5 h-4.5 text-muted-foreground shrink-0 rounded-full"
                                    >
                                        {task.category.name}
                                    </Badge>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
