import { Clock, CalendarClock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { useResolvedDayTypeForDate } from "@/features/weekly_pattern/hooks";
import { useScheduleBlocksQuery } from "@/features/day_types/hooks";
import { formatTimeLabel12h } from "@/features/day_types/utils";
import type { Task } from "@/features/tasks/types";
import { useDayAssignmentsQuery, useQuickAssignToSlot } from "./hooks";
import { getAvailableSlots, getBlockRemainingMinutes } from "./utils";

interface QuickSlotPickerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task: Task;
    date: string; // YYYY-MM-DD
}

export function QuickSlotPicker({ open, onOpenChange, task, date }: QuickSlotPickerProps) {
    const resolvedDate = new Date(`${date}T00:00:00`);
    const { dayTypeId, isLoading: isResolving } = useResolvedDayTypeForDate(resolvedDate);
    const { data: blocks = [], isLoading: isBlocksLoading } = useScheduleBlocksQuery(dayTypeId ?? undefined);
    const { data: dayAssignments = [], isLoading: isAssignmentsLoading } = useDayAssignmentsQuery(date);
    const quickAssign = useQuickAssignToSlot();

    const isLoading = isResolving || isBlocksLoading || isAssignmentsLoading;
    const availableSlots = getAvailableSlots(blocks, dayAssignments, task.estimated_minutes ?? null);

    const handleSelect = (blockId: string) => {
        quickAssign.mutate(
            { task_id: task.id, assigned_date: date, schedule_block_id: blockId },
            { onSuccess: () => onOpenChange(false) },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Place in a slot</DialogTitle>
                    <DialogDescription>
                        {task.title} · {task.estimated_minutes ?? 0}m needed
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-11 w-full rounded-lg" />
                        <Skeleton className="h-11 w-full rounded-lg" />
                    </div>
                ) : !dayTypeId ? (
                    <p className="text-xs text-muted-foreground py-4 text-center">
                        No day-type is set for this date yet.
                    </p>
                ) : availableSlots.length === 0 ? (
                    <Empty className="py-6 border border-dashed rounded-xl">
                        <EmptyHeader>
                            <EmptyMedia variant="icon"><CalendarClock /></EmptyMedia>
                            <EmptyTitle className="text-xs">No free slots long enough</EmptyTitle>
                            <EmptyDescription className="text-[11px] max-w-xs">
                                Every free block today is either too short or already full.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <div className="flex flex-col gap-1 -mx-1">
                        {availableSlots.map((block) => {
                            const remaining = getBlockRemainingMinutes(block, dayAssignments);
                            return (
                                <button
                                    key={block.id}
                                    type="button"
                                    onClick={() => handleSelect(block.id)}
                                    disabled={quickAssign.isPending}
                                    className="flex items-center justify-between gap-2 px-2.5 py-2.5 rounded-lg text-left transition-colors hover:bg-muted/60"
                                >
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                        <span className="text-xs font-medium text-foreground truncate">{block.title}</span>
                                        <span className="text-[11px] font-mono text-muted-foreground tabular-nums">
                                            {formatTimeLabel12h(block.start_time)} – {formatTimeLabel12h(block.end_time)}
                                        </span>
                                    </div>
                                    <Badge variant="secondary" className="text-[10px] font-normal px-1.5 h-4.5 text-muted-foreground shrink-0 rounded-full gap-1">
                                        <Clock data-icon="inline-start" />
                                        <span>{remaining}m left</span>
                                    </Badge>
                                </button>
                            );
                        })}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}