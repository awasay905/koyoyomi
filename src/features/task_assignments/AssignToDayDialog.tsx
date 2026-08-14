import * as React from "react";
import { Loader2, Calendar as CalendarIcon, AlertCircle } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

import type { Task } from "@/features/tasks/types";
import { useAssignTaskToDay, usePendingAssignmentsQuery } from "./hooks";
import { toDateString } from "./utils";

interface AssignToDayDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task: Task;
}

function formatDateLabel(dateString: string): string {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-").map(Number);
    if (!year || !month || !day) return "";
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function getTodayString(): string {
    return toDateString(new Date());
}

function getTomorrowString(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return toDateString(d);
}

function getNextMondayString(): string {
    const d = new Date();
    const day = d.getDay();
    const diff = (8 - (day === 0 ? 7 : day)) % 7 || 7;
    d.setDate(d.getDate() + diff);
    return toDateString(d);
}

function truncate(str: string, max = 40): string {
    if (!str) return "";
    return str.length > max ? `${str.slice(0, max).trim()}...` : str;
}

export function AssignToDayDialog({ open, onOpenChange, task }: AssignToDayDialogProps) {
    const [selectedDateStr, setSelectedDateStr] = React.useState<string>(getTodayString);
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

    const { data: pendingAssignments = [] } = usePendingAssignmentsQuery();
    const assignToDay = useAssignTaskToDay();

    const resetState = () => {
        setSelectedDateStr(getTodayString());
        setIsPopoverOpen(false);
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            resetState();
        }
        onOpenChange(nextOpen);
    };

    const isAlreadyAssignedToDate = React.useMemo(() => {
        if (!selectedDateStr) return false;
        return pendingAssignments.some(
            (a) => a.task_id === task.id && a.assigned_date === selectedDateStr && a.status === "pending",
        );
    }, [pendingAssignments, task.id, selectedDateStr]);

    const handleConfirm = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDateStr || isAlreadyAssignedToDate) return;

        assignToDay.mutate(
            { task_id: task.id, assigned_date: selectedDateStr },
            {
                onSuccess: () => {
                    resetState();
                    onOpenChange(false);
                },
            },
        );
    };

    const selectedDate = selectedDateStr ? new Date(`${selectedDateStr}T00:00:00`) : undefined;
    const isToday = selectedDateStr === getTodayString();
    const isTomorrow = selectedDateStr === getTomorrowString();
    const isNextMon = selectedDateStr === getNextMondayString();
    const isPending = assignToDay.isPending;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Assign to a Day</DialogTitle>
                    <DialogDescription className="truncate">
                        Schedule &quot;{truncate(task.title, 35)}&quot; to a specific day.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleConfirm} className="flex flex-col gap-6 pt-2">
                    <FieldGroup className="gap-4">
                        {/* Quick Presets */}
                        <Field>
                            <FieldLabel>Quick Select</FieldLabel>
                            <div className="grid grid-cols-3 gap-2">
                                <Button
                                    type="button"
                                    variant={isToday ? "secondary" : "outline"}
                                    size="sm"
                                    className="text-xs h-8"
                                    onClick={() => setSelectedDateStr(getTodayString())}
                                >
                                    Today
                                </Button>
                                <Button
                                    type="button"
                                    variant={isTomorrow ? "secondary" : "outline"}
                                    size="sm"
                                    className="text-xs h-8"
                                    onClick={() => setSelectedDateStr(getTomorrowString())}
                                >
                                    Tomorrow
                                </Button>
                                <Button
                                    type="button"
                                    variant={isNextMon ? "secondary" : "outline"}
                                    size="sm"
                                    className="text-xs h-8"
                                    onClick={() => setSelectedDateStr(getNextMondayString())}
                                >
                                    Next Mon
                                </Button>
                            </div>
                        </Field>

                        {/* Date Picker Input */}
                        <Field>
                            <FieldLabel htmlFor="target-date">Date</FieldLabel>
                            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                                <PopoverTrigger
                                    render={
                                        <Button
                                            id="target-date"
                                            type="button"
                                            variant="outline"
                                            className={cn(
                                                "h-9 w-full justify-start text-left text-xs font-normal bg-background",
                                                !selectedDateStr && "text-muted-foreground",
                                            )}
                                        />
                                    }
                                >
                                    <CalendarIcon data-icon="inline-start" />
                                    <span>{selectedDateStr ? formatDateLabel(selectedDateStr) : "Select date"}</span>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(date) => {
                                            if (date) {
                                                setSelectedDateStr(toDateString(date));
                                            }
                                            setIsPopoverOpen(false);
                                        }}
                                        autoFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </Field>

                        {/* Conflict Alert */}
                        {isAlreadyAssignedToDate && (
                            <Alert variant="destructive" className="py-2.5 px-3">
                                <AlertCircle data-icon="inline-start" />
                                <AlertDescription className="text-xs">
                                    This task is already assigned to this date.
                                </AlertDescription>
                            </Alert>
                        )}
                    </FieldGroup>

                    <DialogFooter className="gap-2 sm:gap-0 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!selectedDateStr || isAlreadyAssignedToDate || isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 data-icon="inline-start" className="animate-spin" />
                                    <span>Assigning...</span>
                                </>
                            ) : (
                                <span>Assign</span>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
