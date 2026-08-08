import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Calendar as CalendarIcon, Clock, Plus, Minus } from "lucide-react";

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
import { FieldGroup, Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CreatableCombobox } from "@/components/shared/CreatableCombobox";
import { cn } from "@/lib/utils";

import { addTaskSchema, type AddTaskValues } from "./schemas";
import type { Task, TaskType, Priority, RecurrenceUnit, RecurrenceEndType, CreateTaskInput } from "./types";
import { useAddTask, useUpdateTask, useTaskCategoriesQuery, useCreateTaskCategory } from "./hooks";

interface AddTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    taskToEdit?: Task | null;
}

function formatDateTimeForInput(isoString: string | null): string {
    if (!isoString) return "";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDateForInput(dateString: string | null): string {
    if (!dateString) return "";
    return dateString.slice(0, 10);
}

function todayDateString(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDateLabel(dateString: string): string {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-").map(Number);
    if (!year || !month || !day) return "";
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTimeLabel(isoString: string): string {
    if (!isoString) return "";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

// Shadcn-styled Stepper / Up-Down Control for numeric inputs
interface NumberStepperProps {
    id?: string;
    value: string;
    onChange: (val: string) => void;
    min?: number;
    max?: number;
    step?: number;
    placeholder?: string;
    ariaInvalid?: boolean;
    className?: string;
    disabled?: boolean;
}

function NumberStepper({
    id,
    value,
    onChange,
    min = 1,
    max,
    step = 1,
    placeholder,
    ariaInvalid,
    className,
    disabled,
}: NumberStepperProps) {
    const handleDecrement = () => {
        const parsed = parseInt(value || "0", 10);
        const current = isNaN(parsed) ? min : parsed;
        const next = current - step;
        if (min !== undefined && next < min) return;
        onChange(String(next));
    };

    const handleIncrement = () => {
        const parsed = parseInt(value || "0", 10);
        const current = isNaN(parsed) ? 0 : parsed;
        const next = current + step;
        if (max !== undefined && next > max) return;
        onChange(String(next));
    };

    const isAtMin = min !== undefined && Boolean(value) && parseInt(value, 10) <= min;
    const isAtMax = max !== undefined && Boolean(value) && parseInt(value, 10) >= max;

    return (
        <div
            className={cn(
                "flex items-center h-9 rounded-md border border-input bg-background shrink-0 focus-within:ring-1 focus-within:ring-ring transition-colors",
                ariaInvalid && "border-destructive text-destructive focus-within:ring-destructive",
                className,
            )}
        >
            <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled || isAtMin}
                className="size-8 rounded-none text-muted-foreground hover:text-foreground shrink-0"
                onClick={handleDecrement}
                aria-label="Decrease value"
            >
                <Minus />
            </Button>
            <Input
                id={id}
                type="text"
                inputMode="numeric"
                value={value}
                onChange={(e) => {
                    const cleanVal = e.target.value.replace(/\D/g, "");
                    onChange(cleanVal);
                }}
                placeholder={placeholder}
                aria-invalid={ariaInvalid}
                disabled={disabled}
                className="h-full w-full border-0 p-0 text-center text-xs bg-transparent shadow-none rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled || isAtMax}
                className="size-8 rounded-none text-muted-foreground hover:text-foreground shrink-0"
                onClick={handleIncrement}
                aria-label="Increase value"
            >
                <Plus />
            </Button>
        </div>
    );
}

// Accessible Popover DatePicker
function DatePicker({
    value,
    onChange,
    placeholder = "Select date",
    id,
    ariaInvalid,
}: {
    value: string; // YYYY-MM-DD
    onChange: (val: string) => void;
    placeholder?: string;
    id?: string;
    ariaInvalid?: boolean;
}) {
    const selectedDate = value ? new Date(`${value}T00:00:00`) : undefined;

    return (
        <Popover>
            <PopoverTrigger
                render={
                    <Button
                        id={id}
                        type="button"
                        variant="outline"
                        aria-invalid={ariaInvalid}
                        className={cn(
                            "h-9 w-full justify-start text-left text-xs font-normal bg-background",
                            !value && "text-muted-foreground",
                        )}
                    />
                }
            >
                <CalendarIcon data-icon="inline-start" />
                <span>{value ? formatDateLabel(value) : placeholder}</span>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                        if (!date) {
                            onChange("");
                            return;
                        }
                        const pad = (n: number) => String(n).padStart(2, "0");
                        const dateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
                        onChange(dateStr);
                    }}
                    autoFocus
                />
            </PopoverContent>
        </Popover>
    );
}

// Accessible Popover DateTimePicker
function DateTimePicker({
    value,
    onChange,
    placeholder = "Select deadline",
    id,
    ariaInvalid,
}: {
    value: string; // YYYY-MM-DDTHH:mm
    onChange: (val: string) => void;
    placeholder?: string;
    id?: string;
    ariaInvalid?: boolean;
}) {
    const datePart = value ? value.slice(0, 10) : "";
    const timePart = value ? value.slice(11, 16) : "12:00";
    const selectedDate = datePart ? new Date(`${datePart}T00:00:00`) : undefined;

    const handleDateSelect = (date: Date | undefined) => {
        if (!date) {
            onChange("");
            return;
        }
        const pad = (n: number) => String(n).padStart(2, "0");
        const dateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
        onChange(`${dateStr}T${timePart || "12:00"}`);
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = e.target.value;
        const currentDatePart = datePart || todayDateString();
        onChange(`${currentDatePart}T${newTime}`);
    };

    return (
        <Popover>
            <PopoverTrigger
                render={
                    <Button
                        id={id}
                        type="button"
                        variant="outline"
                        aria-invalid={ariaInvalid}
                        className={cn(
                            "h-9 w-full justify-start text-left text-xs font-normal bg-background",
                            !value && "text-muted-foreground",
                        )}
                    />
                }
            >
                <CalendarIcon data-icon="inline-start" />
                <span>{value ? formatDateTimeLabel(value) : placeholder}</span>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3 flex flex-col gap-3" align="start">
                <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} autoFocus />
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <Clock data-icon="inline-start" className="text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Time:</span>
                    <Input
                        type="time"
                        value={timePart}
                        onChange={handleTimeChange}
                        className="h-8 text-xs bg-background flex-1"
                    />
                </div>
            </PopoverContent>
        </Popover>
    );
}

