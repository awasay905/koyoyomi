import * as React from "react";
import { Link } from "@tanstack/react-router";
import { useForm, Controller } from "react-hook-form";
import {
    ChevronLeft,
    CalendarClock,
    AlertCircle,
    BarChart2,
    Loader2,
    Pencil,
    MoreHorizontal,
    Bell,
    BellOff,
    Info,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useRemindersQuery, useUpdateReminder } from "./hooks";
import type { SystemReminder, ReminderType } from "./types";

type UpdateReminderPayload = Partial<Omit<SystemReminder, "id" | "user_id">>;

const REMINDER_METADATA: Record<
    ReminderType,
    { title: string; description: string; icon: React.ComponentType<{ className?: string }> }
> = {
    plan_next_day: {
        title: "Plan Tomorrow",
        description: "Evening nudge if tomorrow has no day template or pattern assigned.",
        icon: CalendarClock,
    },
    stale_backlog: {
        title: "Stale Backlog Nudge",
        description: "Alerts you when tasks remain untouched in your backlog for too long.",
        icon: AlertCircle,
    },
    weekly_summary: {
        title: "Weekly Review",
        description: "Sunday review prompt to inspect completed routine goals and plan ahead.",
        icon: BarChart2,
    },
};

const IDLE_DAYS_OPTIONS = [1, 2, 3, 5, 7];

function format12Hour(timeStr?: string): { time: string; period: string } {
    if (!timeStr) return { time: "--:--", period: "" };
    const parts = timeStr.split(":");
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1] || "00";
    if (isNaN(hours)) return { time: timeStr, period: "" };

    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const formattedHours = hours.toString().padStart(2, "0");

    return {
        time: `${formattedHours}:${minutes}`,
        period,
    };
}

function formatTimeInput(timeStr?: string): string {
    if (!timeStr) return "20:00";
    const parts = timeStr.split(":");
    const hours = (parts[0] || "00").padStart(2, "0");
    const minutes = (parts[1] || "00").padStart(2, "0");
    return `${hours}:${minutes}`;
}

export function RemindersSettings() {
    const { data: reminders = [], isLoading, isError } = useRemindersQuery();
    const updateReminder = useUpdateReminder();

    const [selectedReminder, setSelectedReminder] = React.useState<SystemReminder | null>(null);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    const handleOpenEdit = (reminder: SystemReminder) => {
        setSelectedReminder(reminder);
        setIsDialogOpen(true);
    };

    return (
        <div className="mx-auto flex max-w-lg flex-col gap-8 px-4 py-8 pb-28">
            {/* Page Header */}
            <header className="flex items-start min-w-0">
                <div className="flex items-start gap-2 min-w-0 w-full">
                    <Link
                        to="/settings"
                        className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0 -ml-2 -mt-1"
                        aria-label="Back to Settings"
                    >
                        <ChevronLeft />
                    </Link>

                    <div className="flex flex-col w-full min-w-0">
                        <h1 className="text-xl font-bold tracking-tight truncate leading-none">System Reminders</h1>
                        <p className="text-sm text-muted-foreground truncate mt-1.5">
                            Configure daily nudges for planning, backlog health, and weekly reviews.
                        </p>
                    </div>
                </div>
            </header>

            {isError && (
                <Alert variant="destructive">
                    <Info data-icon="inline-start" />
                    <AlertDescription>Failed to fetch reminders. Please try again.</AlertDescription>
                </Alert>
            )}

            {/* Reminders List Section */}
            <section className="flex flex-col gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                    Automated Nudges
                </h2>

                {isLoading ? (
                    <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
                        <CardContent className="p-0 flex flex-col gap-0">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex flex-col">
                                    <div className="flex items-center justify-between p-3.5 px-4 h-15">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="size-8.5 rounded-lg" />
                                            <div className="flex flex-col gap-1.5">
                                                <Skeleton className="h-4 w-28 rounded-md" />
                                                <Skeleton className="h-3 w-40 rounded-md" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-4 w-16 rounded-md" />
                                    </div>
                                    {i < 2 && <div className="h-px bg-border/50 mx-4" />}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
                        <CardContent className="p-0 flex flex-col gap-0">
                            {reminders.map((reminder, index) => (
                                <ReminderRowItem
                                    key={reminder.id}
                                    reminder={reminder}
                                    onEdit={() => handleOpenEdit(reminder)}
                                    showDivider={index < reminders.length - 1}
                                />
                            ))}
                        </CardContent>
                    </Card>
                )}
            </section>

            {/* Edit Reminder Dialog */}
            <ReminderDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                reminder={selectedReminder}
                onSave={(payload) => {
                    if (selectedReminder) {
                        updateReminder.mutate(
                            { id: selectedReminder.id, ...payload },
                            { onSuccess: () => setIsDialogOpen(false) },
                        );
                    }
                }}
                isPending={updateReminder.isPending}
            />
        </div>
    );
}

interface ReminderRowItemProps {
    reminder: SystemReminder;
    onEdit: () => void;
    showDivider: boolean;
}

