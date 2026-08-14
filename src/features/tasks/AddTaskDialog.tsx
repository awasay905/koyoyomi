import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Loader2,
    Calendar as CalendarIcon,
    Clock,
    Plus,
    Minus,
    ChevronDown,
    ChevronUp,
    SlidersHorizontal,
    Bell,
    Tag,
    Flag,
    Timer,
    FileText,
} from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const DURATION_CHIPS = [
    { value: "none", label: "None" },
    { value: "15", label: "15m" },
    { value: "30", label: "30m" },
    { value: "45", label: "45m" },
    { value: "60", label: "1h" },
    { value: "90", label: "1.5h" },
];

const NOTIFY_LEAD_OPTIONS = [
    { value: "0", label: "At exact time" },
    { value: "5", label: "5m before" },
    { value: "10", label: "10m before" },
    { value: "15", label: "15m before" },
    { value: "30", label: "30m before" },
    { value: "60", label: "1h before" },
];

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

interface NumberStepperProps {
    id?: string;
    value: string;
    onChange: (val: string) => void;
    min?: number;
    max?: number;
    step?: number;
    placeholder?: string;
    ariaInvalid?: boolean;
    disabled?: boolean;
    className?: string;
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
    disabled,
    className,
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
                "flex items-center h-8.5 rounded-lg border border-border/80 bg-background focus-within:ring-1 focus-within:ring-ring transition-colors",
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
                className="h-full w-full border-0 p-0 text-center text-xs bg-transparent shadow-none rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 font-mono"
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

function DatePicker({
    value,
    onChange,
    placeholder = "Select date",
    id,
    ariaInvalid,
}: {
    value: string;
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
                            "h-8.5 w-full justify-start text-left text-xs font-normal bg-background border-border/80",
                            !value && "text-muted-foreground",
                        )}
                    />
                }
            >
                <CalendarIcon data-icon="inline-start" />
                <span className="truncate">{value ? formatDateLabel(value) : placeholder}</span>
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