const emptyDefaults: AddTaskValues = {
    title: "",
    description: "",
    category_id: null,
    type: "one_time",
    priority: "medium",
    estimated_minutes: "",
    notify_enabled: false,
    notify_lead_minutes: "10",
    deadline: "",
    recurrence_unit: undefined,
    recurrence_interval: "",
    start_date: "",
    recurrence_end_type: "never",
    recurrence_end_count: "",
    recurrence_end_date: "",
};

export function AddTaskDialog({ open, onOpenChange, taskToEdit }: AddTaskDialogProps) {
    const isEditing = Boolean(taskToEdit);
    const addTask = useAddTask();
    const updateTask = useUpdateTask();

    const { data: categories = [] } = useTaskCategoriesQuery();
    const createCategory = useCreateTaskCategory();

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<AddTaskValues>({
        resolver: zodResolver(addTaskSchema),
        defaultValues: emptyDefaults,
    });

    const watchType = watch("type");
    const watchNotifyEnabled = watch("notify_enabled");
    const watchRecurrenceUnit = watch("recurrence_unit");
    const watchEndType = watch("recurrence_end_type");

    useEffect(() => {
        if (!open) return;

        if (taskToEdit) {
            reset({
                title: taskToEdit.title,
                description: taskToEdit.description ?? "",
                category_id: taskToEdit.category_id ?? null,
                type: taskToEdit.type,
                priority: taskToEdit.priority,
                estimated_minutes: taskToEdit.estimated_minutes ? String(taskToEdit.estimated_minutes) : "",
                notify_enabled: taskToEdit.notify_enabled,
                notify_lead_minutes: String(taskToEdit.notify_lead_minutes ?? 10),
                deadline: formatDateTimeForInput(taskToEdit.deadline),
                recurrence_unit: taskToEdit.recurrence_unit ?? undefined,
                recurrence_interval: taskToEdit.recurrence_interval ? String(taskToEdit.recurrence_interval) : "",
                start_date: formatDateForInput(taskToEdit.start_date) || todayDateString(),
                recurrence_end_type: taskToEdit.recurrence_end_type ?? "never",
                recurrence_end_count: taskToEdit.recurrence_end_count ? String(taskToEdit.recurrence_end_count) : "",
                recurrence_end_date: formatDateForInput(taskToEdit.recurrence_end_date),
            });
        } else {
            reset(emptyDefaults);
        }
    }, [open, taskToEdit, reset]);

    useEffect(() => {
        if (watchType === "recurring") {
            if (!watchRecurrenceUnit) setValue("recurrence_unit", "week");
            const currentInterval = watch("recurrence_interval");
            if (!currentInterval) setValue("recurrence_interval", "1");
            const currentStart = watch("start_date");
            if (!currentStart) setValue("start_date", todayDateString());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchType]);

    const isPending = addTask.isPending || updateTask.isPending;

    const onSubmit = (values: AddTaskValues) => {
        const payload: CreateTaskInput = {
            title: values.title.trim(),
            description: values.description?.trim() || null,
            category_id: values.category_id || null,
            type: values.type,
            priority: values.priority as Priority,
            estimated_minutes: values.estimated_minutes ? parseInt(values.estimated_minutes, 10) : null,
            notify_enabled: values.notify_enabled,
            notify_lead_minutes: parseInt(values.notify_lead_minutes, 10),
        };

        if (values.type === "one_time") {
            payload.deadline = values.deadline ? new Date(values.deadline).toISOString() : null;
        } else {
            payload.recurrence_unit = values.recurrence_unit as RecurrenceUnit;
            payload.recurrence_interval = values.recurrence_interval ? parseInt(values.recurrence_interval, 10) : null;
            payload.start_date = values.start_date || null;
            payload.recurrence_end_type = (values.recurrence_end_type ?? "never") as RecurrenceEndType;
            payload.recurrence_end_count =
                values.recurrence_end_type === "after_n" && values.recurrence_end_count
                    ? parseInt(values.recurrence_end_count, 10)
                    : null;
            payload.recurrence_end_date =
                values.recurrence_end_type === "on_date" && values.recurrence_end_date
                    ? values.recurrence_end_date
                    : null;
        }

        if (isEditing && taskToEdit) {
            updateTask.mutate({ id: taskToEdit.id, ...payload }, { onSuccess: () => onOpenChange(false) });
        } else {
            addTask.mutate(payload, { onSuccess: () => onOpenChange(false) });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Task" : "Add Task"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Update your task details." : "Add something to your backlog."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-1">
                    <FieldGroup className="gap-3.5">
                        {/* Type */}
                        <Field>
                            <FieldLabel>Type</FieldLabel>
                            <Controller
                                control={control}
                                name="type"
                                render={({ field }) => (
                                    <ToggleGroup
                                        value={[field.value]}
                                        onValueChange={(val) => {
                                            if (val && val.length > 0) field.onChange(val[0] as TaskType);
                                        }}
                                        className="grid grid-cols-2 w-full p-1 bg-muted/70 rounded-lg border border-border/60 gap-1"
                                    >
                                        <ToggleGroupItem
                                            value="one_time"
                                            className="h-7 text-xs text-muted-foreground rounded-md transition-colors aria-pressed:bg-foreground aria-pressed:text-background aria-pressed:font-semibold aria-pressed:shadow-xs data-pressed:bg-foreground data-pressed:text-background data-[state=on]:bg-foreground data-[state=on]:text-background"
                                        >
                                            One-time
                                        </ToggleGroupItem>
                                        <ToggleGroupItem
                                            value="recurring"
                                            className="h-7 text-xs text-muted-foreground rounded-md transition-colors aria-pressed:bg-foreground aria-pressed:text-background aria-pressed:font-semibold aria-pressed:shadow-xs data-pressed:bg-foreground data-pressed:text-background data-[state=on]:bg-foreground data-[state=on]:text-background"
                                        >
                                            Recurring
                                        </ToggleGroupItem>
                                    </ToggleGroup>
                                )}
                            />
                        </Field>

                        {/* Title */}
                        <Field data-invalid={Boolean(errors.title)}>
                            <FieldLabel htmlFor="title">Title</FieldLabel>
                            <Input
                                id="title"
                                placeholder="Task title (e.g., File tax returns)..."
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

                        {/* Description */}
                        <Field>
                            <FieldLabel htmlFor="description">Description</FieldLabel>
                            <Input
                                id="description"
                                placeholder="Optional notes..."
                                {...register("description")}
                                className="h-9 text-xs bg-background"
                            />
                        </Field>

                        {/* Category */}
                        <Field>
                            <FieldLabel>Category</FieldLabel>
                            <Controller
                                control={control}
                                name="category_id"
                                render={({ field }) => (
                                    <CreatableCombobox
                                        options={categories}
                                        value={field.value ?? null}
                                        onChange={field.onChange}
                                        onCreateNew={(name) => createCategory.mutateAsync(name)}
                                        placeholder="Category..."
                                        className="h-9 text-xs bg-background"
                                    />
                                )}
                            />
                        </Field>

                        {/* Priority */}
                        <Field>
                            <FieldLabel>Priority</FieldLabel>
                            <Controller
                                control={control}
                                name="priority"
                                render={({ field }) => (
                                    <ToggleGroup
                                        value={[field.value]}
                                        onValueChange={(val) => {
                                            if (val && val.length > 0) field.onChange(val[0] as Priority);
                                        }}
                                        className="grid grid-cols-3 w-full p-1 bg-muted/70 rounded-lg border border-border/60 gap-1"
                                    >
                                        <ToggleGroupItem
                                            value="low"
                                            className="h-7 text-xs text-muted-foreground rounded-md transition-colors aria-pressed:bg-foreground aria-pressed:text-background aria-pressed:font-semibold aria-pressed:shadow-xs data-pressed:bg-foreground data-pressed:text-background data-[state=on]:bg-foreground data-[state=on]:text-background"
                                        >
                                            Low
                                        </ToggleGroupItem>
                                        <ToggleGroupItem
                                            value="medium"
                                            className="h-7 text-xs text-muted-foreground rounded-md transition-colors aria-pressed:bg-foreground aria-pressed:text-background aria-pressed:font-semibold aria-pressed:shadow-xs data-pressed:bg-foreground data-pressed:text-background data-[state=on]:bg-foreground data-[state=on]:text-background"
                                        >
                                            Medium
                                        </ToggleGroupItem>
                                        <ToggleGroupItem
                                            value="high"
                                            className="h-7 text-xs text-muted-foreground rounded-md transition-colors aria-pressed:bg-destructive aria-pressed:text-destructive-foreground aria-pressed:font-semibold aria-pressed:shadow-xs data-pressed:bg-destructive data-pressed:text-destructive-foreground data-[state=on]:bg-destructive data-[state=on]:text-destructive-foreground"
                                        >
                                            High
                                        </ToggleGroupItem>
                                    </ToggleGroup>
                                )}
                            />
                        </Field>

                        {/* One-time: Deadline */}
                        {watchType === "one_time" && (
                            <Field data-invalid={Boolean(errors.deadline)}>
                                <FieldLabel htmlFor="deadline">Deadline</FieldLabel>
                                <Controller
                                    control={control}
                                    name="deadline"
                                    render={({ field }) => (
                                        <DateTimePicker
                                            id="deadline"
                                            value={field.value ?? ""}
                                            onChange={field.onChange}
                                            ariaInvalid={Boolean(errors.deadline)}
                                        />
                                    )}
                                />
                            </Field>
                        )}

                        {/* Recurring: interval, start date, end condition */}
                        {watchType === "recurring" && (
                            <div className="border border-border/60 rounded-xl p-3 bg-muted/20 flex flex-col gap-3.5">
                                <div className="grid grid-cols-2 gap-3">
                                    <Field data-invalid={Boolean(errors.recurrence_interval)}>
                                        <FieldLabel htmlFor="recurrence_interval" className="text-xs">
                                            Every
                                        </FieldLabel>
                                        <Controller
                                            control={control}
                                            name="recurrence_interval"
                                            render={({ field }) => (
                                                <NumberStepper
                                                    id="recurrence_interval"
                                                    value={field.value ?? ""}
                                                    onChange={field.onChange}
                                                    min={1}
                                                    placeholder="1"
                                                    ariaInvalid={Boolean(errors.recurrence_interval)}
                                                />
                                            )}
                                        />
                                        {errors.recurrence_interval && (
                                            <FieldDescription className="text-destructive text-[11px]">
                                                {errors.recurrence_interval.message}
                                            </FieldDescription>
                                        )}
                                    </Field>

                                    <Field>
                                        <FieldLabel className="text-xs">Unit</FieldLabel>
                                        <Controller
                                            control={control}
                                            name="recurrence_unit"
                                            render={({ field }) => (
                                                <ToggleGroup
                                                    value={[field.value ?? "week"]}
                                                    onValueChange={(val) => {
                                                        if (val.length > 0) field.onChange(val[0] as RecurrenceUnit);
                                                    }}
                                                    className="grid grid-cols-3 w-full p-1 bg-muted/40 rounded-lg border border-border/50 gap-1"
                                                >
                                                    <ToggleGroupItem
                                                        value="day"
                                                        className="h-7 text-xs font-normal rounded-md"
                                                    >
                                                        Day
                                                    </ToggleGroupItem>
                                                    <ToggleGroupItem
                                                        value="week"
                                                        className="h-7 text-xs font-normal rounded-md"
                                                    >
                                                        Week
                                                    </ToggleGroupItem>
                                                    <ToggleGroupItem
                                                        value="month"
                                                        className="h-7 text-xs font-normal rounded-md"
                                                    >
                                                        Month
                                                    </ToggleGroupItem>
                                                </ToggleGroup>
                                            )}
                                        />
                                    </Field>
                                </div>

                                <Field data-invalid={Boolean(errors.start_date)}>
                                    <FieldLabel htmlFor="start_date" className="text-xs">
                                        Start date
                                    </FieldLabel>
                                    <Controller
                                        control={control}
                                        name="start_date"
                                        render={({ field }) => (
                                            <DatePicker
                                                id="start_date"
                                                value={field.value ?? ""}
                                                onChange={field.onChange}
                                                ariaInvalid={Boolean(errors.start_date)}
                                            />
                                        )}
                                    />
                                    {errors.start_date && (
                                        <FieldDescription className="text-destructive text-[11px]">
                                            {errors.start_date.message}
                                        </FieldDescription>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel className="text-xs">Ends</FieldLabel>
                                    <Controller
                                        control={control}
                                        name="recurrence_end_type"
                                        render={({ field }) => (
                                            <ToggleGroup
                                                value={[field.value ?? "never"]}
                                                onValueChange={(val) => {
                                                    if (val.length > 0) field.onChange(val[0] as RecurrenceEndType);
                                                }}
                                                className="grid grid-cols-3 w-full p-1 bg-muted/40 rounded-lg border border-border/50 gap-1"
                                            >
                                                <ToggleGroupItem
                                                    value="never"
                                                    className="h-7 text-xs font-normal rounded-md"
                                                >
                                                    Never
                                                </ToggleGroupItem>
                                                <ToggleGroupItem
                                                    value="after_n"
                                                    className="h-7 text-xs font-normal rounded-md"
                                                >
                                                    After N
                                                </ToggleGroupItem>
                                                <ToggleGroupItem
                                                    value="on_date"
                                                    className="h-7 text-xs font-normal rounded-md"
                                                >
                                                    On date
                                                </ToggleGroupItem>
                                            </ToggleGroup>
                                        )}
                                    />
                                </Field>

                                {watchEndType === "after_n" && (
                                    <Field data-invalid={Boolean(errors.recurrence_end_count)}>
                                        <FieldLabel htmlFor="recurrence_end_count" className="text-xs">
                                            Number of completions
                                        </FieldLabel>
                                        <Controller
                                            control={control}
                                            name="recurrence_end_count"
                                            render={({ field }) => (
                                                <NumberStepper
                                                    id="recurrence_end_count"
                                                    value={field.value ?? ""}
                                                    onChange={field.onChange}
                                                    min={1}
                                                    placeholder="e.g. 10"
                                                    ariaInvalid={Boolean(errors.recurrence_end_count)}
                                                />
                                            )}
                                        />
                                        {errors.recurrence_end_count && (
                                            <FieldDescription className="text-destructive text-[11px]">
                                                {errors.recurrence_end_count.message}
                                            </FieldDescription>
                                        )}
                                    </Field>
                                )}

                                {watchEndType === "on_date" && (
                                    <Field data-invalid={Boolean(errors.recurrence_end_date)}>
                                        <FieldLabel htmlFor="recurrence_end_date" className="text-xs">
                                            End date
                                        </FieldLabel>
                                        <Controller
                                            control={control}
                                            name="recurrence_end_date"
                                            render={({ field }) => (
                                                <DatePicker
                                                    id="recurrence_end_date"
                                                    value={field.value ?? ""}
                                                    onChange={field.onChange}
                                                    ariaInvalid={Boolean(errors.recurrence_end_date)}
                                                />
                                            )}
                                        />
                                        {errors.recurrence_end_date && (
                                            <FieldDescription className="text-destructive text-[11px]">
                                                {errors.recurrence_end_date.message}
                                            </FieldDescription>
                                        )}
                                    </Field>
                                )}
                            </div>
                        )}

                        {/* Estimated minutes */}
                        <Field data-invalid={Boolean(errors.estimated_minutes)}>
                            <FieldLabel htmlFor="estimated_minutes">Est. minutes</FieldLabel>
                            <Controller
                                control={control}
                                name="estimated_minutes"
                                render={({ field }) => (
                                    <NumberStepper
                                        id="estimated_minutes"
                                        value={field.value ?? ""}
                                        onChange={field.onChange}
                                        min={1}
                                        step={5}
                                        placeholder="e.g. 30"
                                        ariaInvalid={Boolean(errors.estimated_minutes)}
                                    />
                                )}
                            />
                            {errors.estimated_minutes && (
                                <FieldDescription className="text-destructive text-[11px]">
                                    {errors.estimated_minutes.message}
                                </FieldDescription>
                            )}
                        </Field>

                        {/* Notifications */}
                        <div className="border border-border/60 rounded-xl p-3 bg-muted/20 flex flex-col gap-3">
                            <Field orientation="horizontal" className="justify-between items-center">
                                <div className="flex flex-col gap-0.5">
                                    <FieldLabel htmlFor="notify_enabled" className="text-xs">
                                        Enable Notification
                                    </FieldLabel>
                                    <FieldDescription className="text-[11px]">
                                        {watchType === "one_time"
                                            ? "Get reminded before deadline"
                                            : "Get reminded when assigned to a slot"}
                                    </FieldDescription>
                                </div>
                                <Controller
                                    control={control}
                                    name="notify_enabled"
                                    render={({ field }) => (
                                        <Switch
                                            id="notify_enabled"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                            </Field>

                            {watchNotifyEnabled && (
                                <Field
                                    className="pt-2 border-t border-border/40"
                                    data-invalid={Boolean(errors.notify_lead_minutes)}
                                >
                                    <FieldLabel htmlFor="notify_lead_minutes" className="text-xs">
                                        Remind before (minutes)
                                    </FieldLabel>
                                    <Controller
                                        control={control}
                                        name="notify_lead_minutes"
                                        render={({ field }) => (
                                            <NumberStepper
                                                id="notify_lead_minutes"
                                                value={field.value ?? ""}
                                                onChange={field.onChange}
                                                min={0}
                                                step={5}
                                                placeholder="10"
                                                ariaInvalid={Boolean(errors.notify_lead_minutes)}
                                                className="h-8"
                                            />
                                        )}
                                    />
                                </Field>
                            )}
                        </div>
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
                                <span>{isEditing ? "Save Changes" : "Add Task"}</span>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
