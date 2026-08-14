import { useState } from "react";
import { Trash2, MoreHorizontal, Pencil, Clock, Repeat, SkipForward, Calendar } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useNow } from "@/hooks/useNow";

import type { Task, RecurringTaskState } from "./types";
import { useMarkOneTimeDone, useDeleteTask, useLogTaskCompletion, useSkipRecurringCycle } from "./hooks";

interface TaskRowProps {
    task: Task;
    recurringState?: RecurringTaskState;
    onEdit: (task: Task) => void;
    onAssign?: (task: Task) => void;
    onCompleted?: (taskId: string) => void;
    showDivider?: boolean;
}

function getDueInfo(dueDate: Date | null, nowMs: number): { label: string; isOverdue: boolean } | null {
    if (!dueDate) return null;

    const now = new Date(nowMs);
    const diffMs = dueDate.getTime() - nowMs;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) {
        const overdueHours = Math.abs(diffMs) / (1000 * 60 * 60);
        if (overdueHours < 24) return { label: `${Math.max(1, Math.round(overdueHours))}h overdue`, isOverdue: true };
        return { label: `${Math.max(1, Math.abs(diffDays))}d overdue`, isOverdue: true };
    }

    const isSameDay =
        dueDate.getDate() === now.getDate() &&
        dueDate.getMonth() === now.getMonth() &&
        dueDate.getFullYear() === now.getFullYear();
    if (isSameDay) return { label: "Today", isOverdue: false };

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow =
        dueDate.getDate() === tomorrow.getDate() &&
        dueDate.getMonth() === tomorrow.getMonth() &&
        dueDate.getFullYear() === tomorrow.getFullYear();
    if (isTomorrow) return { label: "Tomorrow", isOverdue: false };

    if (diffDays < 7) return { label: `in ${diffDays}d`, isOverdue: false };

    return { label: dueDate.toLocaleDateString(undefined, { month: "short", day: "numeric" }), isOverdue: false };
}

export function TaskRow({ task, recurringState, onEdit, onAssign, onCompleted, showDivider }: TaskRowProps) {
    const now = useNow();
    const markOneTimeDone = useMarkOneTimeDone();
    const logCompletion = useLogTaskCompletion();
    const skipCycle = useSkipRecurringCycle();
    const deleteTask = useDeleteTask();

    const [isLocallyDone, setIsLocallyDone] = useState(false);

    const isRecurring = task.type === "recurring";
    const isDone = isLocallyDone || (!isRecurring && task.status === "done");

    const dueDate = isRecurring ? (recurringState?.nextDue ?? null) : task.deadline ? new Date(task.deadline) : null;
    const dueInfo = getDueInfo(dueDate, now);
    const isOverdue = Boolean(dueInfo?.isOverdue && !isDone);

    const handleCheckboxChange = (checked: boolean) => {
        if (!checked) return;

        setIsLocallyDone(true);
        onCompleted?.(task.id);

        if (isRecurring) {
            logCompletion.mutate(
                { taskId: task.id, priorCompletionCount: recurringState?.completionCount ?? 0 },
                { onError: () => setIsLocallyDone(false) },
            );
        } else {
            markOneTimeDone.mutate({ id: task.id, done: true }, { onError: () => setIsLocallyDone(false) });
        }
    };

    return (
        <div className="flex flex-col">
            <div
                className={cn(
                    "group flex items-center justify-between p-3 px-4 hover:bg-accent/40 transition-colors select-none",
                    isDone && "opacity-40 hover:bg-transparent transition-opacity duration-300",
                )}
            >
                {/* Left: Checkbox + Priority + Details */}
                <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                    <Checkbox
                        checked={isDone}
                        onCheckedChange={(checked) => handleCheckboxChange(Boolean(checked))}
                        aria-label={`Mark "${task.title}" as done`}
                        className="size-4.5 rounded shrink-0"
                    />

                    <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                        {task.priority !== "medium" && (
                            <span
                                className={cn(
                                    "size-1.5 rounded-full shrink-0",
                                    task.priority === "high" ? "bg-destructive" : "bg-muted-foreground/50",
                                )}
                                title={`Priority: ${task.priority}`}
                            />
                        )}

                        {isRecurring && (
                            <Repeat className="size-3 text-muted-foreground shrink-0" aria-label="Recurring task" />
                        )}

                        <span
                            className={cn(
                                "text-sm font-medium leading-tight truncate",
                                isDone ? "line-through text-muted-foreground font-normal" : "text-foreground",
                            )}
                        >
                            {task.title}
                        </span>

                        {task.category && (
                            <Badge
                                variant="secondary"
                                className="text-[10px] font-normal px-1.5 h-4.5 text-muted-foreground shrink-0 rounded-md gap-1"
                            >
                                {task.category.color && (
                                    <span
                                        className="size-1.5 rounded-full shrink-0"
                                        style={{ backgroundColor: task.category.color }}
                                    />
                                )}
                                <span className="truncate max-w-[80px]">{task.category.name}</span>
                            </Badge>
                        )}

                        {dueInfo && (
                            <span
                                className={cn(
                                    "text-[11px] font-mono shrink-0",
                                    isOverdue ? "text-destructive font-medium" : "text-muted-foreground",
                                )}
                            >
                                {isRecurring && !dueInfo.isOverdue ? `Due ${dueInfo.label}` : dueInfo.label}
                            </span>
                        )}

                        {task.estimated_minutes && (
                            <span className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground/70 font-mono shrink-0">
                                <Clock className="size-3" />
                                <span>{task.estimated_minutes}m</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Right: Actions Menu */}
                <div className="flex items-center shrink-0">
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-muted-foreground hover:text-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                    aria-label={`Options for ${task.title}`}
                                />
                            }
                        >
                            <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuGroup>
                                <DropdownMenuItem onClick={() => onEdit(task)}>
                                    <Pencil data-icon="inline-start" />
                                    <span>Edit</span>
                                </DropdownMenuItem>
                                {onAssign && (
                                    <DropdownMenuItem onClick={() => onAssign(task)}>
                                        <Calendar data-icon="inline-start" />
                                        <span>Assign to day</span>
                                    </DropdownMenuItem>
                                )}
                                {isRecurring && (
                                    <DropdownMenuItem onClick={() => skipCycle.mutate(task.id)}>
                                        <SkipForward data-icon="inline-start" />
                                        <span>Skip cycle</span>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    onClick={() => deleteTask.mutate(task.id)}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <Trash2 data-icon="inline-start" />
                                    <span>Delete</span>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {showDivider && <div className="h-px bg-border/50 mx-4" />}
        </div>
    );
}
