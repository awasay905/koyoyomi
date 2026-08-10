import { useEffect, useState, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { LocalNotifications, type LocalNotificationSchema } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";
import { Bell, RefreshCw, Trash2, ChevronLeft, ShieldCheck, ShieldAlert, Clock, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { rescheduleAllLocalNotifications, clearAllLocalNotifications } from "@/lib/notifications";

export function ScheduledNotificationsPage() {
    const [pendingNotifications, setPendingNotifications] = useState<LocalNotificationSchema[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Reusable fetcher for manual refresh & clear actions
    const fetchPendingNotifications = useCallback(async () => {
        if (!Capacitor.isNativePlatform()) {
            setHasPermission(false);
            setIsLoading(false);
            return;
        }

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

    // Initial mount effect with cleanup to avoid setting state if unmounted
    useEffect(() => {
        let isMounted = true;

        async function init() {
            if (!Capacitor.isNativePlatform()) {
                if (isMounted) {
                    setHasPermission(false);
                    setIsLoading(false);
                }
                return;
            }

            try {
                const perm = await LocalNotifications.checkPermissions();
                const pending = await LocalNotifications.getPending();

                const sorted = (pending.notifications ?? []).sort((a, b) => {
                    const timeA = a.schedule?.at ? new Date(a.schedule.at).getTime() : 0;
                    const timeB = b.schedule?.at ? new Date(b.schedule.at).getTime() : 0;
                    return timeA - timeB;
                });

                if (isMounted) {
                    setHasPermission(perm.display === "granted");
                    setPendingNotifications(sorted);
                }
            } catch (error) {
                console.error("Failed to load pending notifications:", error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        init();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleManualReschedule = async () => {
        setIsRefreshing(true);
        await rescheduleAllLocalNotifications();
        await fetchPendingNotifications();
        setIsRefreshing(false);
    };

    const handleClearAll = async () => {
        await clearAllLocalNotifications();
        setPendingNotifications([]);
    };

    return (
        <div className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-5 pb-28">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                    <Link
                        to="/settings"
                        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0 -ml-1.5 mt-0.5"
                    >
                        <ChevronLeft data-icon="inline-start" />
                    </Link>

                    <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-semibold tracking-tight text-foreground">
                                Scheduled Notifications
                            </h1>
                            <Badge variant="secondary" className="rounded-full px-2 text-[11px] font-mono">
                                {pendingNotifications.length}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            View active OS alarms scheduled for the next 7 days.
                        </p>
                    </div>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManualReschedule}
                    disabled={isRefreshing}
                    className="h-8 px-2.5 text-xs font-medium gap-1.5 shrink-0"
                >
                    <RefreshCw className={isRefreshing ? "animate-spin size-3.5" : "size-3.5"} />
                    <span>Rebuild</span>
                </Button>
            </div>

            {/* Platform / Permission Status Banner */}
            {!Capacitor.isNativePlatform() ? (
                <div className="p-3.5 border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 rounded-xl text-xs flex items-center gap-2.5">
                    <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>
                        Native Capacitor notifications are inactive on desktop web. Test this feature on Android.
                    </span>
                </div>
            ) : hasPermission ? (
                <div className="p-3 border border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 rounded-xl text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="font-medium">Android Notification Permissions Granted</span>
                    </div>
                </div>
            ) : (
                <div className="p-3 border border-destructive/30 bg-destructive/10 text-destructive rounded-xl text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="size-4 shrink-0" />
                        <span className="font-medium">Notification Permission Disabled</span>
                    </div>
                </div>
            )}

            {/* Pending Alarms List */}
            {isLoading ? (
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                </div>
            ) : pendingNotifications.length === 0 ? (
                <Empty className="py-10 border border-dashed rounded-xl bg-card/40">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Bell />
                        </EmptyMedia>
                        <EmptyTitle className="text-xs">No pending notifications</EmptyTitle>
                        <EmptyDescription className="text-[11px] max-w-xs">
                            Assign tasks to time slots or enable prayer notifications to populate OS alarms.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <Card className="border-border/80 shadow-2xs overflow-hidden py-0">
                    <CardHeader className="py-2.5 px-3.5 border-b border-border/50 bg-card/50 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Clock className="size-3.5" />
                            <span>Pending OS Alarms ({pendingNotifications.length})</span>
                        </CardTitle>

                        <Button
                            variant="ghost"
                            size="xs"
                            onClick={handleClearAll}
                            className="h-6 text-[11px] text-destructive hover:bg-destructive/10 px-2 gap-1"
                        >
                            <Trash2 className="size-3" />
                            <span>Clear All</span>
                        </Button>
                    </CardHeader>

                    <CardContent className="p-0 divide-y divide-border/50">
                        {pendingNotifications.map((notification) => {
                            const fireDate = notification.schedule?.at ? new Date(notification.schedule.at) : null;

                            return (
                                <div
                                    key={notification.id}
                                    className="flex items-center justify-between gap-3 p-3 text-xs hover:bg-muted/30 transition-colors"
                                >
                                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="font-semibold text-foreground truncate">
                                                {notification.title}
                                            </span>
                                            {notification.channelId && (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-[9px] px-1.5 h-3.5 font-mono uppercase rounded-full shrink-0"
                                                >
                                                    {notification.channelId}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-muted-foreground truncate">
                                            {notification.body}
                                        </p>
                                    </div>

                                    {fireDate && (
                                        <div className="flex flex-col items-end shrink-0">
                                            <span className="font-mono text-xs font-semibold text-foreground">
                                                {fireDate.toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {fireDate.toLocaleDateString([], {
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
