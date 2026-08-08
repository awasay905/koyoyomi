import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
    Calendar as CalendarIcon,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Plus,
    Sparkles,
    CalendarClock,
    XCircle,
    ListChecks,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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

export function TodayPage() {
    const nowMs = useNow();
    const today = useMemo(() => new Date(nowMs), [nowMs]);
    const todayStr = useMemo(() => toDateString(today), [today]);

    // 1. Resolved Day-Type for Today
    const { dayTypeId, source: dayTypeSource, isLoading: isResolvingDayType } = useResolvedDayTypeForDate(today);

    const { data: dayType } = useDayTypeQuery(dayTypeId ?? undefined);
    const { data: scheduleBlocks = [], isLoading: isBlocksLoading } = useScheduleBlocksQuery(dayTypeId ?? undefined);

    // 2. Day Assignments for Today
    const { data: dayAssignments = [], isLoading: isAssignmentsLoading } = useDayAssignmentsQuery(todayStr);

    // 3. Backlog Tasks & Completions (for overdue calculation & completion counts)
    const { data: tasks = [] } = useTasksQuery();
    const { data: completions = [] } = useTaskCompletionsQuery();

    // Dialog & Sheet States
    const [isDayTypePickerOpen, setIsDayTypePickerOpen] = useState(false);
    const [selectedSlotBlock, setSelectedSlotBlock] = useState<ScheduleBlock | null>(null);

    const markDone = useMarkAssignmentDone();
    const unassignFromSlot = useUnassignFromSlot();
    const assignToSlot = useAssignToSlot();

    const isLoading = isResolvingDayType || isBlocksLoading || isAssignmentsLoading;

    // Split assignments into slotted vs unslotted
    const { slottedAssignmentsMap, unslottedAssignments } = useMemo(() => {
        const slottedMap = new Map<string, TaskAssignment>();
        const unslotted: TaskAssignment[] = [];

        for (const assignment of dayAssignments) {
            if (assignment.schedule_block_id) {
                slottedMap.set(assignment.schedule_block_id, assignment);
            } else if (assignment.status === "pending") {
                unslotted.push(assignment);
            }
        }

        return { slottedAssignmentsMap: slottedMap, unslottedAssignments: unslotted };
    }, [dayAssignments]);

    // Calculate overdue tasks count from backlog
    const overdueCount = useMemo(() => {
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

    // Map for completion count per task (used by DayAssignmentRow)
    const completionCountsMap = useMemo(() => {
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
        <div className="flex flex-col h-full bg-background">
            {/* Scrollable Container */}
            <div className="flex-1 overflow-y-auto pb-28">
                <div className="max-w-4xl mx-auto px-4 py-5 flex flex-col gap-4">
                    {/* Header: Date + Day Type Badge */}
                    <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
                        <div className="flex items-center gap-2 min-w-0">
                            <CalendarIcon data-icon="inline-start" className="size-5 text-muted-foreground shrink-0" />
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
                                {formatHeaderDate(today)}
                            </h1>
                        </div>

                        {/* Resolved Day-Type Badge Trigger */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsDayTypePickerOpen(true)}
                            className="h-8 px-2.5 text-xs font-medium rounded-full bg-card hover:bg-muted gap-1.5 shrink-0 shadow-2xs"
                        >
                            {dayType?.color ? (
                                <span
                                    className="size-2 rounded-full shrink-0 ring-1 ring-border/50"
                                    style={{ backgroundColor: dayType.color }}
                                />
                            ) : (
                                <span className="size-2 rounded-full bg-muted-foreground shrink-0" />
                            )}
                            <span className="font-semibold text-foreground">{dayType?.name ?? "No Day-Type"}</span>
                            {dayTypeSource === "override" && (
                                <Badge
                                    variant="secondary"
                                    className="text-[9px] px-1 h-3.5 font-normal rounded-full uppercase"
                                >
                                    Override
                                </Badge>
                            )}
                        </Button>
                    </div>

                    {/* Overdue Banner */}
                    {overdueCount > 0 && (
                        <Alert variant="destructive" className="py-2.5">
                            <AlertTriangle data-icon="inline-start" />
                            <AlertTitle className="text-xs font-semibold">Overdue Tasks</AlertTitle>
                            <AlertDescription className="text-xs flex items-center justify-between gap-2">
                                <span>
                                    You have {overdueCount} overdue task{overdueCount > 1 ? "s" : ""} in your backlog.
                                </span>
                                <Link to="/backlog">
                                    <Button size="xs" variant="outline" className="h-6 text-[11px] font-medium">
                                        View Backlog
                                    </Button>
                                </Link>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Desktop Two-Column / Mobile Stack Layout */}
                    <div className="flex flex-col md:grid md:grid-cols-[1fr_320px] md:gap-6 items-start gap-4">
                        {/* Timeline Column */}
                        <div className="flex flex-col gap-3 w-full min-w-0">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Timeline
                                </h2>
                                {scheduleBlocks.length > 0 && (
                                    <span className="text-[11px] text-muted-foreground font-mono">
                                        {scheduleBlocks.length} block{scheduleBlocks.length > 1 ? "s" : ""}
                                    </span>
                                )}
                            </div>

                            {isLoading ? (
                                <div className="flex flex-col gap-2">
                                    <Skeleton className="h-16 w-full rounded-xl" />
                                    <Skeleton className="h-16 w-full rounded-xl" />
                                    <Skeleton className="h-16 w-full rounded-xl" />
                                </div>
                            ) : scheduleBlocks.length === 0 ? (
                                <Empty className="py-10 border border-dashed rounded-xl bg-card/50">
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <CalendarClock />
                                        </EmptyMedia>
                                        <EmptyTitle className="text-xs">No blocks scheduled</EmptyTitle>
                                        <EmptyDescription className="text-[11px] max-w-xs">
                                            {dayTypeId
                                                ? "This day-type doesn't have any schedule blocks yet."
                                                : "Set a day-type for today to load your schedule timeline."}
                                        </EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            ) : (
                                <div className="border border-border/80 rounded-xl bg-card overflow-hidden divide-y divide-border/50 shadow-2xs">
                                    {scheduleBlocks.map((block) => {
                                        const slottedAssignment = slottedAssignmentsMap.get(block.id);
                                        const isFree = block.block_type === "free";
                                        const duration = blockDurationMinutes(block);

                                        return (
                                            <div
                                                key={block.id}
                                                className={cn(
                                                    "flex items-start gap-3 p-3 transition-colors",
                                                    isFree
                                                        ? "bg-card hover:bg-muted/20"
                                                        : "bg-muted/30 hover:bg-muted/50",
                                                )}
                                            >
                                                {/* Left Time Column */}
                                                <div className="flex flex-col items-start w-16 shrink-0 pt-0.5">
                                                    <span className="text-[11px] font-mono font-semibold text-foreground tabular-nums">
                                                        {formatTimeLabel12h(block.start_time)}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
                                                        {formatTimeLabel12h(block.end_time)}
                                                    </span>
                                                </div>

                                                {/* Right Content Column */}
                                                <div className="flex-1 min-w-0 flex flex-col gap-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            <span
                                                                className={cn(
                                                                    "size-1.5 rounded-full shrink-0",
                                                                    isFree ? "bg-primary" : "bg-muted-foreground/50",
                                                                )}
                                                            />
                                                            <span className="text-xs font-semibold text-foreground truncate">
                                                                {block.title}
                                                            </span>
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-[10px] font-normal px-1.5 h-4 text-muted-foreground rounded-full"
                                                            >
                                                                {duration}m
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    {/* Block Notes if Fixed */}
                                                    {block.notes && !slottedAssignment && (
                                                        <p className="text-[11px] text-muted-foreground truncate">
                                                            {block.notes}
                                                        </p>
                                                    )}

                                                    {/* Slotted Task Item inside Free Block */}
                                                    {slottedAssignment && slottedAssignment.task && (
                                                        <div className="mt-1 flex items-center justify-between gap-2 p-2 rounded-lg bg-background border border-border/80 shadow-2xs">
                                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                                <Checkbox
                                                                    checked={slottedAssignment.status === "done"}
                                                                    onCheckedChange={(checked) => {
                                                                        if (checked && slottedAssignment.task) {
                                                                            const priorCount =
                                                                                completionCountsMap.get(
                                                                                    slottedAssignment.task.id,
                                                                                ) ?? 0;
                                                                            markDone.mutate({
                                                                                assignmentId: slottedAssignment.id,
                                                                                taskId: slottedAssignment.task.id,
                                                                                taskType: slottedAssignment.task.type,
                                                                                priorCompletionCount: priorCount,
                                                                            });
                                                                        }
                                                                    }}
                                                                    className="size-4 rounded shrink-0"
                                                                />
                                                                <span
                                                                    className={cn(
                                                                        "text-xs font-medium truncate",
                                                                        slottedAssignment.status === "done"
                                                                            ? "line-through text-muted-foreground"
                                                                            : "text-foreground",
                                                                    )}
                                                                >
                                                                    {slottedAssignment.task.title}
                                                                </span>
                                                            </div>

                                                            <Button
                                                                variant="ghost"
                                                                size="icon-xs"
                                                                onClick={() =>
                                                                    unassignFromSlot.mutate(slottedAssignment.id)
                                                                }
                                                                className="text-muted-foreground hover:text-destructive shrink-0"
                                                                title="Unassign slot"
                                                            >
                                                                <XCircle className="size-3.5" />
                                                            </Button>
                                                        </div>
                                                    )}

                                                    {/* Free Slot Empty State Action */}
                                                    {isFree && !slottedAssignment && (
                                                        <div className="pt-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="xs"
                                                                onClick={() => setSelectedSlotBlock(block)}
                                                                className="h-6 text-[11px] font-normal text-muted-foreground hover:text-foreground border border-dashed border-border/80 px-2 rounded-md"
                                                            >
                                                                <Plus data-icon="inline-start" className="size-3" />
                                                                <span>Place task in slot</span>
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Unslotted Tasks Section / Desktop Right Panel */}
                        <div className="flex flex-col gap-3 w-full">
                            <Card className="border-border/80 shadow-2xs py-1">
                                <CardHeader className="py-2.5 px-3.5 border-b border-border/50">
                                    <div className="flex items-center justify-between gap-2">
                                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <Sparkles className="size-3.5 text-primary" />
                                            <span>To Do Today (Unslotted)</span>
                                        </CardTitle>

                                        <div className="flex items-center gap-1.5">
                                            {/* Direct button to navigate to Backlog */}
                                            <Link to="/backlog">
                                                <Button
                                                    variant="ghost"
                                                    size="xs"
                                                    className="h-6 text-[11px] font-normal text-muted-foreground hover:text-foreground px-2 gap-1 rounded-md"
                                                >
                                                    <Plus data-icon="inline-start" />
                                                    <span>Add Task</span>
                                                </Button>
                                            </Link>

                                            <Badge
                                                variant="secondary"
                                                className="text-[10px] h-4 rounded-full px-1.5 font-mono"
                                            >
                                                {unslottedAssignments.length}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-0 divide-y divide-border/50">
                                    {unslottedAssignments.length === 0 ? (
                                        <div className="p-5 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-1.5">
                                            <CheckCircle2 className="size-5 text-muted-foreground/50" />
                                            <span className="font-medium text-xs text-foreground">
                                                No unslotted tasks today
                                            </span>
                                            <p className="text-[11px] text-muted-foreground max-w-[200px] text-balance">
                                                Assign tasks from your backlog to schedule them for today.
                                            </p>
                                            <Link to="/backlog" className="mt-1">
                                                <Button
                                                    size="xs"
                                                    variant="outline"
                                                    className="h-6.5 text-[11px] font-medium gap-1"
                                                >
                                                    <Plus data-icon="inline-start" />
                                                    <span>Go to Backlog</span>
                                                </Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        unslottedAssignments.map((assignment) => (
                                            <DayAssignmentRow
                                                key={assignment.id}
                                                assignment={assignment}
                                                priorCompletionCount={
                                                    assignment.task
                                                        ? (completionCountsMap.get(assignment.task.id) ?? 0)
                                                        : 0
                                                }
                                            />
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Slot Picker Modal when clicking "+ Place task in slot" on a Free Block */}
            {selectedSlotBlock && (
                <SlotTaskPickerModal
                    open={Boolean(selectedSlotBlock)}
                    onOpenChange={(open) => {
                        if (!open) setSelectedSlotBlock(null);
                    }}
                    block={selectedSlotBlock}
                    unslottedAssignments={unslottedAssignments}
                    onSelectTask={(assignmentId) => {
                        assignToSlot.mutate(
                            { id: assignmentId, schedule_block_id: selectedSlotBlock.id },
                            { onSuccess: () => setSelectedSlotBlock(null) },
                        );
                    }}
                />
            )}

            {/* Day Type Override Dialog */}
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

// Modal for picking an unslotted task to place into a specific free slot
interface SlotTaskPickerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    block: ScheduleBlock;
    unslottedAssignments: TaskAssignment[];
    onSelectTask: (assignmentId: string) => void;
}

function SlotTaskPickerModal({
    open,
    onOpenChange,
    block,
    unslottedAssignments,
    onSelectTask,
}: SlotTaskPickerModalProps) {
    const slotDuration = blockDurationMinutes(block);

    // Filter unslotted tasks that fit into this slot's duration
    const validAssignments = unslottedAssignments.filter((a) => {
        const est = a.task?.estimated_minutes ?? 0;
        return est <= slotDuration;
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm max-h-[75vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Place Task in Slot</DialogTitle>
                    <DialogDescription>
                        Select a task for &quot;{block.title}&quot; ({slotDuration}m free).
                    </DialogDescription>
                </DialogHeader>

                {validAssignments.length === 0 ? (
                    <Empty className="py-6 border border-dashed rounded-xl">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <ListChecks />
                            </EmptyMedia>
                            <EmptyTitle className="text-xs">
                                {unslottedAssignments.length === 0
                                    ? "No unslotted tasks today"
                                    : "No tasks fit this slot"}
                            </EmptyTitle>
                            <EmptyDescription className="text-[11px] max-w-xs">
                                {unslottedAssignments.length === 0
                                    ? "Assign tasks to today from the Backlog first."
                                    : `All unslotted tasks require more than ${slotDuration} minutes.`}
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <div className="flex flex-col gap-1 -mx-1">
                        {validAssignments.map((assignment) => {
                            const task = assignment.task;
                            if (!task) return null;
                            return (
                                <button
                                    key={assignment.id}
                                    type="button"
                                    onClick={() => onSelectTask(assignment.id)}
                                    className="flex items-center justify-between gap-2 px-2.5 py-2.5 rounded-lg text-left transition-colors hover:bg-muted/60"
                                >
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                        <span className="text-xs font-medium text-foreground truncate">
                                            {task.title}
                                        </span>
                                        {task.category && (
                                            <span className="text-[11px] text-muted-foreground truncate">
                                                {task.category.name}
                                            </span>
                                        )}
                                    </div>

                                    {task.estimated_minutes && (
                                        <Badge
                                            variant="secondary"
                                            className="text-[10px] font-normal px-1.5 h-4.5 text-muted-foreground shrink-0 rounded-full gap-1"
                                        >
                                            <Clock data-icon="inline-start" />
                                            <span>{task.estimated_minutes}m</span>
                                        </Badge>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
