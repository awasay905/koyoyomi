import * as React from "react";
import { Link } from "@tanstack/react-router";
import {
    Calendar as CalendarIcon,
    AlertTriangle,
    Plus,
    CalendarClock,
    XCircle,
    ListChecks,
    CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

import { useNow } from "@/hooks/useNow";
import { cn } from "@/lib/utils";

import { useResolvedDayTypeForDate } from "@/features/weekly_pattern/hooks";
import { useScheduleBlocksQuery, useDayTypeQuery } from "@/features/day_types/hooks";
import { blockDurationMinutes, formatTimeLabel12h } from "@/features/day_types/utils";
import { DayTypePickerDialog } from "@/features/weekly_pattern/DayTypePickerDialog";

import { useTasksQuery, useTaskCompletionsQuery } from "@/features/tasks/hooks";
import { computeRecurringState } from "@/features/tasks/recurrence";

import {
    useDayAssignmentsQuery,
    useMarkAssignmentDone,
    useUnassignFromSlot,
    useAssignToSlot,
} from "@/features/task_assignments/hooks";
import { getBlockRemainingMinutes } from "@/features/task_assignments/utils";
import { DayAssignmentRow } from "@/features/task_assignments/DayAssignmentRow";
import type { TaskAssignment } from "@/features/task_assignments/types";
import type { ScheduleBlock } from "@/features/day_types/types";

function toDateString(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatHeaderDate(date: Date): string {
    return date.toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
    });
}

function isBlockActive(block: ScheduleBlock, now: Date): boolean {
    if (!block.start_time || !block.end_time) return false;
    const [sH, sM] = block.start_time.split(":").map(Number);
    const [eH, eM] = block.end_time.split(":").map(Number);
    const startMins = sH * 60 + (sM || 0);
    const endMins = eH * 60 + (eM || 0);
    const currentMins = now.getHours() * 60 + now.getMinutes();

    if (endMins < startMins) {
        // Crosses midnight boundary
        return currentMins >= startMins || currentMins < endMins;
    }
    return currentMins >= startMins && currentMins < endMins;
}

