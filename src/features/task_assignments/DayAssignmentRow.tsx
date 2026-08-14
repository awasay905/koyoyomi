import * as React from "react";
import { MoreHorizontal, CalendarPlus, XCircle, CheckCircle2 } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import type { TaskAssignment } from "./types";
import { useMarkAssignmentDone, useUnassignFromSlot, useUnassignFromDay } from "./hooks";
import { AssignToSlotSheet } from "./AssignToSlotSheet";

interface DayAssignmentRowProps {
    assignment: TaskAssignment;
    priorCompletionCount: number;
}

export function DayAssignmentRow({ assignment, priorCompletionCount }: DayAssignmentRowProps) {
    const markDone = useMarkAssignmentDone();
    const unassignFromSlot = useUnassignFromSlot();
    const unassignFromDay = useUnassignFromDay();

    const [isSlotSheetOpen, setIsSlotSheetOpen] = React.useState(false);
    const [isLocallyDone, setIsLocallyDone] = React.useState(false);

    const task = assignment.task;
    if (!task) return null;

    const isDone = isLocallyDone || assignment.status === "done";
    const isSlotted = Boolean(assignment.schedule_block_id);

    const handleCheckboxChange = (checked: boolean) => {
        if (!checked) return;
        setIsLocallyDone(true);
        markDone.mutate(
            {
                assignmentId: assignment.id,
                taskId: task.id,
                taskType: task.type,
                priorCompletionCount,
            },
            { onError: () => setIsLocallyDone(false) },
        );
    };

    return (
        <div
            className={cn(
                "group flex items-center justify-between gap-3 p-3.5 px-4 transition-colors hover:bg-accent/40",
                isDone && "opacity-50",
            )}
        >
            <div className="flex items-center gap-3 min-w-0 flex-1">
                <Checkbox
                    checked={isDone}
                    onCheckedChange={(checked) => handleCheckboxChange(Boolean(checked))}
                    aria-label={`Mark ${task.title} complete`}
                    className="size-4 shrink-0"
                />

                <div className="flex flex-col min-w-0 flex-1">
                    <span
                        className={cn(
                            "text-sm truncate",
                            isDone ? "line-through text-muted-foreground font-normal" : "font-medium text-foreground",
                        )}
                    >
                        {task.title}
                    </span>

                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground font-normal">
                        {task.category && <span className="truncate max-w-[120px]">{task.category.name}</span>}
                        {task.category && task.estimated_minutes && <span>•</span>}
                        {task.estimated_minutes && <span className="font-mono">{task.estimated_minutes}m</span>}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                {!isSlotted && !isDone && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsSlotSheetOpen(true)}
                        className="h-7 text-xs px-2.5 gap-1.5"
                    >
                        <CalendarPlus data-icon="inline-start" />
                        <span>Slot</span>
                    </Button>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:text-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                aria-label={`Options for ${task.title}`}
                            >
                                <MoreHorizontal />
                            </Button>
                        }
                    />
                    <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuGroup>
                            {isSlotted && (
                                <DropdownMenuItem onClick={() => unassignFromSlot.mutate(assignment.id)}>
                                    <XCircle data-icon="inline-start" />
                                    <span>Unassign slot</span>
                                </DropdownMenuItem>
                            )}
                            {!isDone && (
                                <DropdownMenuItem onClick={() => handleCheckboxChange(true)}>
                                    <CheckCircle2 data-icon="inline-start" />
                                    <span>Mark done</span>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                onClick={() => unassignFromDay.mutate(assignment.id)}
                                className="text-destructive focus:text-destructive"
                            >
                                <XCircle data-icon="inline-start" />
                                <span>Remove from day</span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {isSlotSheetOpen && (
                <AssignToSlotSheet open={isSlotSheetOpen} onOpenChange={setIsSlotSheetOpen} assignment={assignment} />
            )}
        </div>
    );
}
