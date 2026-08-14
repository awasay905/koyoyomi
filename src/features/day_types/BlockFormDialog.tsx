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
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field";
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
    defaultStartTime?: string;
}

function calculateDefaultEndTime(startTime: string): string {
    const parts = startTime.split(":");
    let hours = parseInt(parts[0] || "08", 10);
    let minutes = parseInt(parts[1] || "00", 10) + 30;

    if (minutes >= 60) {
        hours = (hours + 1) % 24;
        minutes -= 60;
    }

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function BlockFormDialog({
    open,
    onOpenChange,
    dayTypeId,
    blockToEdit,
    existingCount,
    defaultStartTime = "08:00",
}: BlockFormDialogProps) {
    const isEditing = Boolean(blockToEdit);
    const addBlock = useAddScheduleBlock();
    const updateBlock = useUpdateScheduleBlock(dayTypeId);

    const form = useForm<ScheduleBlockValues>({
        resolver: zodResolver(scheduleBlockSchema),
        defaultValues: {
            title: "",
            block_type: "fixed",
            start_time: defaultStartTime,
            end_time: calculateDefaultEndTime(defaultStartTime),
            notes: "",
        },
    });

    useEffect(() => {
        if (!open) return;
        if (blockToEdit) {
            form.reset({
                title: blockToEdit.title,
                block_type: blockToEdit.block_type,
                start_time: blockToEdit.start_time.slice(0, 5),
                end_time: blockToEdit.end_time.slice(0, 5),
                notes: blockToEdit.notes ?? "",
            });
        } else {
            form.reset({
                title: "",
                block_type: "fixed",
                start_time: defaultStartTime,
                end_time: calculateDefaultEndTime(defaultStartTime),
                notes: "",
            });
        }
    }, [open, blockToEdit, defaultStartTime, form]);

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
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Block" : "Add Block"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Modify block timing and type." : "Add a routine slot to this template."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 pt-2">
                    <FieldGroup className="gap-4">
                        <Controller
                            control={form.control}
                            name="title"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        placeholder="e.g., Deep Work, Gym, Commute"
                                        aria-invalid={fieldState.invalid}
                                        autoFocus
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Field>
                            <FieldLabel>Type</FieldLabel>
                            <Controller
                                control={form.control}
                                name="block_type"
                                render={({ field }) => (
                                    <ToggleGroup
                                        value={[field.value]}
                                        onValueChange={(val) => {
                                            if (val && val.length > 0) field.onChange(val[0] as BlockType);
                                        }}
                                        className="grid grid-cols-2 w-full p-0.5 bg-muted/60 rounded-lg border border-border/60"
                                    >
                                        <ToggleGroupItem
                                            value="fixed"
                                            className="h-8 text-xs rounded-md data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:font-medium data-[state=on]:shadow-2xs"
                                        >
                                            Fixed (Routine)
                                        </ToggleGroupItem>
                                        <ToggleGroupItem
                                            value="free"
                                            className="h-8 text-xs rounded-md data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:font-medium data-[state=on]:shadow-2xs"
                                        >
                                            Free (Task Slot)
                                        </ToggleGroupItem>
                                    </ToggleGroup>
                                )}
                            />
                        </Field>

                        <div className="grid grid-cols-2 gap-3">
                            <Controller
                                control={form.control}
                                name="start_time"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>Start Time</FieldLabel>
                                        <Input
                                            {...field}
                                            id={field.name}
                                            type="time"
                                            step={300}
                                            className="font-mono"
                                            aria-invalid={fieldState.invalid}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <Controller
                                control={form.control}
                                name="end_time"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>End Time</FieldLabel>
                                        <Input
                                            {...field}
                                            id={field.name}
                                            type="time"
                                            step={300}
                                            className="font-mono"
                                            aria-invalid={fieldState.invalid}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </div>

                        <Controller
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <Field>
                                    <FieldLabel htmlFor={field.name}>Notes (Optional)</FieldLabel>
                                    <Textarea
                                        {...field}
                                        id={field.name}
                                        placeholder="Specific goals or guidelines..."
                                        className="min-h-16 resize-none"
                                        value={field.value ?? ""}
                                    />
                                </Field>
                            )}
                        />
                    </FieldGroup>

                    <DialogFooter className="gap-2 sm:gap-0 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
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
