import { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { LocalNotifications, type LocalNotificationSchema } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";
import { Bell, RefreshCw, Trash2, ChevronLeft, ShieldAlert, AlertCircle, MoreHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";
import { rescheduleAllLocalNotifications, clearAllLocalNotifications } from "@/lib/notifications";

interface NotificationGroup {
    key: string;
    title: string;
    items: LocalNotificationSchema[];
}

function formatGroupDate(date: Date): { key: string; title: string } {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

    if (isToday) return { key, title: "Today" };
    if (isTomorrow) return { key, title: "Tomorrow" };

    return {
        key,
        title: date.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
        }),
    };
}

export function ScheduledNotificationsPage() {
    const isNative = Capacitor.isNativePlatform();

    const [pendingNotifications, setPendingNotifications] = useState<LocalNotificationSchema[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(isNative);
    const [hasPermission, setHasPermission] = useState<boolean | null>(isNative ? null : false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isBannerDismissed, setIsBannerDismissed] = useState(false);

    const loadNotifications = useCallback(async () => {
        if (!Capacitor.isNativePlatform()) return;

        try {
            const perm = await LocalNotifications.checkPermissions();
            setHasPermission(perm.display === "granted");

            const pending = await LocalNotifications.getPending();
            const sorted = (pending.notifications ?? []).sort((a, b) => {
                const timeA = a.schedule?.at ? new Date(a.schedule.at).getTime() : 0;
                const timeB = b.schedule?.at ? new Date(b.schedule.at).getTime() : 0;
                return timeA - timeB;
            });

            setPendingNotifications(sorted);
        } catch (error) {
            console.error("Failed to load pending notifications:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        let ignore = false;

        async function init() {
            if (!Capacitor.isNativePlatform()) return;

            try {
                const perm = await LocalNotifications.checkPermissions();
                const pending = await LocalNotifications.getPending();

                if (!ignore) {
                    setHasPermission(perm.display === "granted");

                    const sorted = (pending.notifications ?? []).sort((a, b) => {
                        const timeA = a.schedule?.at ? new Date(a.schedule.at).getTime() : 0;
                        const timeB = b.schedule?.at ? new Date(b.schedule.at).getTime() : 0;
                        return timeA - timeB;
                    });

                    setPendingNotifications(sorted);
                }
            } catch (error) {
                console.error("Failed to load pending notifications:", error);
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        void init();

        return () => {
            ignore = true;
        };
    }, []);

    const handleManualReschedule = async () => {
        setIsRefreshing(true);
        try {
            await rescheduleAllLocalNotifications();
            await loadNotifications();
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleClearAll = async () => {
        await clearAllLocalNotifications();
        setPendingNotifications([]);
    };

    const handleCancelSingle = async (id: number) => {
        if (Capacitor.isNativePlatform()) {
            await LocalNotifications.cancel({ notifications: [{ id }] });
        }
        setPendingNotifications((prev) => prev.filter((item) => item.id !== id));
    };

    // Chronological date grouping
    const groupedNotifications = useMemo(() => {
        const groupsMap = new Map<string, NotificationGroup>();

        for (const notification of pendingNotifications) {
            const fireDate = notification.schedule?.at ? new Date(notification.schedule.at) : null;
            const { key, title } = fireDate ? formatGroupDate(fireDate) : { key: "undated", title: "Unscheduled" };

            if (!groupsMap.has(key)) {
                groupsMap.set(key, { key, title, items: [] });
            }
            groupsMap.get(key)!.items.push(notification);
        }

        return Array.from(groupsMap.values());
    }, [pendingNotifications]);

    return (
        <div className="mx-auto flex max-w-lg flex-col gap-8 px-4 py-8 pb-28">
            {/* Header */}
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
                        <div className="flex items-center justify-between gap-3 min-w-0 w-full">
                            <div className="flex items-center gap-2 min-w-0">
                                <h1 className="text-xl font-bold tracking-tight truncate leading-none">
                                    Scheduled Alarms
                                </h1>
                                <Badge variant="secondary" className="rounded-full px-2 text-[11px] font-mono h-5">
                                    {pendingNotifications.length}
                                </Badge>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleManualReschedule}
                                    disabled={isRefreshing}
                                    className="h-8 px-2.5 text-xs font-medium"
                                >
                                    <RefreshCw
                                        data-icon="inline-start"
                                        className={isRefreshing ? "animate-spin" : undefined}
                                    />
                                    <span>Rebuild</span>
                                </Button>
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground truncate mt-1.5">
                            Pending system notifications scheduled on this device.
                        </p>
                    </div>
                </div>
            </header>

            {/* Platform / Permission Status Banner */}
            {!isBannerDismissed && !isNative && (
                <Alert className="relative">
                    <AlertCircle data-icon="inline-start" />
                    <div className="pr-6">
                        <AlertTitle>Web Environment Active</AlertTitle>
                        <AlertDescription>
                            Capacitor native alarms run on physical Android devices. Web preview lists mock or synced
                            triggers.
                        </AlertDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsBannerDismissed(true)}
                        className="absolute top-2.5 right-2.5 size-6 text-muted-foreground hover:text-foreground"
                        aria-label="Dismiss alert"
                    >
                        <X />
                    </Button>
                </Alert>
            )}

            {!isBannerDismissed && isNative && hasPermission === false && (
                <Alert variant="destructive" className="relative">
                    <ShieldAlert data-icon="inline-start" />
                    <div className="pr-6">
                        <AlertTitle>Notification Permission Disabled</AlertTitle>
                        <AlertDescription>
                            Enable notification permissions in device settings to receive adhan and routine alarms.
                        </AlertDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsBannerDismissed(true)}
                        className="absolute top-2.5 right-2.5 size-6 text-destructive hover:bg-destructive/10"
                        aria-label="Dismiss alert"
                    >
                        <X />
                    </Button>
                </Alert>
            )}

            {/* Alarms Content Section */}
            <div className="flex flex-col gap-6">
                {isLoading ? (
                    <section className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-20 rounded-md ml-1" />
                        <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
                            <CardContent className="p-0 flex flex-col gap-0">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="flex flex-col">
                                        <div className="p-3.5 px-4 flex items-center justify-between">
                                            <div className="flex flex-col gap-1.5">
                                                <Skeleton className="h-4 w-32 rounded-md" />
                                                <Skeleton className="h-3 w-20 rounded-md" />
                                            </div>
                                            <Skeleton className="h-4 w-12 rounded-md" />
                                        </div>
                                        {i < 2 && <div className="h-px bg-border/50 mx-4" />}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </section>
                ) : pendingNotifications.length === 0 ? (
                    <Empty className="py-12 border border-dashed border-border/80 rounded-xl bg-card/40">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Bell />
                            </EmptyMedia>
                            <EmptyTitle>No pending alarms</EmptyTitle>
                            <EmptyDescription className="max-w-[260px]">
                                Alarms will populate when tasks are scheduled or prayer notifications are enabled.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleManualReschedule}
                                disabled={isRefreshing}
                            >
                                <RefreshCw
                                    data-icon="inline-start"
                                    className={isRefreshing ? "animate-spin" : undefined}
                                />
                                <span>Rebuild Schedule</span>
                            </Button>
                        </EmptyContent>
                    </Empty>
                ) : (
                    <>
                        {groupedNotifications.map((group) => (
                            <section key={group.key} className="flex flex-col gap-2">
                                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                                    {group.title}
                                </h2>

                                <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
                                    <CardContent className="p-0 flex flex-col gap-0">
                                        {group.items.map((notification, index) => {
                                            const fireDate = notification.schedule?.at
                                                ? new Date(notification.schedule.at)
                                                : null;

                                            return (
                                                <div key={notification.id} className="flex flex-col">
                                                    <div className="group flex items-center justify-between p-3 px-4 hover:bg-accent/40 transition-colors">
                                                        {/* Left: Title, Details & Channel */}
                                                        <div className="flex flex-col min-w-0 flex-1 pr-3">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <span className="font-medium text-sm text-foreground truncate leading-tight">
                                                                    {notification.title}
                                                                </span>
                                                                {notification.channelId && (
                                                                    <Badge
                                                                        variant="secondary"
                                                                        className="text-[10px] font-normal px-1.5 h-4.5 text-muted-foreground shrink-0 rounded-full"
                                                                    >
                                                                        {notification.channelId}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            {notification.body && (
                                                                <span className="text-xs text-muted-foreground font-normal truncate mt-0.5">
                                                                    {notification.body}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Right: Tabular Time & Action Menu */}
                                                        <div className="flex items-center gap-3 shrink-0">
                                                            {fireDate && (
                                                                <span className="font-mono text-sm font-medium tabular-nums text-foreground">
                                                                    {fireDate.toLocaleTimeString([], {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                    })}
                                                                </span>
                                                            )}

                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger
                                                                    render={
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="size-8 text-muted-foreground hover:text-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                                                            aria-label={`Options for ${notification.title}`}
                                                                        />
                                                                    }
                                                                >
                                                                    <MoreHorizontal />
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-40">
                                                                    <DropdownMenuGroup>
                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                handleCancelSingle(notification.id)
                                                                            }
                                                                            className="text-destructive focus:text-destructive"
                                                                        >
                                                                            <Trash2 data-icon="inline-start" />
                                                                            <span>Cancel Alarm</span>
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuGroup>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>

                                                    {index < group.items.length - 1 && (
                                                        <div className="h-px bg-border/50 mx-4" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </CardContent>
                                </Card>
                            </section>
                        ))}

                        {/* Bulk Action Footer */}
                        <div className="pt-2 flex justify-end">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClearAll}
                                className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                            >
                                <Trash2 data-icon="inline-start" />
                                <span>Clear All Alarms</span>
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
