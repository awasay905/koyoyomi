import { Check, RotateCcw } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { useDayTypesQuery } from "@/features/day_types/hooks";
import { useSetDayOverride, useClearDayOverride } from "./hooks";

interface DayTypePickerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    date: string; // YYYY-MM-DD — the date being overridden
    dateLabel: string; // human label, e.g. "Today" or "Tue, Aug 12"
    currentDayTypeId: string | null;
    hasOverride: boolean; // whether the current resolution came from an override
}

// Shared "Day-type picker sheet" (§11) — triggered from Today's header badge
// or the Week screen's "Change day type" button. Writes a day_overrides row.
export function DayTypePickerDialog({
    open,
    onOpenChange,
    date,
    dateLabel,
    currentDayTypeId,
    hasOverride,
}: DayTypePickerDialogProps) {
    const { data: dayTypes = [], isLoading } = useDayTypesQuery();
    const setOverride = useSetDayOverride();
    const clearOverride = useClearDayOverride();

    const handleSelect = (dayTypeId: string) => {
        setOverride.mutate({ the_date: date, day_type_id: dayTypeId }, { onSuccess: () => onOpenChange(false) });
    };

    const handleReset = () => {
        clearOverride.mutate(date, { onSuccess: () => onOpenChange(false) });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Change day-type</DialogTitle>
                    <DialogDescription>
                        Set the day-type for {dateLabel}. This overrides the weekly default for this date only.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-9 w-full rounded-lg" />
                        <Skeleton className="h-9 w-full rounded-lg" />
                        <Skeleton className="h-9 w-full rounded-lg" />
                    </div>
                ) : dayTypes.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-4 text-center">
                        No day-types yet. Create one in Settings first.
                    </p>
                ) : (
                    <div className="flex flex-col gap-1 -mx-1">
                        {dayTypes.map((dt) => {
                            const isSelected = dt.id === currentDayTypeId;
                            return (
                                <button
                                    key={dt.id}
                                    type="button"
                                    onClick={() => handleSelect(dt.id)}
                                    disabled={setOverride.isPending}
                                    className={cn(
                                        "flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-left text-xs font-medium transition-colors hover:bg-muted/60",
                                        isSelected && "bg-muted",
                                    )}
                                >
                                    <span className="flex items-center gap-2 min-w-0">
                                        <span
                                            className="size-2.5 rounded-full shrink-0 ring-1 ring-border/50"
                                            style={{ backgroundColor: dt.color ?? undefined }}
                                        />
                                        <span className="truncate">{dt.name}</span>
                                    </span>
                                    {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
                                </button>
                            );
                        })}
                    </div>
                )}

                {hasOverride && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        disabled={clearOverride.isPending}
                        className="text-xs text-muted-foreground hover:text-foreground justify-start gap-1.5 -mt-1"
                    >
                        <RotateCcw data-icon="inline-start" />
                        <span>Reset to weekly default</span>
                    </Button>
                )}
            </DialogContent>
        </Dialog>
    );
}