function DateTimePicker({
    value,
    onChange,
    placeholder = "Select deadline",
    id,
    ariaInvalid,
}: {
    value: string;
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
                            "h-9 w-full justify-start text-left text-xs font-normal bg-background border-border/80",
                            !value && "text-muted-foreground",
                        )}
                    />
                }
            >
                <CalendarIcon data-icon="inline-start" />
                <span className="truncate">{value ? formatDateTimeLabel(value) : placeholder}</span>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3 flex flex-col gap-3" align="start">
                <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} autoFocus />
                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                    <Clock className="size-4 text-muted-foreground shrink-0" />
                    <span className="text-xs font-medium text-muted-foreground">Time:</span>
                    <Input
                        type="time"
                        value={timePart}
                        onChange={handleTimeChange}
                        className="h-8 text-xs font-mono bg-background flex-1"
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

    const [isAdvancedOpen, setIsAdvancedOpen] = React.useState(false);
    const [recurrencePreset, setRecurrencePreset] = React.useState<"day" | "week" | "month" | "custom">("week");

    const form = useForm<AddTaskValues>({
        resolver: zodResolver(addTaskSchema),
        defaultValues: emptyDefaults,
    });

    const watchType = form.watch("type");
    const watchNotifyEnabled = form.watch("notify_enabled");
    const watchRecurrenceUnit = form.watch("recurrence_unit");
    const watchInterval = form.watch("recurrence_interval");
    const watchEndType = form.watch("recurrence_end_type");

    React.useEffect(() => {
        if (!open) return;

        if (taskToEdit) {
            const hasAdvancedContent = Boolean(
                taskToEdit.description ||
                taskToEdit.category_id ||
                taskToEdit.estimated_minutes ||
                taskToEdit.notify_enabled ||
                taskToEdit.priority !== "medium",
            );
            setIsAdvancedOpen(hasAdvancedContent);

            const unit = taskToEdit.recurrence_unit;
            const interval = taskToEdit.recurrence_interval;
            if (interval === 1 && (unit === "day" || unit === "week" || unit === "month")) {
                setRecurrencePreset(unit);
            } else if (taskToEdit.type === "recurring") {
                setRecurrencePreset("custom");
            } else {
                setRecurrencePreset("week");
            }

            form.reset({
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
            setIsAdvancedOpen(false);
            setRecurrencePreset("week");
            form.reset(emptyDefaults);
        }
    }, [open, taskToEdit, form]);

    React.useEffect(() => {
        if (watchType === "recurring") {
            if (!watchRecurrenceUnit) form.setValue("recurrence_unit", "week");
            if (!watchInterval) form.setValue("recurrence_interval", "1");
            const currentStart = form.watch("start_date");
            if (!currentStart) form.setValue("start_date", todayDateString());
        }
    }, [watchType, watchRecurrenceUnit, watchInterval, form]);

    const handleRecurrencePresetChange = (preset: "day" | "week" | "month" | "custom") => {
        setRecurrencePreset(preset);
        if (preset === "custom") {
            if (!form.getValues("recurrence_interval")) form.setValue("recurrence_interval", "2");
        } else {
            form.setValue("recurrence_unit", preset);
            form.setValue("recurrence_interval", "1");
        }
    };

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
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Task" : "New Task"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Update your backlog task settings." : "Add a targeted item to your schedule."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 pt-1">
                    <FieldGroup className="gap-4">
                        {/* Task Type Switcher */}
                        <Field>
                            <Controller
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <ToggleGroup
                                        value={[field.value]}
                                        onValueChange={(val) => {
                                            if (val && val.length > 0) field.onChange(val[0] as TaskType);
                                        }}
                                        className="grid grid-cols-2 w-full"
                                    >
                                        <ToggleGroupItem value="one_time" className="text-xs h-8.5 font-medium">
                                            One-time Task
                                        </ToggleGroupItem>
                                        <ToggleGroupItem value="recurring" className="text-xs h-8.5 font-medium">
                                            Recurring Routine
                                        </ToggleGroupItem>
                                    </ToggleGroup>
                                )}
                            />
                        </Field>

                        {/* Title */}
                        <Controller
                            control={form.control}
                            name="title"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Task Title</FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        placeholder="e.g., Review weekly sprint goals"
                                        aria-invalid={fieldState.invalid}
                                        autoFocus
                                        className="h-9"
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        {/* Primary Schedule Section */}
                        {watchType === "one_time" ? (
                            <Controller
                                control={form.control}
                                name="deadline"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>Target Deadline</FieldLabel>
                                        <DateTimePicker
                                            id={field.name}
                                            value={field.value ?? ""}
                                            onChange={field.onChange}
                                            ariaInvalid={fieldState.invalid}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        ) : (
                            <div className="border border-border/80 rounded-xl p-3.5 bg-muted/20 flex flex-col gap-3.5">
                                <Field>
                                    <FieldLabel className="text-xs">Frequency</FieldLabel>
                                    <ToggleGroup
                                        value={[recurrencePreset]}
                                        onValueChange={(val) => {
                                            if (val && val.length > 0) {
                                                handleRecurrencePresetChange(
                                                    val[0] as "day" | "week" | "month" | "custom",
                                                );
                                            }
                                        }}
                                        className="grid grid-cols-4 w-full"
                                    >
                                        <ToggleGroupItem value="day" className="text-xs h-8">
                                            Daily
                                        </ToggleGroupItem>
                                        <ToggleGroupItem value="week" className="text-xs h-8">
                                            Weekly
                                        </ToggleGroupItem>
                                        <ToggleGroupItem value="month" className="text-xs h-8">
                                            Monthly
                                        </ToggleGroupItem>
                                        <ToggleGroupItem value="custom" className="text-xs h-8">
                                            Custom
                                        </ToggleGroupItem>
                                    </ToggleGroup>
                                </Field>

                                {recurrencePreset === "custom" && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <Controller
                                            control={form.control}
                                            name="recurrence_interval"
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel htmlFor={field.name} className="text-xs">
                                                        Repeat Every
                                                    </FieldLabel>
                                                    <NumberStepper
                                                        id={field.name}
                                                        value={field.value ?? ""}
                                                        onChange={field.onChange}
                                                        min={1}
                                                        placeholder="1"
                                                        ariaInvalid={fieldState.invalid}
                                                    />
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />

                                        <Field>
                                            <FieldLabel className="text-xs">Interval Unit</FieldLabel>
                                            <Controller
                                                control={form.control}
                                                name="recurrence_unit"
                                                render={({ field }) => (
                                                    <ToggleGroup
                                                        value={[field.value ?? "week"]}
                                                        onValueChange={(val) => {
                                                            if (val.length > 0)
                                                                field.onChange(val[0] as RecurrenceUnit);
                                                        }}
                                                        className="grid grid-cols-3 w-full"
                                                    >
                                                        <ToggleGroupItem value="day" className="text-xs h-8.5">
                                                            Day
                                                        </ToggleGroupItem>
                                                        <ToggleGroupItem value="week" className="text-xs h-8.5">
                                                            Wk
                                                        </ToggleGroupItem>
                                                        <ToggleGroupItem value="month" className="text-xs h-8.5">
                                                            Mo
                                                        </ToggleGroupItem>
                                                    </ToggleGroup>
                                                )}
                                            />
                                        </Field>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <Controller
                                        control={form.control}
                                        name="start_date"
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name} className="text-xs">
                                                    Starts On
                                                </FieldLabel>
                                                <DatePicker
                                                    id={field.name}
                                                    value={field.value ?? ""}
                                                    onChange={field.onChange}
                                                    ariaInvalid={fieldState.invalid}
                                                />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />

                                    <Field>
                                        <FieldLabel className="text-xs">Termination</FieldLabel>
                                        <Controller
                                            control={form.control}
                                            name="recurrence_end_type"
                                            render={({ field }) => (
                                                <ToggleGroup
                                                    value={[field.value ?? "never"]}
                                                    onValueChange={(val) => {
                                                        if (val.length > 0) field.onChange(val[0] as RecurrenceEndType);
                                                    }}
                                                    className="grid grid-cols-3 w-full"
                                                >
                                                    <ToggleGroupItem value="never" className="text-xs h-8.5">
                                                        Never
                                                    </ToggleGroupItem>
                                                    <ToggleGroupItem value="after_n" className="text-xs h-8.5">
                                                        Count
                                                    </ToggleGroupItem>
                                                    <ToggleGroupItem value="on_date" className="text-xs h-8.5">
                                                        Date
                                                    </ToggleGroupItem>
                                                </ToggleGroup>
                                            )}
                                        />
                                    </Field>
                                </div>

                                {watchEndType === "after_n" && (
                                    <Controller
                                        control={form.control}
                                        name="recurrence_end_count"
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name} className="text-xs">
                                                    Total Occurrences
                                                </FieldLabel>
                                                <NumberStepper
                                                    id={field.name}
                                                    value={field.value ?? ""}
                                                    onChange={field.onChange}
                                                    min={1}
                                                    placeholder="10"
                                                    ariaInvalid={fieldState.invalid}
                                                />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />
                                )}

                                {watchEndType === "on_date" && (
                                    <Controller
                                        control={form.control}
                                        name="recurrence_end_date"
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name} className="text-xs">
                                                    End Date
                                                </FieldLabel>
                                                <DatePicker
                                                    id={field.name}
                                                    value={field.value ?? ""}
                                                    onChange={field.onChange}
                                                    ariaInvalid={fieldState.invalid}
                                                />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />
                                )}
                            </div>
                        )}

                        {/* Settings-Style Progressive Disclosure Section */}
                        <div className="flex flex-col gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() => setIsAdvancedOpen((prev) => !prev)}
                                className="flex items-center justify-between px-1 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none select-none"
                            >
                                <span className="flex items-center gap-1.5">
                                    <SlidersHorizontal className="size-3.5" />
                                    <span>Additional Details</span>
                                </span>
                                {isAdvancedOpen ? (
                                    <ChevronUp className="size-3.5" />
                                ) : (
                                    <ChevronDown className="size-3.5" />
                                )}
                            </button>

                            {isAdvancedOpen && (
                                <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
                                    <CardContent className="p-0 flex flex-col gap-0">
                                        {/* Row 1: Category */}
                                        <div className="flex items-center justify-between gap-4 p-3.5 px-4">
                                            <div className="flex items-center gap-2.5 min-w-0 shrink-0">
                                                <Tag className="size-4 text-muted-foreground shrink-0" />
                                                <span className="text-xs font-medium text-foreground">Category</span>
                                            </div>
                                            <div className="w-48 max-w-[60%]">
                                                <Controller
                                                    control={form.control}
                                                    name="category_id"
                                                    render={({ field }) => (
                                                        <CreatableCombobox
                                                            options={categories}
                                                            value={field.value ?? null}
                                                            onChange={field.onChange}
                                                            onCreateNew={(name) => createCategory.mutateAsync(name)}
                                                            placeholder="Select category..."
                                                        />
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <div className="h-px bg-border/50 mx-4" />

                                        {/* Row 2: Priority */}
                                        <div className="flex items-center justify-between gap-4 p-3.5 px-4">
                                            <div className="flex items-center gap-2.5 min-w-0 shrink-0">
                                                <Flag className="size-4 text-muted-foreground shrink-0" />
                                                <span className="text-xs font-medium text-foreground">Priority</span>
                                            </div>
                                            <Controller
                                                control={form.control}
                                                name="priority"
                                                render={({ field }) => (
                                                    <ToggleGroup
                                                        value={[field.value]}
                                                        onValueChange={(val) => {
                                                            if (val && val.length > 0)
                                                                field.onChange(val[0] as Priority);
                                                        }}
                                                        className="w-44 max-w-[55%] grid grid-cols-3"
                                                    >
                                                        <ToggleGroupItem value="low" className="text-xs h-7.5 px-1">
                                                            Low
                                                        </ToggleGroupItem>
                                                        <ToggleGroupItem value="medium" className="text-xs h-7.5 px-1">
                                                            Med
                                                        </ToggleGroupItem>
                                                        <ToggleGroupItem value="high" className="text-xs h-7.5 px-1">
                                                            High
                                                        </ToggleGroupItem>
                                                    </ToggleGroup>
                                                )}
                                            />
                                        </div>

                                        <div className="h-px bg-border/50 mx-4" />

                                        {/* Row 3: Duration Chips */}
                                        <div className="flex flex-col gap-2.5 p-3.5 px-4">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <Timer className="size-4 text-muted-foreground shrink-0" />
                                                <span className="text-xs font-medium text-foreground">
                                                    Estimated Duration
                                                </span>
                                            </div>
                                            <Controller
                                                control={form.control}
                                                name="estimated_minutes"
                                                render={({ field }) => (
                                                    <ToggleGroup
                                                        value={[field.value || "none"]}
                                                        onValueChange={(val) => {
                                                            if (val && val.length > 0) {
                                                                const chosen = val[0];
                                                                field.onChange(chosen === "none" ? "" : chosen);
                                                            }
                                                        }}
                                                        className="grid grid-cols-6 w-full"
                                                    >
                                                        {DURATION_CHIPS.map((chip) => (
                                                            <ToggleGroupItem
                                                                key={chip.value}
                                                                value={chip.value}
                                                                className="text-xs h-7.5 px-1"
                                                            >
                                                                {chip.label}
                                                            </ToggleGroupItem>
                                                        ))}
                                                    </ToggleGroup>
                                                )}
                                            />
                                        </div>

                                        <div className="h-px bg-border/50 mx-4" />

                                        {/* Row 4: Expandable Multiline Notes */}
                                        <div className="flex flex-col gap-2 p-3.5 px-4">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <FileText className="size-4 text-muted-foreground shrink-0" />
                                                <span className="text-xs font-medium text-foreground">
                                                    Notes & Context
                                                </span>
                                            </div>
                                            <Controller
                                                control={form.control}
                                                name="description"
                                                render={({ field, fieldState }) => (
                                                    <Textarea
                                                        {...field}
                                                        id={field.name}
                                                        placeholder="Add reference links, acceptance criteria, or details..."
                                                        rows={2}
                                                        aria-invalid={fieldState.invalid}
                                                        className="text-xs resize-y min-h-[58px] bg-background"
                                                    />
                                                )}
                                            />
                                        </div>

                                        <div className="h-px bg-border/50 mx-4" />

                                        {/* Row 5: Notification Switch & Sub-Row */}
                                        <div className="flex flex-col gap-2.5 p-3.5 px-4">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <Bell className="size-4 text-muted-foreground shrink-0" />
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-medium text-foreground">
                                                            Reminder Alert
                                                        </span>
                                                        <span className="text-[11px] text-muted-foreground font-normal">
                                                            {watchType === "one_time"
                                                                ? "Notify before deadline"
                                                                : "Notify on scheduled days"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Controller
                                                    control={form.control}
                                                    name="notify_enabled"
                                                    render={({ field }) => (
                                                        <Switch
                                                            id="notify-switch"
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    )}
                                                />
                                            </div>

                                            {watchNotifyEnabled && (
                                                <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/40">
                                                    <span className="text-xs text-muted-foreground font-normal">
                                                        Alert Timing
                                                    </span>
                                                    <Controller
                                                        control={form.control}
                                                        name="notify_lead_minutes"
                                                        render={({ field }) => (
                                                            <div className="w-36 max-w-[50%]">
                                                                <Select
                                                                    value={String(field.value)}
                                                                    onValueChange={(val) => {
                                                                        if (val !== null) field.onChange(val);
                                                                    }}
                                                                >
                                                                    <SelectTrigger className="h-7.5 text-xs">
                                                                        <SelectValue placeholder="Select lead" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectGroup>
                                                                            {NOTIFY_LEAD_OPTIONS.map((opt) => (
                                                                                <SelectItem
                                                                                    key={opt.value}
                                                                                    value={opt.value}
                                                                                >
                                                                                    {opt.label}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectGroup>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        )}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </FieldGroup>

                    {/* Standardized Koyoyomi Modal Footer */}
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
                                <span>{isEditing ? "Save Changes" : "Create Task"}</span>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
