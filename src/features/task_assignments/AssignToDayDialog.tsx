import { useState, useMemo } from "react";
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
import { Calendar } from "@/components/ui/calendar";

import type { Task } from "@/features/tasks/types";
import { useAssignTaskToDay, usePendingAssignmentsQuery } from "./hooks";
import { toDateString } from "./utils";

interface AssignToDayDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task: Task;
}

export function AssignToDayDialog({ open, onOpenChange, task }: AssignToDayDialogProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const { data: pendingAssignments = [] } = usePendingAssignmentsQuery();
    const assignToDay = useAssignTaskToDay();

    const selectedDateStr = selectedDate ? toDateString(selectedDate) : null;

    const isAlreadyAssignedToDate = useMemo(() => {
        if (!selectedDateStr) return false;
        return pendingAssignments.some(
            (a) => a.task_id === task.id && a.assigned_date === selectedDateStr && a.status === "pending",
        );
    }, [pendingAssignments, task.id, selectedDateStr]);

    const handleConfirm = () => {
        if (!selectedDate || isAlreadyAssignedToDate) return;
        assignToDay.mutate(
            { task_id: task.id, assigned_date: toDateString(selectedDate) },
            { onSuccess: () => onOpenChange(false) },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <CalendarIcon data-icon="inline-start" className="text-muted-foreground" />
                    <DialogTitle>Assign to a day</DialogTitle>
                    <DialogDescription>
                        Pick a date for &quot;{task.title}&quot;. You can place it into a specific slot later.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center gap-2">
                    <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} autoFocus />

                    {isAlreadyAssignedToDate && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium pt-1">
                            <AlertCircle className="size-3.5" />
                            <span>This task is already assigned to this date.</span>
                        </p>
                    )}
                </div>

                <DialogFooter className="pt-2 gap-2 sm:gap-0">
                    <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleConfirm}
                        disabled={!selectedDate || isAlreadyAssignedToDate || assignToDay.isPending}
                    >
                        {assignToDay.isPending ? (
                            <>
                                <Loader2 data-icon="inline-start" className="animate-spin" />
                                <span>Assigning...</span>
                            </>
                        ) : (
                            <span>Assign</span>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
