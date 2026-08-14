import * as React from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, Plus, Clock, MoreHorizontal, Pencil, Trash2, Bell, BellOff, Info } from "lucide-react";

import { usePrayerTimes } from "./hooks";
import { type PrayerTime } from "./types";
import { PrayerTimeDialog } from "./PrayerTimeDialog";
import { PrayerIcon } from "./Icons";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";

function format12Hour(timeStr: string): { time: string; period: string } {
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

export function PrayerTimesSettings() {
    const {
        data: prayerTimes = [],
        isLoading,
        isError,
        updatePrayer,
        addCustomPrayer,
        deleteCustomPrayer,
    } = usePrayerTimes();

    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [selectedPrayer, setSelectedPrayer] = React.useState<PrayerTime | null>(null);

    const handleOpenCreate = () => {
        setSelectedPrayer(null);
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (prayer: PrayerTime) => {
        setSelectedPrayer(prayer);
        setIsDialogOpen(true);
    };

    const systemPrayers = prayerTimes.filter((p) => p.is_system);
    const customPrayers = prayerTimes.filter((p) => !p.is_system);

    return (
        <div className="mx-auto flex max-w-lg flex-col gap-8 px-4 py-8 pb-28">
            {/* Header with Back Navigation */}
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
                        <h1 className="text-xl font-bold tracking-tight truncate leading-none">
                            Prayer & Reference Times
                        </h1>
                        <p className="text-sm text-muted-foreground truncate mt-1.5">
                            Manage adhans and custom schedule markers.
                        </p>
                    </div>
                </div>
            </header>

            {isError && (
                <Alert variant="destructive">
                    <Info data-icon="inline-start" />
                    <AlertDescription>Failed to fetch reference times. Please try again.</AlertDescription>
                </Alert>
            )}

            {/* Section 1: System Prayers */}
            <section className="flex flex-col gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                    System Prayers
                </h2>

                {isLoading ? (
                    <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
                        <CardContent className="p-0 flex flex-col gap-0">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex flex-col">
                                    <div className="flex items-center justify-between p-3.5 px-4 h-15">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="size-8.5 rounded-lg" />
                                            <div className="flex flex-col gap-1.5">
                                                <Skeleton className="h-4 w-20 rounded-md" />
                                                <Skeleton className="h-3 w-14 rounded-md" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-4 w-16 rounded-md" />
                                    </div>
                                    {i < 4 && <div className="h-px bg-border/50 mx-4" />}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
                        <CardContent className="p-0 flex flex-col gap-0">
                            {systemPrayers.map((prayer, index) => (
                                <PrayerRowItem
                                    key={prayer.id}
                                    prayer={prayer}
                                    onEdit={() => handleOpenEdit(prayer)}
                                    showDivider={index < systemPrayers.length - 1}
                                />
                            ))}
                        </CardContent>
                    </Card>
                )}
            </section>

            {/* Section 2: Custom Alerts */}
            <section className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Custom Reference Times
                    </h2>
                    <Button size="sm" variant="ghost" onClick={handleOpenCreate} className="h-7 text-xs px-2 gap-1.5">
                        <Plus data-icon="inline-start" />
                        <span>New</span>
                    </Button>
                </div>

                {isLoading ? (
                    <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
                        <CardContent className="p-0 flex flex-col gap-0">
                            <div className="p-4">
                                <Skeleton className="h-12 w-full rounded-md" />
                            </div>
                        </CardContent>
                    </Card>
                ) : customPrayers.length === 0 ? (
                    <Empty className="py-10 border border-dashed border-border/80 rounded-xl bg-card/40">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Clock />
                            </EmptyMedia>
                            <EmptyTitle>No custom markers</EmptyTitle>
                            <EmptyDescription className="max-w-[260px]">
                                Add markers like gym sessions, office hours, or medication routines.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Button size="sm" variant="outline" onClick={handleOpenCreate}>
                                <Plus data-icon="inline-start" />
                                <span>Add Reference Time</span>
                            </Button>
                        </EmptyContent>
                    </Empty>
                ) : (
                    <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
                        <CardContent className="p-0 flex flex-col gap-0">
                            {customPrayers.map((prayer, index) => (
                                <PrayerRowItem
                                    key={prayer.id}
                                    prayer={prayer}
                                    onEdit={() => handleOpenEdit(prayer)}
                                    onDelete={() => deleteCustomPrayer.mutate(prayer.id)}
                                    showDivider={index < customPrayers.length - 1}
                                />
                            ))}
                        </CardContent>
                    </Card>
                )}
            </section>

            {/* Unified Dialog Modal */}
            <PrayerTimeDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                prayerToEdit={selectedPrayer}
                onSaveCustom={(payload) => addCustomPrayer.mutate(payload, { onSuccess: () => setIsDialogOpen(false) })}
                onUpdate={(id, payload) =>
                    updatePrayer.mutate({ id, ...payload }, { onSuccess: () => setIsDialogOpen(false) })
                }
                isPending={addCustomPrayer.isPending || updatePrayer.isPending}
            />
        </div>
    );
}

interface PrayerRowItemProps {
    prayer: PrayerTime;
    onEdit: () => void;
    onDelete?: () => void;
    showDivider?: boolean;
}

function PrayerRowItem({ prayer, onEdit, onDelete, showDivider }: PrayerRowItemProps) {
    const { time, period } = format12Hour(prayer.time);

    return (
        <div className="flex flex-col">
            <div className="group flex items-center justify-between p-3 px-4 hover:bg-accent/40 transition-colors">
                {/* Left: Icon + Label + Notification meta */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="size-8.5 rounded-lg flex items-center justify-center shrink-0 border border-border/60 bg-muted/40 text-foreground">
                        <PrayerIcon
                            name={prayer.name}
                            isSystem={prayer.is_system}
                            className="size-4 text-muted-foreground"
                        />
                    </div>

                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-foreground truncate leading-tight">
                            {prayer.name}
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                            {prayer.notify_enabled ? (
                                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-normal">
                                    <Bell className="size-3 text-muted-foreground/70" />
                                    <span>
                                        {prayer.notify_lead_minutes === 0
                                            ? "At exact time"
                                            : `${prayer.notify_lead_minutes}m before`}
                                    </span>
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/50 font-normal">
                                    <BellOff className="size-3" />
                                    <span>Muted</span>
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
                                    aria-label={`Options for ${prayer.name}`}
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
                                {!prayer.is_system && onDelete && (
                                    <DropdownMenuItem
                                        onClick={onDelete}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <Trash2 data-icon="inline-start" />
                                        <span>Delete</span>
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {showDivider && <div className="h-px bg-border/50 mx-4" />}
        </div>
    );
}
