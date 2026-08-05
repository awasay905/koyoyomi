import * as React from "react";
import {
    Clock,
    Plus,
    Minus,
    Trash2,
    Info,
    Sunrise,
    Sun,
    Sunset,
    Moon,
    CloudSun,
    Dumbbell,
    Coffee,
    Briefcase,
    Activity,
    Pencil,
    Check,
    X,
    Bell,
    Loader2,
} from "lucide-react";

import { usePrayerTimes } from "./hooks";
import { createCustomPrayerSchema } from "./schemas";
import { type PrayerTime } from "./types";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Format 24h string ("05:15" or "17:30:00") into 12h display with AM/PM
function format12HourTime(timeStr: string): { time: string; period: string } {
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

// Format raw "HH:MM:SS" or "H:M" into clean "HH:MM" for time inputs
function formatTimeInput(timeStr: string): string {
    if (!timeStr) return "07:00";
    const parts = timeStr.split(":");
    const hours = (parts[0] || "00").padStart(2, "0");
    const minutes = (parts[1] || "00").padStart(2, "0");
    return `${hours}:${minutes}`;
}

// Contextual icon selector
function getPrayerIcon(name: string, isSystem: boolean) {
    const cleanName = name.toLowerCase().trim();

    if (isSystem) {
        if (cleanName.includes("fajr") || cleanName.includes("sunrise") || cleanName.includes("shuruq")) return Sunrise;
        if (cleanName.includes("dhuhr")) return Sun;
        if (cleanName.includes("asr")) return CloudSun;
        if (cleanName.includes("maghrib")) return Sunset;
        if (cleanName.includes("isha")) return Moon;
        return Clock;
    }

    if (cleanName.includes("gym") || cleanName.includes("workout") || cleanName.includes("fit")) return Dumbbell;
    if (cleanName.includes("work") || cleanName.includes("office") || cleanName.includes("job")) return Briefcase;
    if (cleanName.includes("coffee") || cleanName.includes("tea") || cleanName.includes("lunch")) return Coffee;
    if (cleanName.includes("sleep") || cleanName.includes("bed")) return Moon;
    if (cleanName.includes("med") || cleanName.includes("pill") || cleanName.includes("health")) return Activity;

    return Clock;
}

// Top-level icon renderer component to prevent dynamic component creation during render
function PrayerIcon({
    name,
    isSystem,
    className,
    strokeWidth = 1.75,
}: {
    name: string;
    isSystem: boolean;
    className?: string;
    strokeWidth?: number;
}) {
    // 1. Rename 'Icon' to lowercase 'icon'
    const icon = getPrayerIcon(name, isSystem);

    // 2. Use lowercase 'icon' in JSX
    return React.createElement(icon, { strokeWidth, className });
}
export function PrayerTimesSettings() {
    const {
        data: prayerTimes,
        isLoading,
        isError,
        updatePrayer,
        addCustomPrayer,
        deleteCustomPrayer,
    } = usePrayerTimes();

    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [customName, setCustomName] = React.useState("");
    const [customTime, setCustomTime] = React.useState("07:00");
    const [customNotify, setCustomNotify] = React.useState(false);
    const [customLead, setCustomLead] = React.useState(5);
    const [formError, setFormError] = React.useState<string | null>(null);

    const handleUpdate = (prayer: PrayerTime, updates: Partial<Omit<PrayerTime, "id">>) => {
        updatePrayer.mutate({ id: prayer.id, ...updates });
    };

    const handleAddCustom = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        const trimmedName = customName.trim();
        const validation = createCustomPrayerSchema.safeParse({
            name: trimmedName,
            time: customTime,
            notify_enabled: customNotify,
            notify_lead_minutes: customLead,
        });

        if (!validation.success) {
            setFormError(validation.error.issues[0]?.message || "Invalid input");
            return;
        }

        addCustomPrayer.mutate(
            {
                name: trimmedName,
                time: `${customTime}:00`,
                notify_enabled: customNotify,
                notify_lead_minutes: customLead,
            },
            {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    setCustomName("");
                    setCustomTime("07:00");
                    setCustomNotify(false);
                    setCustomLead(5);
                },
            },
        );
    };

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <div className="flex flex-col gap-2 mt-2">
                    <Skeleton className="h-4 w-20" />
                    <div className="border border-border rounded-xl divide-y divide-border overflow-hidden">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="p-3.5 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="size-10 rounded-xl" />
                                    <div className="flex flex-col gap-1.5">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-5 w-16" />
                                    </div>
                                </div>
                                <Skeleton className="size-7 rounded-md" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <Alert variant="destructive" className="max-w-2xl mx-auto my-6">
                <Info data-icon="inline-start" />
                <AlertDescription>Failed to fetch prayer settings. Please try again.</AlertDescription>
            </Alert>
        );
    }

    const systemPrayers = prayerTimes?.filter((p) => p.is_system) ?? [];
    const customPrayers = prayerTimes?.filter((p) => !p.is_system) ?? [];

    return (
        <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6 pb-28">
            {/* Header Section */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-semibold tracking-tight text-foreground">
                            Prayer & Reference Times
                        </h1>
                        {prayerTimes && (
                            <Badge
                                variant="secondary"
                                className="rounded-full px-2 text-[11px] font-medium text-muted-foreground bg-muted"
                            >
                                {prayerTimes.length}
                            </Badge>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Configure prayer times for adhan notifications and custom alerts.
                    </p>
                </div>

                {/* Add Custom Time Modal Trigger */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <form onSubmit={handleAddCustom}>
                            <DialogHeader>
                                <DialogTitle>Add Custom Reference Time</DialogTitle>
                                <DialogDescription>
                                    Add custom reference points like gym opening or office hours to display alongside
                                    your day templates.
                                </DialogDescription>
                            </DialogHeader>

                            <FieldGroup className="py-4 flex flex-col gap-4">
                                {formError && (
                                    <Alert variant="destructive" className="py-2 text-xs">
                                        <AlertDescription>{formError}</AlertDescription>
                                    </Alert>
                                )}

                                <Field>
                                    <FieldLabel htmlFor="custom-name">Name</FieldLabel>
                                    <Input
                                        id="custom-name"
                                        placeholder="e.g. Gym Open, Office Start"
                                        value={customName}
                                        onChange={(e) => setCustomName(e.target.value)}
                                        required
                                        maxLength={50}
                                        className="h-9 text-xs"
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="custom-time">Time</FieldLabel>
                                    <Input
                                        id="custom-time"
                                        type="time"
                                        step={300}
                                        value={customTime}
                                        onChange={(e) => setCustomTime(e.target.value)}
                                        required
                                        className="h-9 text-xs font-mono"
                                    />
                                </Field>

                                <Field orientation="horizontal" className="justify-between items-center">
                                    <FieldLabel htmlFor="custom-notify" className="cursor-pointer">
                                        Enable Notification
                                    </FieldLabel>
                                    <Switch
                                        id="custom-notify"
                                        checked={customNotify}
                                        onCheckedChange={setCustomNotify}
                                    />
                                </Field>

                                {customNotify && (
                                    <Field>
                                        <FieldLabel htmlFor="custom-lead">
                                            Notification Lead Time (minutes before)
                                        </FieldLabel>
                                        <Input
                                            id="custom-lead"
                                            type="number"
                                            min={0}
                                            max={120}
                                            step={5}
                                            value={customLead}
                                            onChange={(e) => setCustomLead(parseInt(e.target.value, 10) || 0)}
                                            className="h-9 text-xs font-mono"
                                        />
                                    </Field>
                                )}
                            </FieldGroup>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" size="sm" disabled={addCustomPrayer.isPending}>
                                    {addCustomPrayer.isPending ? (
                                        <>
                                            <Loader2 data-icon="inline-start" className="animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Time"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Fixed System Prayers Group */}
            <div className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 px-1">
                    Prayers
                </span>

                <div className="border border-border rounded-xl bg-card overflow-hidden divide-y divide-border/60 shadow-2xs">
                    {systemPrayers.map((prayer) => (
                        <PrayerRow
                            key={prayer.id}
                            prayer={prayer}
                            onUpdate={handleUpdate}
                            isUpdating={updatePrayer.isPending && updatePrayer.variables?.id === prayer.id}
                        />
                    ))}
                </div>
            </div>

            {/* Custom Reference Times Group */}
            <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                        Custom Alerts
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsDialogOpen(true)}
                        className="h-6 px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground -mr-1"
                    >
                        <Plus data-icon="inline-start" className="text-primary" />
                        <span>Add Alert</span>
                    </Button>
                </div>

                {customPrayers.length > 0 ? (
                    <div className="border border-border rounded-xl bg-card overflow-hidden divide-y divide-border/60 shadow-2xs">
                        {customPrayers.map((prayer) => (
                            <PrayerRow
                                key={prayer.id}
                                prayer={prayer}
                                onUpdate={handleUpdate}
                                onDelete={() => deleteCustomPrayer.mutate(prayer.id)}
                                isUpdating={updatePrayer.isPending && updatePrayer.variables?.id === prayer.id}
                                isDeleting={deleteCustomPrayer.isPending && deleteCustomPrayer.variables === prayer.id}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="border border-dashed border-border/80 rounded-xl p-6 text-center bg-card/40 flex flex-col items-center gap-2">
                        <p className="text-xs text-muted-foreground">No custom alerts configured yet.</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsDialogOpen(true)}
                            className="h-7 text-xs font-medium mt-1"
                        >
                            <Plus data-icon="inline-start" />
                            <span>Create First Custom Alert</span>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

interface PrayerRowProps {
    prayer: PrayerTime;
    onUpdate: (p: PrayerTime, updates: Partial<Omit<PrayerTime, "id">>) => void;
    onDelete?: () => void;
    isUpdating?: boolean;
    isDeleting?: boolean;
}

function PrayerRow({ prayer, onUpdate, onDelete, isUpdating = false, isDeleting = false }: PrayerRowProps) {
    const [isEditing, setIsEditing] = React.useState(false);

    // Editing State (only used while isEditing === true)
    const [name, setName] = React.useState(prayer.name);
    const [time, setTime] = React.useState(() => formatTimeInput(prayer.time));
    const [notifyEnabled, setNotifyEnabled] = React.useState(prayer.notify_enabled);
    const [lead, setLead] = React.useState(prayer.notify_lead_minutes);

    const handleStartEdit = () => {
        setName(prayer.name);
        setTime(formatTimeInput(prayer.time));
        setNotifyEnabled(prayer.notify_enabled);
        setLead(prayer.notify_lead_minutes);
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    const handleSave = (e?: React.FormEvent) => {
        e?.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName) return;

        onUpdate(prayer, {
            name: prayer.is_system ? undefined : trimmedName,
            time: `${time}:00`,
            notify_enabled: notifyEnabled,
            notify_lead_minutes: lead,
        });
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") handleCancelEdit();
    };

    const handleIncrementLead = () => setLead((prev) => Math.min(prev + 5, 120));
    const handleDecrementLead = () => setLead((prev) => Math.max(prev - 5, 0));

    const formatted12h = format12HourTime(prayer.time);

    // Editable Mode View
    if (isEditing) {
        return (
            <form
                onSubmit={handleSave}
                className="grid grid-cols-[auto_1fr] items-center gap-3.5 px-4 py-3 bg-muted/40 transition-colors"
            >
                {/* Left Column: Icon Square */}
                <div
                    className={cn(
                        "size-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors",
                        notifyEnabled
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-muted text-muted-foreground border-border/50",
                    )}
                >
                    <PrayerIcon name={prayer.name} isSystem={prayer.is_system} strokeWidth={1.75} />
                </div>

                {/* Right Column: Editing Inputs */}
                <div className="flex flex-col gap-2 min-w-0 flex-1">
                    {/* Top Row: Title or Name Edit + Actions */}
                    <div className="flex items-center justify-between gap-2 min-w-0">
                        {!prayer.is_system ? (
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Alert name"
                                className="h-8 text-sm font-semibold flex-1 min-w-0"
                                autoFocus
                                maxLength={50}
                            />
                        ) : (
                            <span className="text-sm font-semibold text-foreground truncate">{prayer.name}</span>
                        )}

                        <div className="flex items-center gap-1 shrink-0">
                            <Button
                                type="submit"
                                variant="ghost"
                                size="icon"
                                className="size-7 text-primary hover:text-primary hover:bg-primary/10"
                                disabled={!name.trim() || isUpdating}
                                aria-label="Save changes"
                            >
                                {isUpdating ? <Loader2 className="animate-spin" /> : <Check />}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-7 text-muted-foreground hover:text-foreground"
                                onClick={handleCancelEdit}
                                disabled={isUpdating}
                                aria-label="Cancel editing"
                            >
                                <X />
                            </Button>
                        </div>
                    </div>

                    {/* Bottom Row: Controls Grid */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                        <Input
                            type="time"
                            step={300}
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="h-8 w-28 text-sm font-mono font-medium text-center shrink-0"
                        />

                        <div className="flex items-center gap-3">
                            {notifyEnabled && (
                                <div className="flex items-center h-8 rounded-md border border-input bg-card shrink-0 shadow-2xs">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-7 rounded-none text-muted-foreground hover:text-foreground"
                                        onClick={handleDecrementLead}
                                        aria-label="Decrease lead minutes"
                                    >
                                        <Minus />
                                    </Button>
                                    <span className="w-10 text-center text-xs font-mono select-none text-muted-foreground font-medium">
                                        {lead}m
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-7 rounded-none text-muted-foreground hover:text-foreground"
                                        onClick={handleIncrementLead}
                                        aria-label="Increase lead minutes"
                                    >
                                        <Plus />
                                    </Button>
                                </div>
                            )}

                            <div className="flex items-center gap-2 shrink-0">
                                <Switch
                                    id={`notify-toggle-${prayer.id}`}
                                    checked={notifyEnabled}
                                    onCheckedChange={setNotifyEnabled}
                                    aria-label={`Toggle notifications for ${prayer.name}`}
                                />
                                <span className="text-xs text-muted-foreground select-none font-medium">Notify</span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        );
    }

    // Read-Only Default Mode
    return (
        <div
            className={cn(
                "group grid grid-cols-[auto_1fr] items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-muted/30",
                (isUpdating || isDeleting) && "opacity-60 pointer-events-none",
            )}
        >
            {/* LEFT COLUMN: Clean Icon */}
            <div
                className={cn(
                    "size-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors",
                    prayer.notify_enabled
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-muted/60 text-muted-foreground border-border/40",
                )}
            >
                {isUpdating || isDeleting ? (
                    <Loader2 className="animate-spin text-muted-foreground" />
                ) : (
                    <PrayerIcon name={prayer.name} isSystem={prayer.is_system} strokeWidth={1.75} />
                )}
            </div>

            {/* RIGHT COLUMN: Tight Vertical Stack */}
            <div className="flex flex-col justify-center gap-0.5 min-w-0 flex-1">
                {/* TOP ROW: Name + Clean Badge + Hover Edit Controls */}
                <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-semibold text-foreground truncate">{prayer.name}</span>
                        {prayer.notify_enabled && (
                            <Badge
                                variant="secondary"
                                className="font-mono text-[11px] px-2 h-5 gap-1 shrink-0 rounded-md bg-primary/10 text-primary border-0 font-medium"
                            >
                                <Bell data-icon="inline-start" />
                                <span>{prayer.notify_lead_minutes}m</span>
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                            onClick={handleStartEdit}
                            aria-label={`Edit ${prayer.name}`}
                        >
                            <Pencil />
                        </Button>
                        {!prayer.is_system && onDelete && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={onDelete}
                                aria-label={`Delete ${prayer.name}`}
                            >
                                <Trash2 />
                            </Button>
                        )}
                    </div>
                </div>

                {/* BOTTOM ROW: Easily Readable Time Typography */}
                <div className="flex items-baseline gap-1.5 min-w-0">
                    <span className="font-mono text-lg font-bold tracking-tight text-foreground tabular-nums">
                        {formatted12h.time}
                    </span>
                    <span className="text-xs font-semibold font-sans uppercase text-muted-foreground/80 tracking-wider">
                        {formatted12h.period}
                    </span>
                </div>
            </div>
        </div>
    );
}
