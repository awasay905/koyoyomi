import { useState, useMemo } from "react";
import {
    CalendarDays,
    Plus,
    Calendar as CalendarIcon,
    Check,
    RotateCcw,
    Sparkles,
    Clock,
    CheckCircle2,
    CalendarCheck,
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

    // Compute the 7 calendar dates for Monday -> Sunday
    const weekDates = useMemo(() => {
        const currentDay = today.getDay(); // 0 = Sun
        // Distance to Monday (1 = Mon ... 0 = Sun)
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

    const { data: dayAssignments = [] } = useDayAssignmentsQuery(selectedDateStr);
    const { data: tasks = [] } = useTasksQuery();
    const { data: completions = [] } = useTaskCompletionsQuery();

    // Dialog states
    const [isOverrideDialogOpen, setIsOverrideDialogOpen] = useState(false);
    const [isTaskPickerOpen, setIsTaskPickerOpen] = useState(false);
    const [isQuickPlanOpen, setIsQuickPlanOpen] = useState(false);

    // Resolved day-types for each day of the week strip
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

    // Current selected day resolution
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

    const isLoading = isOverridesLoading || isAssignmentsLoading;

    // Formatting week range label (e.g. "Oct 12 – Oct 18")
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

    return (
        <div className="max-w-xl mx-auto px-4 py-5 flex flex-col gap-4 pb-28">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="size-5 text-muted-foreground shrink-0" />
                        <h1 className="text-xl font-bold tracking-tight">Week Planning</h1>
                    </div>
                    <p className="text-xs text-muted-foreground pl-7 font-medium">{weekRangeLabel}</p>
                </div>

                <div className="flex items-center gap-2">
                    {selectedDateStr !== toDateString(today) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedDate(today)}
                            className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground px-2.5 rounded-full"
                        >
                            Today
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsQuickPlanOpen(true)}
                        className="h-8 px-3 text-xs font-medium rounded-full shadow-2xs"
                    >
                        <CalendarIcon data-icon="inline-start" />
                        <span>Quick Plan</span>
                    </Button>
                </div>
            </div>

            {/* 7-Day Strip */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {resolvedWeek.map((item) => {
                    const isSelected = item.dateStr === selectedDateStr;
                    return (
                        <button
                            key={item.dateStr}
                            type="button"
                            onClick={() => setSelectedDate(item.date)}
                            className={cn(
                                "flex flex-col items-center justify-between py-2 px-1 rounded-xl border text-center transition-all select-none relative min-h-[76px]",
                                isSelected
                                    ? "border-primary/80 bg-primary/10 text-primary font-semibold ring-1 ring-primary/80 shadow-2xs"
                                    : "border-border/80 bg-card hover:bg-muted/50 text-foreground",
                                item.isToday && !isSelected && "border-primary/40 bg-card",
                            )}
                        >
                            {/* Day Name */}
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

                            {/* Date Number & Today Indicator */}
                            <div className="flex flex-col items-center my-0.5">
                                <span
                                    className={cn(
                                        "text-sm font-bold font-mono leading-none",
                                        item.isToday && !isSelected && "text-primary",
                                    )}
                                >
                                    {item.date.getDate()}
                                </span>
                                {item.isToday && <span className="size-1 rounded-full bg-primary mt-1" title="Today" />}
                            </div>

                            {/* Bottom Info: Color Dot & Assignment Count */}
                            <div className="flex items-center gap-1 mt-0.5">
                                <span
                                    className="size-2 rounded-full shrink-0 ring-1 ring-border/40"
                                    style={{
                                        backgroundColor: item.dayType?.color ?? "var(--color-muted-foreground)",
                                    }}
                                    title={item.dayType?.name ?? "Default"}
                                />

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

            {/* Selected Day Panel */}
            <Card className="border-border/80 shadow-2xs overflow-hidden">
                <CardHeader className="py-3 px-4 border-b border-border/50 bg-card/50 flex flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <CardTitle className="text-sm font-bold text-foreground truncate">
                            {selectedDate.toLocaleDateString(undefined, {
                                weekday: "long",
                                month: "short",
                                day: "numeric",
                            })}
                        </CardTitle>

                        {selectedResolved?.dayType && (
                            <Badge
                                variant="secondary"
                                className="text-[10px] font-medium px-2 h-5 rounded-full gap-1.5 shrink-0"
                            >
                                {selectedResolved.dayType.color && (
                                    <span
                                        className="size-1.5 rounded-full shrink-0"
                                        style={{ backgroundColor: selectedResolved.dayType.color }}
                                    />
                                )}
                                <span>{selectedResolved.dayType.name}</span>
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

                <CardContent className="p-4 flex flex-col gap-4">
                    {/* Schedule Preview */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1.5">
                            <Clock className="size-3.5 text-muted-foreground shrink-0" />
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Schedule Blocks ({scheduleBlocks.length})
                            </span>
                        </div>

                        {scheduleBlocks.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic px-1">
                                No schedule blocks defined for this day-type.
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-1.5">
                                {scheduleBlocks.map((b) => (
                                    <div
                                        key={b.id}
                                        className={cn(
                                            "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-colors",
                                            b.block_type === "free"
                                                ? "border-primary/30 bg-primary/5 text-foreground"
                                                : "border-border/60 bg-muted/30 text-foreground",
                                        )}
                                    >
                                        <span className="font-mono text-[10px] text-muted-foreground font-medium">
                                            {b.start_time.slice(0, 5)}
                                        </span>
                                        <span className="font-medium text-[11px]">{b.title}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Assigned Tasks List */}
                    <div className="flex flex-col gap-2.5 pt-3 border-t border-border/50">
                        <div className="flex items-center justify-between px-0.5">
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="size-3.5 text-muted-foreground shrink-0" />
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Tasks Assigned ({dayAssignments.length})
                                </span>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsTaskPickerOpen(true)}
                                className="h-7 text-xs font-normal gap-1 rounded-full px-2.5"
                            >
                                <Plus data-icon="inline-start" />
                                <span>Assign task</span>
                            </Button>
                        </div>

                        {isLoading ? (
                            <Skeleton className="h-14 w-full rounded-xl" />
                        ) : dayAssignments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center py-8 px-4 border border-dashed rounded-xl bg-card/50 gap-2">
                                <div className="p-2.5 rounded-full bg-muted/60 text-muted-foreground">
                                    <Sparkles className="size-4" />
                                </div>
                                <h3 className="font-medium text-xs text-foreground">No tasks assigned</h3>
                                <p className="text-[11px] text-muted-foreground max-w-xs">
                                    Plan your day by assigning tasks from your backlog.
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsTaskPickerOpen(true)}
                                    className="mt-1 h-7 text-xs gap-1.5 rounded-full"
                                >
                                    <Plus data-icon="inline-start" />
                                    <span>Assign task</span>
                                </Button>
                            </div>
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

            {/* Change Day Type Override Dialog */}
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

            {/* Backlog Task Picker Dialog */}
            <TaskPickerDialog open={isTaskPickerOpen} onOpenChange={setIsTaskPickerOpen} date={selectedDateStr} />

            {/* Quick Plan Dialog */}
            <QuickPlanDialog open={isQuickPlanOpen} onOpenChange={setIsQuickPlanOpen} weekDates={weekDates} />
        </div>
    );
}

// Bulk 7-Day Quick Plan Dialog
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
                        <CalendarCheck className="size-4 text-muted-foreground" />
                        <span>Quick Plan Week</span>
                    </DialogTitle>
                    <DialogDescription>
                        Set default or override day-types for all 7 days of this week.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-3 py-2 divide-y divide-border/40">
                    {weekDates.map((date) => {
                        const dateStr = toDateString(date);
                        const override = overrides.find((o) => o.the_date === dateStr);
                        const resolved = resolveDayType(override, pattern, date);
                        const currentDayType = dayTypes.find((dt) => dt.id === resolved.dayTypeId);

                        return (
                            <div key={dateStr} className="flex flex-col gap-2 pt-2.5 first:pt-0">
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
                                            className="h-6 text-[11px] px-2 text-muted-foreground hover:text-foreground gap-1"
                                            title="Reset to default pattern"
                                        >
                                            <RotateCcw data-icon="inline-start" className="size-3" />
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
                                                    "text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5 select-none",
                                                    isSelected
                                                        ? "bg-primary text-primary-foreground border-primary shadow-2xs font-semibold"
                                                        : "bg-muted/30 border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/60",
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
                    <Button size="sm" onClick={() => onOpenChange(false)} className="w-full sm:w-auto text-xs">
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
