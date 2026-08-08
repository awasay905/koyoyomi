import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Check } from "lucide-react";

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
import { FieldGroup, Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { cn } from "@/lib/utils";

import { dayTypeSchema, type DayTypeValues } from "./schemas";
import { DAY_TYPE_COLORS } from "./constants";
import type { DayType } from "./types";
import { useAddDayType, useUpdateDayType } from "./hooks";

interface AddDayTypeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    dayTypeToEdit?: DayType | null;
}

export function AddDayTypeDialog({ open, onOpenChange, dayTypeToEdit }: AddDayTypeDialogProps) {
    const isEditing = Boolean(dayTypeToEdit);
    const addDayType = useAddDayType();
    const updateDayType = useUpdateDayType();

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<DayTypeValues>({
        resolver: zodResolver(dayTypeSchema),
        defaultValues: { name: "", color: DAY_TYPE_COLORS[0] },
    });

    useEffect(() => {
        if (!open) return;
        if (dayTypeToEdit) {
            reset({ name: dayTypeToEdit.name, color: dayTypeToEdit.color ?? DAY_TYPE_COLORS[0] });
        } else {
            reset({ name: "", color: DAY_TYPE_COLORS[Math.floor(Math.random() * DAY_TYPE_COLORS.length)] });
        }
    }, [open, dayTypeToEdit, reset]);

    const isPending = addDayType.isPending || updateDayType.isPending;

    const onSubmit = (values: DayTypeValues) => {
        const payload = { name: values.name.trim(), color: values.color ?? null };

        if (isEditing && dayTypeToEdit) {
            updateDayType.mutate({ id: dayTypeToEdit.id, ...payload }, { onSuccess: () => onOpenChange(false) });
        } else {
            addDayType.mutate(payload, { onSuccess: () => onOpenChange(false) });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Day-Type" : "New Day-Type"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Rename or recolour this day-type." : "Create a reusable schedule template."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-1">
                    <FieldGroup className="gap-3.5">
                        <Field data-invalid={Boolean(errors.name)}>
                            <FieldLabel htmlFor="day_type_name">Name</FieldLabel>
                            <Input
                                id="day_type_name"
                                placeholder="e.g., WFH, Office, Weekend"
                                aria-invalid={Boolean(errors.name)}
                                {...register("name")}
                                className="h-9 text-xs bg-background"
                                autoFocus
                            />
                            {errors.name && (
                                <FieldDescription className="text-destructive text-[11px]">
                                    {errors.name.message}
                                </FieldDescription>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel>Colour</FieldLabel>
                            <Controller
                                control={control}
                                name="color"
                                render={({ field }) => (
                                    <div className="flex flex-wrap gap-2 pt-0.5">
                                        {DAY_TYPE_COLORS.map((c) => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => field.onChange(c)}
                                                className={cn(
                                                    "size-6 rounded-full flex items-center justify-center transition-transform active:scale-95 ring-1 ring-border/60",
                                                    field.value === c &&
                                                        "ring-2 ring-foreground ring-offset-2 ring-offset-background",
                                                )}
                                                style={{ backgroundColor: c }}
                                                aria-label={`Select colour ${c}`}
                                            >
                                                {field.value === c && (
                                                    <Check className="size-3 text-white drop-shadow" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
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
                                <span>{isEditing ? "Save Changes" : "Create"}</span>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
