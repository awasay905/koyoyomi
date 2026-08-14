import * as React from "react";
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
import { Switch } from "@/components/ui/switch";
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { createCustomPrayerSchema, type CreateCustomPrayerValues } from "./schemas";
import { type PrayerTime } from "./types";

interface PrayerTimeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    prayerToEdit: PrayerTime | null;
    onSaveCustom: (payload: CreateCustomPrayerValues) => void;
    onUpdate: (id: string, payload: Partial<Omit<PrayerTime, "id">>) => void;
    isPending: boolean;
}

const LEAD_TIME_OPTIONS = [
    { value: "0", label: "At exact time" },
    { value: "5", label: "5 minutes before" },
    { value: "10", label: "10 minutes before" },
    { value: "15", label: "15 minutes before" },
    { value: "30", label: "30 minutes before" },
    { value: "45", label: "45 minutes before" },
    { value: "60", label: "1 hour before" },
];

function formatTimeInput(timeStr?: string): string {
    if (!timeStr) return "07:00";
    const parts = timeStr.split(":");
    const hours = (parts[0] || "00").padStart(2, "0");
    const minutes = (parts[1] || "00").padStart(2, "0");
    return `${hours}:${minutes}`;
}

export function PrayerTimeDialog({
    open,
    onOpenChange,
    prayerToEdit,
    onSaveCustom,
    onUpdate,
    isPending,
}: PrayerTimeDialogProps) {
    const isEditing = Boolean(prayerToEdit);
    const isSystem = Boolean(prayerToEdit?.is_system);

    const form = useForm<CreateCustomPrayerValues>({
        resolver: zodResolver(createCustomPrayerSchema),
        defaultValues: {
            name: "",
            time: "07:00",
            notify_enabled: false,
            notify_lead_minutes: 5,
        },
    });

    React.useEffect(() => {
        if (!open) return;
        if (prayerToEdit) {
            form.reset({
                name: prayerToEdit.name,
                time: formatTimeInput(prayerToEdit.time),
                notify_enabled: prayerToEdit.notify_enabled,
                notify_lead_minutes: prayerToEdit.notify_lead_minutes ?? 5,
            });
        } else {
            form.reset({
                name: "",
                time: "07:00",
                notify_enabled: false,
                notify_lead_minutes: 5,
            });
        }
    }, [open, prayerToEdit, form]);

    const onSubmit = (values: CreateCustomPrayerValues) => {
        const formattedTime = `${values.time}:00`;

        if (isEditing && prayerToEdit) {
            onUpdate(prayerToEdit.id, {
                name: isSystem ? undefined : values.name.trim(),
                time: formattedTime,
                notify_enabled: values.notify_enabled,
                notify_lead_minutes: values.notify_lead_minutes,
            });
        } else {
            onSaveCustom({
                ...values,
                name: values.name.trim(),
                time: formattedTime,
            });
        }
    };

    const notifyEnabled = form.watch("notify_enabled");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing
                            ? isSystem
                                ? `Adjust ${prayerToEdit?.name}`
                                : "Edit Reference Time"
                            : "New Reference Time"}
                    </DialogTitle>
                    <DialogDescription>
                        {isSystem
                            ? "Configure timing and adhan notification settings."
                            : "Add a schedule marker for workouts, office hours, or routines."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 pt-2">
                    <FieldGroup className="gap-4">
                        {!isSystem && (
                            <Controller
                                control={form.control}
                                name="name"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                                        <Input
                                            {...field}
                                            id={field.name}
                                            placeholder="e.g., Morning Workout, Office Start"
                                            aria-invalid={fieldState.invalid}
                                            autoFocus
                                            maxLength={50}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        )}

                        <Controller
                            control={form.control}
                            name="time"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Time</FieldLabel>
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

                        {/* Notification Toggle Row */}
                        <Controller
                            control={form.control}
                            name="notify_enabled"
                            render={({ field }) => (
                                <Field orientation="horizontal" className="justify-between items-center pt-1">
                                    <div className="flex flex-col">
                                        <FieldLabel htmlFor="notify-switch" className="cursor-pointer">
                                            Notification Alert
                                        </FieldLabel>
                                        <span className="text-xs text-muted-foreground font-normal">
                                            Trigger alarm or push notification
                                        </span>
                                    </div>
                                    <Switch id="notify-switch" checked={field.value} onCheckedChange={field.onChange} />
                                </Field>
                            )}
                        />

                        {notifyEnabled && (
                            <Controller
                                control={form.control}
                                name="notify_lead_minutes"
                                render={({ field }) => (
                                    <Field className="pt-1">
                                        <FieldLabel>Alert Timing</FieldLabel>
                                        <Select
                                            value={String(field.value)}
                                            onValueChange={(val) => {
                                                if (val !== null) {
                                                    field.onChange(parseInt(val, 10));
                                                }
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select lead time" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {LEAD_TIME_OPTIONS.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                )}
                            />
                        )}
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
                                <span>{isEditing ? "Save Changes" : "Create"}</span>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
