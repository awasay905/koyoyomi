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
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field";
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

    const form = useForm<DayTypeValues>({
        resolver: zodResolver(dayTypeSchema),
        defaultValues: { name: "", color: DAY_TYPE_COLORS[0] },
    });

    useEffect(() => {
        if (!open) return;
        if (dayTypeToEdit) {
            form.reset({ name: dayTypeToEdit.name, color: dayTypeToEdit.color ?? DAY_TYPE_COLORS[0] });
        } else {
            form.reset({ name: "", color: DAY_TYPE_COLORS[Math.floor(Math.random() * DAY_TYPE_COLORS.length)] });
        }
    }, [open, dayTypeToEdit, form]);

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
                    <DialogTitle>{isEditing ? "Edit Template" : "New Template"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Update the name or colour swatch." : "Create a reusable schedule identifier."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6 py-2">
                    <FieldGroup className="gap-5">
                        <Controller
                            control={form.control}
                            name="name"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        placeholder="e.g., Office, Home, Weekend"
                                        aria-invalid={fieldState.invalid}
                                        autoFocus
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Field>
                            <FieldLabel>Colour Swatch</FieldLabel>
                            <Controller
                                control={form.control}
                                name="color"
                                render={({ field }) => (
                                    <div className="grid grid-cols-7 gap-2.5 pt-1.5 w-full">
                                        {DAY_TYPE_COLORS.map((c) => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => field.onChange(c)}
                                                className={cn(
                                                    "aspect-square w-full rounded-md flex items-center justify-center transition-colors ring-1 ring-border/50 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                                    field.value === c &&
                                                        "ring-2 ring-primary ring-offset-2 ring-offset-background",
                                                )}
                                                style={{ backgroundColor: c }}
                                                aria-label={`Select colour ${c}`}
                                            >
                                                {field.value === c && <Check className="size-4 text-white" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            />
                        </Field>
                    </FieldGroup>

                    <DialogFooter className="gap-2 sm:gap-0">
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
                                <span>{isEditing ? "Save Changes" : "Create"}</span>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
