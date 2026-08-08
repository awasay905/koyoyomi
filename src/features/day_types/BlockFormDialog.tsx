import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldGroup, Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { scheduleBlockSchema, type ScheduleBlockValues } from "./schemas";
import type { ScheduleBlock, BlockType } from "./types";
import { useAddScheduleBlock, useUpdateScheduleBlock } from "./hooks";

interface BlockFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    dayTypeId: string;
    blockToEdit?: ScheduleBlock | null;
    existingCount: number;
}

const emptyDefaults: ScheduleBlockValues = {
    title: "",
    block_type: "fixed",
    start_time: "09:00",
    end_time: "09:30",
    notes: "",
};

export function BlockFormDialog({ open, onOpenChange, dayTypeId, blockToEdit, existingCount }: BlockFormDialogProps) {
    const isEditing = Boolean(blockToEdit);
    const addBlock = useAddScheduleBlock();
    const updateBlock = useUpdateScheduleBlock(dayTypeId);

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<ScheduleBlockValues>({
        resolver: zodResolver(scheduleBlockSchema),
        defaultValues: emptyDefaults,
    });

    useEffect(() => {
        if (!open) return;
        if (blockToEdit) {
            reset({
                title: blockToEdit.title,
                block_type: blockToEdit.block_type,
                start_time: blockToEdit.start_time.slice(0, 5),
                end_time: blockToEdit.end_time.slice(0, 5),
                notes: blockToEdit.notes ?? "",
            });
        } else {
            reset(emptyDefaults);
        }
    }, [open, blockToEdit, reset]);

    const isPending = addBlock.isPending || updateBlock.isPending;

    const onSubmit = (values: ScheduleBlockValues) => {
        const payload = {
            title: values.title.trim(),
            block_type: values.block_type,
            start_time: `${values.start_time}:00`,
            end_time: `${values.end_time}:00`,
            notes: values.notes?.trim() || null,
        };

        if (isEditing && blockToEdit) {
            updateBlock.mutate({ id: blockToEdit.id, ...payload }, { onSuccess: () => onOpenChange(false) });
        } else {
            addBlock.mutate(
                { day_type_id: dayTypeId, ...payload, existingCount },
                { onSuccess: () => onOpenChange(false) },
            );
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Block" : "Add Block"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Update this schedule block." : "Add a block to this day-type's timeline."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-1">
                    <FieldGroup className="gap-3.5">
                        <Field data-invalid={Boolean(errors.title)}>
                            <FieldLabel htmlFor="block_title">Title</FieldLabel>
                            <Input
                                id="block_title"
                                placeholder="e.g., Wake up, Work block 1"
                                aria-invalid={Boolean(errors.title)}
                                {...register("title")}
                                className="h-9 text-xs bg-background"
                                autoFocus
                            />
                            {errors.title && (
                                <FieldDescription className="text-destructive text-[11px]">
                                    {errors.title.message}
                                </FieldDescription>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel>Block type</FieldLabel>
                            <Controller
                                control={control}
                                name="block_type"
                                render={({ field }) => (
                                    <ToggleGroup
                                        value={[field.value]}
                                        onValueChange={(val) => {
                                            if (val && val.length > 0) field.onChange(val[0] as BlockType);
                                        }}
                                        className="grid grid-cols-2 w-full p-1 bg-muted/70 rounded-lg border border-border/60 gap-1"
                                    >
                                        <ToggleGroupItem
                                            value="fixed"
                                            className="h-7 text-xs text-muted-foreground rounded-md transition-colors aria-pressed:bg-foreground aria-pressed:text-background aria-pressed:font-semibold aria-pressed:shadow-xs data-pressed:bg-foreground data-pressed:text-background data-[state=on]:bg-foreground data-[state=on]:text-background"
                                        >
                                            Fixed
                                        </ToggleGroupItem>
                                        <ToggleGroupItem
                                            value="free"
                                            className="h-7 text-xs text-muted-foreground rounded-md transition-colors aria-pressed:bg-foreground aria-pressed:text-background aria-pressed:font-semibold aria-pressed:shadow-xs data-pressed:bg-foreground data-pressed:text-background data-[state=on]:bg-foreground data-[state=on]:text-background"
                                        >
                                            Free
                                        </ToggleGroupItem>
                                    </ToggleGroup>
                                )}
                            />
                            <FieldDescription className="text-[11px]">
                                Fixed blocks are informational (prayer, work, commute). Free blocks are open slots you
                                can assign tasks to.
                            </FieldDescription>
                        </Field>

                        <div className="grid grid-cols-2 gap-3">
                            <Field data-invalid={Boolean(errors.start_time)}>
                                <FieldLabel htmlFor="start_time">Start time</FieldLabel>
                                <Input
                                    id="start_time"
                                    type="time"
                                    step={300}
                                    aria-invalid={Boolean(errors.start_time)}
                                    {...register("start_time")}
                                    className="h-9 text-xs font-mono bg-background"
                                />
                                {errors.start_time && (
                                    <FieldDescription className="text-destructive text-[11px]">
                                        {errors.start_time.message}
                                    </FieldDescription>
                                )}
                            </Field>

                            <Field data-invalid={Boolean(errors.end_time)}>
                                <FieldLabel htmlFor="end_time">End time</FieldLabel>
                                <Input
                                    id="end_time"
                                    type="time"
                                    step={300}
                                    aria-invalid={Boolean(errors.end_time)}
                                    {...register("end_time")}
                                    className="h-9 text-xs font-mono bg-background"
                                />
                                {errors.end_time && (
                                    <FieldDescription className="text-destructive text-[11px]">
                                        {errors.end_time.message}
                                    </FieldDescription>
                                )}
                            </Field>
                        </div>

                        <Field>
                            <FieldLabel htmlFor="notes">Notes</FieldLabel>
                            <Textarea
                                id="notes"
                                placeholder="Optional notes..."
                                {...register("notes")}
                                className="text-xs bg-background min-h-16"
                            />
                        </Field>
                    </FieldGroup>

                    <DialogFooter className="pt-2 gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                            size="sm"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending} size="sm">
                            {isPending ? (
                                <>
                                    <Loader2 data-icon="inline-start" className="animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <span>{isEditing ? "Save Changes" : "Add Block"}</span>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
