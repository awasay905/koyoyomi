
import { Clock, CalendarClock } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";

import { useResolvedDayTypeForDate } from "@/features/weekly_pattern/hooks";
import { useScheduleBlocksQuery } from "@/features/day_types/hooks";
import { blockDurationMinutes, formatTimeLabel12h } from "@/features/day_types/utils";

import type { TaskAssignment } from "./types";
import { useDayAssignmentsQuery, useAssignToSlot } from "./hooks";
import { getAvailableSlots } from "./utils";

interface AssignToSlotSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    assignment: TaskAssignment;
}

// Shared "Assign task to slot" modal (§11). Shows only free blocks whose
// duration covers the task's estimated time, per §7 step 2.
export function AssignToSlotSheet({ open, onOpenChange, assignment }: AssignToSlotSheetProps) {
    const date = assignment.assigned_date;
    const resolvedDate = new Date(`${date}T00:00:00`);

    const { dayTypeId, isLoading: isResolving } = useResolvedDayTypeForDate(resolvedDate);
    const { data: blocks = [], isLoading: isBlocksLoading } = useScheduleBlocksQuery(dayTypeId ?? undefined);
    const { data: dayAssignments = [], isLoading: isAssignmentsLoading } = useDayAssignmentsQuery(date);
    const assignToSlot = useAssignToSlot();

    const isLoading = isResolving || isBlocksLoading || isAssignmentsLoading;

    const availableSlots = getAvailableSlots(
        blocks,
        dayAssignments,
        assignment.task?.estimated_minutes ?? null,
        assignment.id,
    );

    const handleSelect = (blockId: string) => {
        assignToSlot.mutate({ id: assignment.id, schedule_block_id: blockId }, { onSuccess: () => onOpenChange(false) });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Place in a slot</DialogTitle>
                    <DialogDescription>
                        {assignment.task?.title} · {assignment.task?.estimated_minutes ?? 0}m needed
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
                            <EmptyMedia variant="icon">
                                <CalendarClock />
                            </EmptyMedia>
                            <EmptyTitle className="text-xs">No free slots long enough</EmptyTitle>
                            <EmptyDescription className="text-[11px] max-w-xs">
                                Every free block today is either too short or already taken. Leave this task
                                unslotted, or free up a block.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <div className="flex flex-col gap-1 -mx-1">
                        {availableSlots.map((block) => {
                            const duration = blockDurationMinutes(block);
                            const needed = assignment.task?.estimated_minutes ?? 0;
                            return (
                                <button
                                    key={block.id}
                                    type="button"
                                    onClick={() => handleSelect(block.id)}
                                    disabled={assignToSlot.isPending}
                                    className="flex items-center justify-between gap-2 px-2.5 py-2.5 rounded-lg text-left transition-colors hover:bg-muted/60"
                                >
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                        <span className="text-xs font-medium text-foreground truncate">
                                            {block.title}
                                        </span>
                                        <span className="text-[11px] font-mono text-muted-foreground tabular-nums">
                                            {formatTimeLabel12h(block.start_time)} – {formatTimeLabel12h(block.end_time)}
                                        </span>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className="text-[10px] font-normal px-1.5 h-4.5 text-muted-foreground shrink-0 rounded-full gap-1"
                                    >
                                        <Clock data-icon="inline-start" />
                                        <span>
                                            {duration}m {needed ? `left` : ""}
                                        </span>
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

