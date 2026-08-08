import { useState } from "react";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";

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
import { useAssignTaskToDay } from "./hooks";
import { toDateString } from "./utils";

interface AssignToDayDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task: Task;
}

// Shared date picker for Step 1 of §7 ("Assign to a day"), triggered from a
// task's detail sheet or quick actions.
export function AssignToDayDialog({ open, onOpenChange, task }: AssignToDayDialogProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const assignToDay = useAssignTaskToDay();

    const handleConfirm = () => {
        if (!selectedDate) return;
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

                <div className="flex justify-center">
                    <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} autoFocus />
                </div>

                <DialogFooter className="pt-2 gap-2 sm:gap-0">
                    <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleConfirm}
                        disabled={!selectedDate || assignToDay.isPending}
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
