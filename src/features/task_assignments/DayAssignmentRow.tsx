import { useState } from "react";
import { Clock, MoreHorizontal, MapPin, XCircle, CheckCircle2 } from "lucide-react";

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

import type { TaskAssignment } from "./types";
import { useMarkAssignmentDone, useUnassignFromSlot, useUnassignFromDay } from "./hooks";
import { AssignToSlotSheet } from "./AssignToSlotSheet";

interface DayAssignmentRowProps {
    assignment: TaskAssignment;
    priorCompletionCount: number; // needed for recurring cycle_number when marking done
}

// Row for a day-level task — used in Today's "unslotted" section and the
// Week day panel's assignment list (§11). Shows "place in slot" when
// unslotted, and lets you remove from slot/day or mark done.
export function DayAssignmentRow({ assignment, priorCompletionCount }: DayAssignmentRowProps) {
    const markDone = useMarkAssignmentDone();
    const unassignFromSlot = useUnassignFromSlot();
    const unassignFromDay = useUnassignFromDay();

    const [isSlotSheetOpen, setIsSlotSheetOpen] = useState(false);
    const [isLocallyDone, setIsLocallyDone] = useState(false);

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
                "group flex items-center justify-between gap-2 px-3 py-2.5 transition-colors duration-150 hover:bg-muted/40",
                isDone && "opacity-50 hover:bg-transparent",
            )}
        >
            <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                <Checkbox
                    checked={isDone}
                    onCheckedChange={(checked) => handleCheckboxChange(Boolean(checked))}
                    aria-label={`Mark "${task.title}" as done`}
                    className="size-4.5 rounded transition-transform active:scale-95 shrink-0"
                />

                <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                    <span
                        className={cn(
                            "text-xs font-medium transition-colors truncate",
                            isDone ? "line-through text-muted-foreground font-normal" : "text-foreground",
                        )}
                    >
                        {task.title}
                    </span>

                    {task.category && (
                        <Badge
                            variant="secondary"
                            className="text-[10px] font-normal px-1.5 h-4.5 text-muted-foreground shrink-0 rounded-full gap-1"
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

                    {task.estimated_minutes && (
                        <Badge
                            variant="secondary"
                            className="text-[10px] font-normal px-1.5 h-4.5 text-muted-foreground shrink-0 rounded-full gap-1"
                        >
                            <Clock data-icon="inline-start" />
                            <span>{task.estimated_minutes}m</span>
                        </Badge>
                    )}

                    {!isSlotted && !isDone && (
                        <Badge
                            variant="outline"
                            className="text-[10px] font-normal px-1.5 h-4.5 text-muted-foreground shrink-0 rounded-full border-dashed"
                        >
                            Unslotted
                        </Badge>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
                {!isSlotted && !isDone && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsSlotSheetOpen(true)}
                        className="h-6.5 px-2 text-[11px] font-normal gap-1"
                    >
                        <MapPin data-icon="inline-start" />
                        <span>Place in slot</span>
                    </Button>
                )}

                <div className="opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 text-muted-foreground hover:text-foreground"
                                    aria-label="More options"
                                />
                            }
                        >
                            <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuGroup>
                                {isSlotted && (
                                    <DropdownMenuItem onClick={() => unassignFromSlot.mutate(assignment.id)}>
                                        <XCircle data-icon="inline-start" />
                                        Unassign from slot
                                    </DropdownMenuItem>
                                )}
                                {!isDone && (
                                    <DropdownMenuItem onClick={() => handleCheckboxChange(true)}>
                                        <CheckCircle2 data-icon="inline-start" />
                                        Mark done
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    onClick={() => unassignFromDay.mutate(assignment.id)}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <XCircle data-icon="inline-start" />
                                    Remove from day
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {isSlotSheetOpen && (
                <AssignToSlotSheet open={isSlotSheetOpen} onOpenChange={setIsSlotSheetOpen} assignment={assignment} />
            )}
        </div>
    );
}