export function TodayPage() {
    const nowMs = useNow();
    const today = React.useMemo(() => new Date(nowMs), [nowMs]);
    const todayStr = React.useMemo(() => toDateString(today), [today]);

    // 1. Resolved Day-Type for Today
    const { dayTypeId, source: dayTypeSource, isLoading: isResolvingDayType } = useResolvedDayTypeForDate(today);
    const { data: dayType } = useDayTypeQuery(dayTypeId ?? undefined);
    const { data: scheduleBlocks = [], isLoading: isBlocksLoading } = useScheduleBlocksQuery(dayTypeId ?? undefined);

    // 2. Day Assignments for Today
    const { data: dayAssignments = [], isLoading: isAssignmentsLoading } = useDayAssignmentsQuery(todayStr);

    // 3. Backlog Tasks & Completions
    const { data: tasks = [] } = useTasksQuery();
    const { data: completions = [] } = useTaskCompletionsQuery();

    // Dialog States
    const [isDayTypePickerOpen, setIsDayTypePickerOpen] = React.useState(false);
    const [selectedSlotBlock, setSelectedSlotBlock] = React.useState<ScheduleBlock | null>(null);

    const markDone = useMarkAssignmentDone();
    const unassignFromSlot = useUnassignFromSlot();
    const assignToSlot = useAssignToSlot();

    const isLoading = isResolvingDayType || isBlocksLoading || isAssignmentsLoading;

    // Group slotted assignments into block ID buckets
    const { slottedAssignmentsGrouped, unslottedAssignments } = React.useMemo(() => {
        const slottedGrouped = new Map<string, TaskAssignment[]>();
        const unslotted: TaskAssignment[] = [];

        for (const assignment of dayAssignments) {
            if (assignment.schedule_block_id) {
                const list = slottedGrouped.get(assignment.schedule_block_id) ?? [];
                list.push(assignment);
                slottedGrouped.set(assignment.schedule_block_id, list);
            } else if (assignment.status === "pending") {
                unslotted.push(assignment);
            }
        }

        return { slottedAssignmentsGrouped: slottedGrouped, unslottedAssignments: unslotted };
    }, [dayAssignments]);

    // Calculate overdue tasks count
    const overdueCount = React.useMemo(() => {
        let count = 0;
        for (const task of tasks) {
            if (task.type === "one_time" && task.status === "active" && task.deadline) {
                if (new Date(task.deadline).getTime() < nowMs) count++;
            } else if (task.type === "recurring") {
                const state = computeRecurringState(task, completions, nowMs);
                if (!state.isFinished && state.nextDue && state.nextDue.getTime() < nowMs) {
                    count++;
                }
            }
        }
        return count;
    }, [tasks, completions, nowMs]);

    const completionCountsMap = React.useMemo(() => {
        const map = new Map<string, number>();
        for (const task of tasks) {
            if (task.type === "recurring") {
                const state = computeRecurringState(task, completions, nowMs);
                map.set(task.id, state.completionCount);
            } else {
                map.set(task.id, 0);
            }
        }
        return map;
    }, [tasks, completions, nowMs]);

    return (
        <div className="mx-auto flex max-w-lg flex-col gap-8 px-4 py-8 pb-28">
            {/* Header with Day-Type Indicator */}
            <header className="flex items-center justify-between gap-3 min-w-0">
                <div className="flex flex-col min-w-0">
                    <h1 className="text-xl font-bold tracking-tight truncate leading-none">
                        {formatHeaderDate(today)}
                    </h1>
                    <p className="text-sm text-muted-foreground truncate mt-1.5">Your focused schedule for today.</p>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDayTypePickerOpen(true)}
                    className="shrink-0 h-8 gap-2 px-3 border-border/80"
                >
                    <span
                        className="size-2 rounded-full shrink-0 ring-1 ring-border/50"
                        style={{ backgroundColor: dayType?.color ?? "var(--muted-foreground)" }}
                    />
                    <span className="text-xs font-medium max-w-[100px] truncate">
                        {dayType?.name ?? "Set Template"}
                    </span>
                    {dayTypeSource === "override" && (
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground border-l border-border/60 pl-1.5 ml-0.5">
                            Override
                        </span>
                    )}
                </Button>
            </header>

            {/* Overdue Banner */}
            {overdueCount > 0 && (
                <Alert variant="destructive" className="py-3">
                    <AlertTriangle data-icon="inline-start" />
                    <AlertDescription className="flex items-center justify-between gap-2 text-xs">
                        <span>
                            {overdueCount} overdue task{overdueCount > 1 ? "s" : ""} pending.
                        </span>
                        <Link
                            to="/backlog"
                            className="font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity"
                        >
                            Open Backlog
                        </Link>
                    </AlertDescription>
                </Alert>
            )}

            {/* Schedule Timeline Section */}
            <section className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Schedule Timeline
                    </h2>
                    {scheduleBlocks.length > 0 && (
                        <span className="text-[11px] font-mono text-muted-foreground">
                            {scheduleBlocks.length} block{scheduleBlocks.length > 1 ? "s" : ""}
                        </span>
                    )}
                </div>

                {isLoading ? (
                    <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
                        <CardContent className="p-0 flex flex-col gap-0">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex flex-col">
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex flex-col gap-1.5">
                                            <Skeleton className="h-4 w-28 rounded-md" />
                                            <Skeleton className="h-3 w-16 rounded-md" />
                                        </div>
                                        <Skeleton className="h-4 w-12 rounded-md" />
                                    </div>
                                    {i < 2 && <div className="h-px bg-border/50 mx-4" />}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ) : scheduleBlocks.length === 0 ? (
                    <Empty className="py-10 border border-dashed border-border/80 rounded-xl bg-card/40">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <CalendarClock />
                            </EmptyMedia>
                            <EmptyTitle>No blocks scheduled</EmptyTitle>
                            <EmptyDescription className="max-w-[260px]">
                                {dayTypeId
                                    ? "This template has no schedule blocks configured yet."
                                    : "Select a day template to load today's timeline."}
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Button size="sm" variant="outline" onClick={() => setIsDayTypePickerOpen(true)}>
                                <CalendarIcon data-icon="inline-start" />
                                <span>Choose Template</span>
                            </Button>
                        </EmptyContent>
                    </Empty>
                ) : (
                    <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
                        <CardContent className="p-0 flex flex-col gap-0">
                            {scheduleBlocks.map((block, index) => {
                                const slottedAssignments = slottedAssignmentsGrouped.get(block.id) ?? [];
                                const isFree = block.block_type === "free";
                                const duration = blockDurationMinutes(block);
                                const remainingMins = getBlockRemainingMinutes(block, dayAssignments);
                                const active = isBlockActive(block, today);

                                return (
                                    <div key={block.id} className="flex flex-col">
                                        <div
                                            className={cn(
                                                "flex flex-col gap-2.5 p-4 transition-colors",
                                                active ? "bg-accent/40" : "hover:bg-accent/20",
                                            )}
                                        >
                                            {/* Top Row: Time Range + Block Title + Duration */}
                                            <div className="flex items-center justify-between gap-3 min-w-0">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="font-mono text-xs font-medium tabular-nums text-foreground">
                                                        {formatTimeLabel12h(block.start_time)} –{" "}
                                                        {formatTimeLabel12h(block.end_time)}
                                                    </span>

                                                    {active && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-[9px] font-semibold uppercase px-1.5 h-4 rounded-md tracking-wider bg-foreground text-background"
                                                        >
                                                            Now
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="text-[11px] font-mono text-muted-foreground">
                                                        {duration}m
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            "size-2 rounded-full ring-1 ring-border/50",
                                                            isFree ? "bg-primary" : "bg-muted-foreground/40",
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            {/* Middle Row: Title & Notes */}
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-medium text-foreground truncate">
                                                    {block.title}
                                                </span>
                                                {block.notes && slottedAssignments.length === 0 && (
                                                    <span className="text-xs text-muted-foreground truncate mt-0.5">
                                                        {block.notes}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Slotted Tasks in Free Block */}
                                            {slottedAssignments.length > 0 && (
                                                <div className="flex flex-col gap-1.5 pt-1">
                                                    {slottedAssignments.map(
                                                        (assignment) =>
                                                            assignment.task && (
                                                                <div
                                                                    key={assignment.id}
                                                                    className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-border/80 bg-card"
                                                                >
                                                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                                        <Checkbox
                                                                            checked={assignment.status === "done"}
                                                                            onCheckedChange={(checked) => {
                                                                                if (checked && assignment.task) {
                                                                                    const count =
                                                                                        completionCountsMap.get(
                                                                                            assignment.task.id,
                                                                                        ) ?? 0;
                                                                                    markDone.mutate({
                                                                                        assignmentId: assignment.id,
                                                                                        taskId: assignment.task.id,
                                                                                        taskType: assignment.task.type,
                                                                                        priorCompletionCount: count,
                                                                                    });
                                                                                }
                                                                            }}
                                                                            className="size-4 shrink-0"
                                                                        />
                                                                        <span
                                                                            className={cn(
                                                                                "text-xs truncate",
                                                                                assignment.status === "done"
                                                                                    ? "line-through text-muted-foreground font-normal"
                                                                                    : "font-medium text-foreground",
                                                                            )}
                                                                        >
                                                                            {assignment.task.title}
                                                                        </span>
                                                                        {assignment.task.estimated_minutes && (
                                                                            <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                                                                                {assignment.task.estimated_minutes}m
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() =>
                                                                            unassignFromSlot.mutate(assignment.id)
                                                                        }
                                                                        className="size-7 text-muted-foreground hover:text-foreground shrink-0"
                                                                        aria-label="Remove task from slot"
                                                                    >
                                                                        <XCircle className="size-3.5" />
                                                                    </Button>
                                                                </div>
                                                            ),
                                                    )}
                                                </div>
                                            )}

                                            {/* Free Slot Action Footer */}
                                            {isFree && (
                                                <div className="flex items-center justify-between pt-1">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setSelectedSlotBlock(block)}
                                                        className="h-7 text-xs px-2.5 gap-1.5"
                                                    >
                                                        <Plus data-icon="inline-start" />
                                                        <span>Slot Task</span>
                                                    </Button>

                                                    {slottedAssignments.length > 0 && (
                                                        <span className="text-[11px] font-mono text-muted-foreground">
                                                            {remainingMins}m remaining
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {index < scheduleBlocks.length - 1 && (
                                            <div className="h-px bg-border/50 mx-4" />
                                        )}
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                )}
            </section>

            {/* Unslotted Tasks Section */}
            <section className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Today&apos;s To-Do List
                    </h2>
                    <Link to="/backlog">
                        <Button variant="ghost" size="sm" className="h-7 text-xs px-2 gap-1.5">
                            <Plus data-icon="inline-start" />
                            <span>Add From Backlog</span>
                        </Button>
                    </Link>
                </div>

                <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
                    <CardContent className="p-0 flex flex-col gap-0">
                        {unslottedAssignments.length === 0 ? (
                            <div className="py-8 px-4 flex flex-col items-center justify-center text-center gap-2">
                                <CheckCircle2 className="size-5 text-muted-foreground/60" />
                                <span className="text-sm font-medium text-foreground">All clear for today</span>
                                <p className="text-xs text-muted-foreground max-w-[240px]">
                                    No pending unslotted tasks. Assign items from your backlog to plan your day.
                                </p>
                            </div>
                        ) : (
                            unslottedAssignments.map((assignment, index) => (
                                <div key={assignment.id} className="flex flex-col">
                                    <DayAssignmentRow
                                        assignment={assignment}
                                        priorCompletionCount={
                                            assignment.task ? (completionCountsMap.get(assignment.task.id) ?? 0) : 0
                                        }
                                    />
                                    {index < unslottedAssignments.length - 1 && (
                                        <div className="h-px bg-border/50 mx-4" />
                                    )}
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </section>

            {/* Slot Task Picker Modal */}
            {selectedSlotBlock && (
                <SlotTaskPickerModal
                    open={Boolean(selectedSlotBlock)}
                    onOpenChange={(open) => {
                        if (!open) setSelectedSlotBlock(null);
                    }}
                    block={selectedSlotBlock}
                    unslottedAssignments={unslottedAssignments}
                    dayAssignments={dayAssignments}
                    onSelectTask={(assignmentId) => {
                        assignToSlot.mutate(
                            { id: assignmentId, schedule_block_id: selectedSlotBlock.id },
                            { onSuccess: () => setSelectedSlotBlock(null) },
                        );
                    }}
                />
            )}

            {/* Day Type Picker Dialog */}
            <DayTypePickerDialog
                open={isDayTypePickerOpen}
                onOpenChange={setIsDayTypePickerOpen}
                date={todayStr}
                dateLabel="Today"
                currentDayTypeId={dayTypeId}
                hasOverride={dayTypeSource === "override"}
            />
        </div>
    );
}

interface SlotTaskPickerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    block: ScheduleBlock;
    unslottedAssignments: TaskAssignment[];
    dayAssignments: TaskAssignment[];
    onSelectTask: (assignmentId: string) => void;
}

function SlotTaskPickerModal({
    open,
    onOpenChange,
    block,
    unslottedAssignments,
    dayAssignments,
    onSelectTask,
}: SlotTaskPickerModalProps) {
    const slotRemaining = getBlockRemainingMinutes(block, dayAssignments);

    const validAssignments = unslottedAssignments.filter((a) => {
        const est = a.task?.estimated_minutes ?? 0;
        return est <= slotRemaining;
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Place in Slot</DialogTitle>
                    <DialogDescription>
                        Select a task for &ldquo;{block.title}&rdquo; ({slotRemaining}m available).
                    </DialogDescription>
                </DialogHeader>

                {validAssignments.length === 0 ? (
                    <Empty className="py-8 border border-dashed border-border/80 rounded-xl bg-card/40">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <ListChecks />
                            </EmptyMedia>
                            <EmptyTitle>No matching tasks</EmptyTitle>
                            <EmptyDescription className="max-w-[240px]">
                                {unslottedAssignments.length === 0
                                    ? "Assign tasks from your backlog first."
                                    : `Pending tasks require more than ${slotRemaining} minutes.`}
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <div className="flex flex-col divide-y divide-border/50 border border-border/80 rounded-xl overflow-hidden my-2">
                        {validAssignments.map((assignment) => {
                            const task = assignment.task;
                            if (!task) return null;

                            return (
                                <button
                                    key={assignment.id}
                                    type="button"
                                    onClick={() => onSelectTask(assignment.id)}
                                    className="flex items-center justify-between gap-3 p-3 text-left hover:bg-accent/50 transition-colors focus-visible:outline-none focus-visible:bg-accent/50"
                                >
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span className="text-sm font-medium text-foreground truncate">
                                            {task.title}
                                        </span>
                                        {task.category && (
                                            <span className="text-xs text-muted-foreground truncate mt-0.5">
                                                {task.category.name}
                                            </span>
                                        )}
                                    </div>

                                    {task.estimated_minutes && (
                                        <span className="text-xs font-mono text-muted-foreground shrink-0">
                                            {task.estimated_minutes}m
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
