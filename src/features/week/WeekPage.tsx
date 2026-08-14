import { useState, useMemo } from "react";
import {
    Plus,
    Calendar as CalendarIcon,
    Check,
    RotateCcw,
    Clock,
    CheckCircle2,
    CalendarCheck,
    Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";

import { useDayTypesQuery, useScheduleBlocksQuery } from "@/features/day_types/hooks";
import {
    useWeeklyPatternQuery,
    useDayOverridesRangeQuery,
    useSetDayOverride,
    useClearDayOverride,
} from "@/features/weekly_pattern/hooks";
import {
    resolveDayType,
    toDateString,
    DAY_NAMES_SHORT_BY_INDEX,
    WEEK_DISPLAY_ORDER,
} from "@/features/weekly_pattern/utils";
import { DayTypePickerDialog } from "@/features/weekly_pattern/DayTypePickerDialog";

import { useAssignmentsRangeQuery, useDayAssignmentsQuery } from "@/features/task_assignments/hooks";
import { TaskPickerDialog } from "@/features/task_assignments/TaskPickerDialog";
import { DayAssignmentRow } from "@/features/task_assignments/DayAssignmentRow";
import { useTasksQuery, useTaskCompletionsQuery } from "@/features/tasks/hooks";
import { computeRecurringState } from "@/features/tasks/recurrence";
import { useNow } from "@/hooks/useNow";
import { cn } from "@/lib/utils";

export function WeekPage() {
    const nowMs = useNow();
    const today = useMemo(() => new Date(nowMs), [nowMs]);

    // Compute 7 calendar dates: Monday -> Sunday
    const weekDates = useMemo(() => {
        const currentDay = today.getDay(); // 0 = Sun
        const distToMon = currentDay === 0 ? -6 : 1 - currentDay;

        const monday = new Date(today);
        monday.setDate(today.getDate() + distToMon);

        return WEEK_DISPLAY_ORDER.map((_, index) => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + index);
            return d;
        });
    }, [today]);

    const startDateStr = useMemo(() => toDateString(weekDates[0]), [weekDates]);
    const endDateStr = useMemo(() => toDateString(weekDates[6]), [weekDates]);

    const [selectedDate, setSelectedDate] = useState<Date>(today);
    const selectedDateStr = useMemo(() => toDateString(selectedDate), [selectedDate]);

    // Data queries
    const { data: dayTypes = [] } = useDayTypesQuery();
    const { data: pattern = [] } = useWeeklyPatternQuery();
    const { data: overrides = [], isLoading: isOverridesLoading } = useDayOverridesRangeQuery(startDateStr, endDateStr);
    const { data: weekAssignments = [], isLoading: isAssignmentsLoading } = useAssignmentsRangeQuery(
        startDateStr,
        endDateStr,
    );

    const { data: dayAssignments = [], isLoading: isDayAssignmentsLoading } = useDayAssignmentsQuery(selectedDateStr);
    const { data: tasks = [] } = useTasksQuery();
    const { data: completions = [] } = useTaskCompletionsQuery();

    // Dialog states
    const [isOverrideDialogOpen, setIsOverrideDialogOpen] = useState(false);
    const [isTaskPickerOpen, setIsTaskPickerOpen] = useState(false);
    const [isQuickPlanOpen, setIsQuickPlanOpen] = useState(false);

    // Resolved day-types for each day in week strip
    const resolvedWeek = useMemo(() => {
        return weekDates.map((date) => {
            const dateStr = toDateString(date);
            const override = overrides.find((o) => o.the_date === dateStr);
            const resolved = resolveDayType(override, pattern, date);
            const dayType = dayTypes.find((dt) => dt.id === resolved.dayTypeId);
            const assignmentCount = weekAssignments.filter(
                (a) => a.assigned_date === dateStr && a.status === "pending",
            ).length;

            return {
                date,
                dateStr,
                dayType,
                source: resolved.source,
                hasOverride: resolved.source === "override",
                assignmentCount,
                isToday: dateStr === toDateString(today),
            };
        });
    }, [weekDates, overrides, pattern, dayTypes, weekAssignments, today]);

    // Selected day resolution
    const selectedResolved = useMemo(
        () => resolvedWeek.find((r) => r.dateStr === selectedDateStr),
        [resolvedWeek, selectedDateStr],
    );

    const { data: scheduleBlocks = [] } = useScheduleBlocksQuery(selectedResolved?.dayType?.id ?? undefined);

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

    const isWeekLoading = isOverridesLoading || isAssignmentsLoading;

    const weekRangeLabel = useMemo(() => {
        const startMonth = weekDates[0].toLocaleDateString(undefined, { month: "short" });
        const startDay = weekDates[0].getDate();
        const endMonth = weekDates[6].toLocaleDateString(undefined, { month: "short" });
        const endDay = weekDates[6].getDate();

        if (startMonth === endMonth) {
            return `${startMonth} ${startDay} – ${endDay}`;
        }
        return `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
    }, [weekDates]);

    const isViewingToday = selectedDateStr === toDateString(today);

    return (
        <div className="mx-auto flex max-w-lg flex-col gap-8 px-4 py-8 pb-28">
            {/* Page Header */}
            <header className="flex items-start justify-between gap-4 min-w-0">
                <div className="flex flex-col min-w-0">
                    <h1 className="text-xl font-bold tracking-tight truncate leading-none">Week Planning</h1>
                    <p className="text-sm text-muted-foreground truncate mt-1.5 font-medium">{weekRangeLabel}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {!isViewingToday && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedDate(today)}
                            className="text-xs text-muted-foreground hover:text-foreground"
                        >
                            Today
                        </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setIsQuickPlanOpen(true)} className="text-xs">
                        <CalendarIcon data-icon="inline-start" />
                        <span>Quick Plan</span>
                    </Button>
                </div>
            </header>

            {/* 7-Day Strip Navigation */}
            <section className="flex flex-col gap-2">
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {resolvedWeek.map((item) => {
                        const isSelected = item.dateStr === selectedDateStr;
                        return (
                            <button
                                key={item.dateStr}
                                type="button"
                                onClick={() => setSelectedDate(item.date)}
                                aria-label={`${item.date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })} - ${item.dayType?.name ?? "No template"}`}
                                className={cn(
                                    "flex flex-col items-center justify-between py-2 px-1 rounded-xl border text-center transition-colors select-none relative min-h-[76px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                    isSelected
                                        ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary/80"
                                        : "border-border/80 bg-card hover:bg-accent/80 text-foreground",
                                    item.isToday && !isSelected && "border-primary/40",
                                )}
                            >
                                {/* Day of week */}
                                <span
                                    className={cn(
                                        "text-[10px] font-semibold uppercase tracking-wider",
                                        isSelected
                                            ? "text-primary"
                                            : item.isToday
                                              ? "text-primary font-bold"
                                              : "text-muted-foreground",
                                    )}
                                >
                                    {DAY_NAMES_SHORT_BY_INDEX[item.date.getDay()]}
                                </span>

                                {/* Date number & today marker */}
                                <div className="flex flex-col items-center my-0.5">
                                    <span
                                        className={cn(
                                            "text-sm font-bold font-mono leading-none",
                                            item.isToday && !isSelected && "text-primary",
                                        )}
                                    >
                                        {item.date.getDate()}
                                    </span>
                                    {item.isToday && <span className="size-1 rounded-full bg-primary mt-1" />}
                                </div>

                                {/* Meta Swatch / Override dot / Pending Count */}
                                <div className="flex items-center gap-1 mt-0.5">
                                    <span
                                        className="size-2 rounded-full shrink-0 ring-1 ring-border/50"
                                        style={{
                                            backgroundColor: item.dayType?.color ?? "var(--muted-foreground)",
                                        }}
                                        title={item.dayType?.name ?? "Template"}
                                    />

                                    {/* Override Indicator Dot */}
                                    {item.hasOverride && (
                                        <span
                                            className="size-1.5 rounded-full bg-primary shrink-0 ring-1 ring-background"
                                            title="Manual Day Override"
                                        />
                                    )}

                                    {item.assignmentCount > 0 && (
                                        <Badge
                                            variant="secondary"
                                            className="text-[9px] px-1 h-3.5 rounded-full font-mono font-medium leading-none"
                                        >
                                            {item.assignmentCount}
                                        </Badge>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Selected Day Workspace Card */}
            <section className="flex flex-col gap-2">
                <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
                    <CardHeader className="p-4 border-b border-border/50 bg-card/60 flex flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <CardTitle className="text-sm font-bold tracking-tight truncate text-foreground leading-none">
                                {selectedDate.toLocaleDateString(undefined, {
                                    weekday: "long",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </CardTitle>

                            {selectedResolved?.dayType && (
                                <Badge
                                    variant="secondary"
                                    className="text-[10px] font-medium px-2 h-5 rounded-md gap-1.5 shrink-0"
                                >
                                    {selectedResolved.dayType.color && (
                                        <span
                                            className="size-1.5 rounded-full shrink-0"
                                            style={{ backgroundColor: selectedResolved.dayType.color }}
                                        />
                                    )}
                                    <span className="truncate">{selectedResolved.dayType.name}</span>
                                    {selectedResolved.hasOverride && (
                                        <span className="text-[9px] text-muted-foreground font-normal">(Override)</span>
                                    )}
                                </Badge>
                            )}
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsOverrideDialogOpen(true)}
                            className="h-7 text-xs font-normal text-muted-foreground hover:text-foreground shrink-0"
                        >
                            Change
                        </Button>
                    </CardHeader>

                    <CardContent className="p-0 flex flex-col gap-0">
                        {/* Schedule Routine Blocks */}
                        <div className="p-4 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="text-muted-foreground shrink-0" />
                                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Routine Blocks ({scheduleBlocks.length})
                                    </h2>
                                </div>
                            </div>

                            {scheduleBlocks.length === 0 ? (
                                <p className="text-xs text-muted-foreground italic px-0.5">
                                    No routine blocks configured for this template.
                                </p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {scheduleBlocks.map((b) => (
                                        <button
                                            key={b.id}
                                            type="button"
                                            onClick={() => setIsOverrideDialogOpen(true)}
                                            className={cn(
                                                "flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary text-left",
                                                b.block_type === "free"
                                                    ? "border-primary/40 bg-primary/5 text-foreground hover:bg-primary/10"
                                                    : "border-border/80 bg-muted/30 text-foreground hover:bg-accent/80",
                                            )}
                                        >
                                            <span className="font-mono text-[11px] text-muted-foreground font-medium">
                                                {b.start_time.slice(0, 5)}
                                            </span>
                                            <span className="font-medium text-xs truncate max-w-[140px]">
                                                {b.title}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Structural Divider */}
                        <div className="h-px bg-border/50 mx-4" />

                        {/* Task Assignments Section */}
                        <div className="p-4 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="text-muted-foreground shrink-0" />
                                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Assigned Tasks ({dayAssignments.length})
                                    </h2>
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsTaskPickerOpen(true)}
                                    className="h-7 text-xs px-2.5"
                                >
                                    <Plus data-icon="inline-start" />
                                    <span>Assign Task</span>
                                </Button>
                            </div>

                            {isDayAssignmentsLoading || isWeekLoading ? (
                                <Skeleton className="h-16 w-full rounded-xl" />
                            ) : dayAssignments.length === 0 ? (
                                <Empty className="py-8 border border-dashed border-border/80 rounded-xl bg-card/40">
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <Sparkles />
                                        </EmptyMedia>
                                        <EmptyTitle>No tasks assigned</EmptyTitle>
                                        <EmptyDescription className="max-w-[240px]">
                                            Schedule tasks from your backlog to plan your day.
                                        </EmptyDescription>
                                    </EmptyHeader>
                                    <EmptyContent>
                                        <Button variant="outline" size="sm" onClick={() => setIsTaskPickerOpen(true)}>
                                            <Plus data-icon="inline-start" />
                                            <span>Assign Task</span>
                                        </Button>
                                    </EmptyContent>
                                </Empty>
                            ) : (
                                <div className="border border-border/80 rounded-xl bg-card overflow-hidden divide-y divide-border/50 shadow-2xs">
                                    {dayAssignments.map((assignment) => (
                                        <DayAssignmentRow
                                            key={assignment.id}
                                            assignment={assignment}
                                            priorCompletionCount={
                                                assignment.task ? (completionCountsMap.get(assignment.task.id) ?? 0) : 0
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* Dialog Modals */}
            <DayTypePickerDialog
                open={isOverrideDialogOpen}
                onOpenChange={setIsOverrideDialogOpen}
                date={selectedDateStr}
                dateLabel={selectedDate.toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                })}
                currentDayTypeId={selectedResolved?.dayType?.id ?? null}
                hasOverride={selectedResolved?.hasOverride ?? false}
            />

            <TaskPickerDialog open={isTaskPickerOpen} onOpenChange={setIsTaskPickerOpen} date={selectedDateStr} />

            <QuickPlanDialog open={isQuickPlanOpen} onOpenChange={setIsQuickPlanOpen} weekDates={weekDates} />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Bulk 7-Day Quick Plan Dialog                                               */
/* -------------------------------------------------------------------------- */

interface QuickPlanDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    weekDates: Date[];
}

function QuickPlanDialog({ open, onOpenChange, weekDates }: QuickPlanDialogProps) {
    const { data: dayTypes = [] } = useDayTypesQuery();
    const { data: pattern = [] } = useWeeklyPatternQuery();

    const startDateStr = toDateString(weekDates[0]);
    const endDateStr = toDateString(weekDates[6]);
    const { data: overrides = [] } = useDayOverridesRangeQuery(startDateStr, endDateStr);

    const setOverride = useSetDayOverride();
    const clearOverride = useClearDayOverride();

    const handleSelectDayType = (date: Date, dayTypeId: string) => {
        const dateStr = toDateString(date);
        setOverride.mutate({ the_date: dateStr, day_type_id: dayTypeId });
    };

    const handleClear = (date: Date) => {
        const dateStr = toDateString(date);
        clearOverride.mutate(dateStr);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CalendarCheck className="text-muted-foreground shrink-0" />
                        <span>Quick Plan Week</span>
                    </DialogTitle>
                    <DialogDescription>
                        Set default templates or override routines for each day this week.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-2 divide-y divide-border/40">
                    {weekDates.map((date) => {
                        const dateStr = toDateString(date);
                        const override = overrides.find((o) => o.the_date === dateStr);
                        const resolved = resolveDayType(override, pattern, date);
                        const currentDayType = dayTypes.find((dt) => dt.id === resolved.dayTypeId);

                        return (
                            <div key={dateStr} className="flex flex-col gap-2 pt-3 first:pt-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-foreground">
                                        {date.toLocaleDateString(undefined, {
                                            weekday: "short",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </span>

                                    {override && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleClear(date)}
                                            className="h-6 text-[11px] px-2 text-muted-foreground hover:text-foreground"
                                            title="Reset to default pattern"
                                        >
                                            <RotateCcw data-icon="inline-start" />
                                            <span>Reset</span>
                                        </Button>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    {dayTypes.map((dt) => {
                                        const isSelected = dt.id === currentDayType?.id;
                                        return (
                                            <button
                                                key={dt.id}
                                                type="button"
                                                onClick={() => handleSelectDayType(date, dt.id)}
                                                className={cn(
                                                    "text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
                                                    isSelected
                                                        ? "bg-primary text-primary-foreground border-primary font-semibold"
                                                        : "bg-muted/30 border-border/80 text-muted-foreground hover:text-foreground hover:bg-accent/80",
                                                )}
                                            >
                                                {dt.color && (
                                                    <span
                                                        className="size-1.5 rounded-full shrink-0"
                                                        style={{
                                                            backgroundColor: isSelected
                                                                ? "var(--primary-foreground)"
                                                                : dt.color,
                                                        }}
                                                    />
                                                )}
                                                <span>{dt.name}</span>
                                                {isSelected && <Check className="size-3 shrink-0 ml-0.5" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <DialogFooter>
                    <Button size="sm" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
