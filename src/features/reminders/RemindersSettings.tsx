import { Link } from "@tanstack/react-router";
import { ChevronLeft, CalendarClock, AlertCircle, BarChart2, Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useRemindersQuery, useUpdateReminder } from "./hooks";
import type { SystemReminder, ReminderType } from "./types";

const REMINDER_METADATA: Record<ReminderType, { title: string; description: string; icon: typeof CalendarClock }> = {
    plan_next_day: {
        title: "Plan Tomorrow",
        description: "Evening notification if tomorrow has no day-type override or pattern set.",
        icon: CalendarClock,
    },
    stale_backlog: {
        title: "Stale Backlog Nudge",
        description: "Alerts you if tasks have been sitting untouched in your backlog.",
        icon: AlertCircle,
    },
    weekly_summary: {
        title: "Weekly Summary Review",
        description: "Sunday evening reminder to review completed tasks and plan the week ahead.",
        icon: BarChart2,
    },
};

export function RemindersSettings() {
    const { data: reminders = [], isLoading } = useRemindersQuery();

    return (
        <div className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-6 pb-28">
            {/* Header */}
            <div className="flex items-start gap-2 min-w-0">
                <Link
                    to="/settings"
                    className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0 -ml-1.5 mt-0.5"
                    aria-label="Back to Settings"
                >
                    <ChevronLeft data-icon="inline-start" />
                </Link>

                <div className="flex flex-col gap-1 min-w-0">
                    <h1 className="text-lg font-semibold tracking-tight text-foreground">System Reminders</h1>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Configure daily nudges for planning, backlog health, and weekly reviews.
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col gap-3">
                    <Skeleton className="h-28 w-full rounded-xl" />
                    <Skeleton className="h-28 w-full rounded-xl" />
                    <Skeleton className="h-28 w-full rounded-xl" />
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {reminders.map((reminder) => (
                        <ReminderCard key={reminder.id} reminder={reminder} />
                    ))}
                </div>
            )}
        </div>
    );
}

function ReminderCard({ reminder }: { reminder: SystemReminder }) {
    const updateReminder = useUpdateReminder();
    const meta = REMINDER_METADATA[reminder.reminder_type] ?? {
        title: reminder.reminder_type,
        description: "",
        icon: CalendarClock,
    };
    const Icon = meta.icon;

    const fireTimeHHMM = reminder.fire_time.slice(0, 5);
    const idleThreshold = (reminder.config as { idle_days_threshold?: number })?.idle_days_threshold ?? 3;

    const handleToggle = (enabled: boolean) => {
        updateReminder.mutate({ id: reminder.id, is_enabled: enabled });
    };

    const handleTimeChange = (time: string) => {
        if (!time) return;
        updateReminder.mutate({ id: reminder.id, fire_time: `${time}:00` });
    };

    const handleThresholdChange = (delta: number) => {
        const next = Math.max(1, idleThreshold + delta);
        updateReminder.mutate({
            id: reminder.id,
            config: { ...reminder.config, idle_days_threshold: next },
        });
    };

    return (
        <Card className="shadow-2xs border-border/80 overflow-hidden py-0">
            <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                        <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                            <Icon className="size-4" />
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="font-semibold text-sm text-foreground">{meta.title}</span>
                            <span className="text-xs text-muted-foreground leading-normal">{meta.description}</span>
                        </div>
                    </div>

                    <Switch
                        checked={reminder.is_enabled}
                        onCheckedChange={handleToggle}
                        aria-label={`Toggle ${meta.title}`}
                    />
                </div>

                {reminder.is_enabled && (
                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/50 text-xs">
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground font-medium">Notification time:</span>
                            <Input
                                type="time"
                                step={300}
                                value={fireTimeHHMM}
                                onChange={(e) => handleTimeChange(e.target.value)}
                                className="h-7 w-24 text-xs font-mono font-medium text-center bg-background"
                            />
                        </div>

                        {reminder.reminder_type === "stale_backlog" && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-muted-foreground font-medium">Idle days:</span>
                                <div className="flex items-center h-7 rounded-md border border-input bg-background shrink-0 shadow-2xs">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-6 rounded-none text-muted-foreground hover:text-foreground"
                                        onClick={() => handleThresholdChange(-1)}
                                        disabled={idleThreshold <= 1}
                                    >
                                        <Minus className="size-3" />
                                    </Button>
                                    <span className="w-6 text-center text-xs font-mono select-none font-medium">
                                        {idleThreshold}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-6 rounded-none text-muted-foreground hover:text-foreground"
                                        onClick={() => handleThresholdChange(1)}
                                    >
                                        <Plus className="size-3" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