function ReminderRowItem({ reminder, onEdit, showDivider }: ReminderRowItemProps) {
    const meta = REMINDER_METADATA[reminder.reminder_type] ?? {
        title: reminder.reminder_type,
        description: "",
        icon: CalendarClock,
    };
    const Icon = meta.icon;
    const { time, period } = format12Hour(reminder.fire_time);
    const idleThreshold = (reminder.config as { idle_days_threshold?: number } | null)?.idle_days_threshold ?? 3;

    return (
        <div className="flex flex-col">
            <div className="group flex items-center justify-between p-3 px-4 hover:bg-accent/40 transition-colors">
                {/* Left: Icon + Label + Subtitle */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="size-8.5 rounded-lg flex items-center justify-center shrink-0 border border-border/60 bg-muted/40 text-foreground">
                        <Icon className="size-4 text-muted-foreground" />
                    </div>

                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-foreground truncate leading-tight">{meta.title}</span>
                        <div className="flex items-center gap-1 mt-0.5">
                            {reminder.is_enabled ? (
                                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-normal">
                                    <Bell className="size-3 text-muted-foreground/70" />
                                    <span>
                                        {reminder.reminder_type === "stale_backlog"
                                            ? `After ${idleThreshold}d inactive`
                                            : "Scheduled"}
                                    </span>
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/50 font-normal">
                                    <BellOff className="size-3" />
                                    <span>Disabled</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Tabular Time & Action Menu */}
                <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-baseline font-mono text-sm font-medium tabular-nums text-foreground">
                        <span>{time}</span>
                        <span className="text-[11px] font-normal uppercase text-muted-foreground ml-1">{period}</span>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-muted-foreground hover:text-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                    aria-label={`Options for ${meta.title}`}
                                />
                            }
                        >
                            <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuGroup>
                                <DropdownMenuItem onClick={onEdit}>
                                    <Pencil data-icon="inline-start" />
                                    <span>Edit</span>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {showDivider && <div className="h-px bg-border/50 mx-4" />}
        </div>
    );
}

interface ReminderFormValues {
    is_enabled: boolean;
    fire_time: string;
    idle_days_threshold?: number;
}

interface ReminderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reminder: SystemReminder | null;
    onSave: (payload: UpdateReminderPayload) => void;
    isPending: boolean;
}

function ReminderDialog({ open, onOpenChange, reminder, onSave, isPending }: ReminderDialogProps) {
    const meta = reminder ? REMINDER_METADATA[reminder.reminder_type] : null;
    const isStaleBacklog = reminder?.reminder_type === "stale_backlog";

    const form = useForm<ReminderFormValues>({
        defaultValues: {
            is_enabled: false,
            fire_time: "20:00",
            idle_days_threshold: 3,
        },
    });

    React.useEffect(() => {
        if (!open || !reminder) return;
        const config = reminder.config as { idle_days_threshold?: number } | null | undefined;
        form.reset({
            is_enabled: reminder.is_enabled,
            fire_time: formatTimeInput(reminder.fire_time),
            idle_days_threshold: config?.idle_days_threshold ?? 3,
        });
    }, [open, reminder, form]);

    const onSubmit = (values: ReminderFormValues) => {
        if (!reminder) return;

        const payload: UpdateReminderPayload = {
            is_enabled: values.is_enabled,
            fire_time: `${values.fire_time}:00`,
        };

        if (isStaleBacklog) {
            const currentConfig = (
                reminder.config && typeof reminder.config === "object" ? reminder.config : {}
            ) as Record<string, unknown>;
            payload.config = {
                ...currentConfig,
                idle_days_threshold: values.idle_days_threshold,
            } as SystemReminder["config"];
        }

        onSave(payload);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>{meta?.title ?? "Configure Reminder"}</DialogTitle>
                    <DialogDescription>
                        {meta?.description ?? "Adjust schedule timing and alert preferences."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 pt-2">
                    <FieldGroup className="gap-4">
                        <Controller
                            control={form.control}
                            name="is_enabled"
                            render={({ field }) => (
                                <Field orientation="horizontal" className="justify-between items-center">
                                    <div className="flex flex-col">
                                        <FieldLabel htmlFor="reminder-enabled-switch" className="cursor-pointer">
                                            Enable Nudge
                                        </FieldLabel>
                                        <span className="text-xs text-muted-foreground font-normal">
                                            Receive automated reminder prompts
                                        </span>
                                    </div>
                                    <Switch
                                        id="reminder-enabled-switch"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </Field>
                            )}
                        />

                        <Controller
                            control={form.control}
                            name="fire_time"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Trigger Time</FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        type="time"
                                        step={300}
                                        className="font-mono"
                                        aria-invalid={fieldState.invalid}
                                    />
                                </Field>
                            )}
                        />

                        {isStaleBacklog && (
                            <Controller
                                control={form.control}
                                name="idle_days_threshold"
                                render={({ field }) => (
                                    <Field>
                                        <FieldLabel>Inactivity Threshold</FieldLabel>
                                        <Select
                                            value={String(field.value ?? 3)}
                                            onValueChange={(val) => {
                                                if (val !== null) {
                                                    field.onChange(parseInt(val, 10));
                                                }
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select idle days" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {IDLE_DAYS_OPTIONS.map((days) => (
                                                        <SelectItem key={days} value={String(days)}>
                                                            {days}{" "}
                                                            {days === 1
                                                                ? "day without activity"
                                                                : "days without activity"}
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
                                <span>Save Changes</span>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
