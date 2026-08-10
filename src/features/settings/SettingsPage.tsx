import { Link, useRouter } from "@tanstack/react-router";
import {
    ClockIcon,
    SunIcon,
    MoonIcon,
    LogOutIcon,
    ChevronRightIcon,
    CalendarDaysIcon,
    CalendarRangeIcon,
    ChevronLeftIcon,
    BellIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/hooks/useTheme";
import { useSignOut } from "../auth/hooks";

export function SettingsPage() {
    const { theme, toggleTheme, isLoaded } = useTheme();
    const signOut = useSignOut();
    const router = useRouter();

    const handleBack = () => {
        if (window.history.length > 1) {
            router.history.back();
        } else {
            router.navigate({ to: "/" });
        }
    };

    return (
        <div className="mx-auto flex max-w-lg flex-col gap-8 px-4 py-8 pb-28">
            {/* Page Header */}
            <header className="flex items-start gap-2 min-w-0">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBack}
                    className="size-9 shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent -ml-2 -mt-1"
                    aria-label="Go back"
                >
                    <ChevronLeftIcon />
                </Button>

                <div className="flex flex-col min-w-0">
                    <h1 className="text-xl font-bold tracking-tight truncate leading-none">Settings</h1>
                    <p className="text-sm text-muted-foreground truncate mt-1.5">
                        Manage preferences, appearance, and account.
                    </p>
                </div>
            </header>

            {/* Timetable & Schedule Settings */}
            <section className="flex flex-col gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                    Schedule & Timetable
                </h2>
                <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
                    <CardContent className="p-0 flex flex-col gap-0">
                        <Link
                            to="/settings/prayer_times"
                            className="flex items-center justify-between gap-4 p-4 hover:bg-accent/80 transition-colors focus-visible:bg-accent/80 focus-visible:outline-none"
                        >
                            <ClockIcon className="text-muted-foreground shrink-0" />
                            <div className="flex flex-col flex-1 min-w-0 text-left">
                                <span className="font-medium text-sm leading-tight truncate">Prayer Times</span>
                                <span className="text-xs text-muted-foreground font-normal truncate mt-0.5">
                                    Calculations & reference timings
                                </span>
                            </div>
                            <ChevronRightIcon className="text-muted-foreground shrink-0" />
                        </Link>

                        <div className="h-px bg-border/50 mx-4" />

                        <Link
                            to="/settings/day_types"
                            className="flex items-center justify-between gap-4 p-4 hover:bg-accent/80 transition-colors focus-visible:bg-accent/80 focus-visible:outline-none"
                        >
                            <CalendarDaysIcon className="text-muted-foreground shrink-0" />
                            <div className="flex flex-col flex-1 min-w-0 text-left">
                                <span className="font-medium text-sm leading-tight truncate">Day Templates</span>
                                <span className="text-xs text-muted-foreground font-normal truncate mt-0.5">
                                    Routine blocks & schedule types
                                </span>
                            </div>
                            <ChevronRightIcon className="text-muted-foreground shrink-0" />
                        </Link>

                        <div className="h-px bg-border/50 mx-4" />

                        <Link
                            to="/settings/weekly_pattern"
                            className="flex items-center justify-between gap-4 p-4 hover:bg-accent/80 transition-colors focus-visible:bg-accent/80 focus-visible:outline-none"
                        >
                            <CalendarRangeIcon className="text-muted-foreground shrink-0" />
                            <div className="flex flex-col flex-1 min-w-0 text-left">
                                <span className="font-medium text-sm leading-tight truncate">Weekly Pattern</span>
                                <span className="text-xs text-muted-foreground font-normal truncate mt-0.5">
                                    Default Monday–Sunday routines
                                </span>
                            </div>
                            <ChevronRightIcon className="text-muted-foreground shrink-0" />
                        </Link>
                    </CardContent>
                </Card>
            </section>

            {/* Appearance Settings */}
            <section className="flex flex-col gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                    Preferences
                </h2>
                <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
                    <CardContent className="py-3.5 pl-4 pr-3 flex items-center justify-between gap-4">
                        <div className="flex flex-col flex-1 min-w-0 text-left">
                            <span className="font-medium text-sm leading-tight truncate">Theme</span>
                            {isLoaded ? (
                                <span className="text-xs text-muted-foreground capitalize font-normal truncate mt-0.5">
                                    {theme} mode active
                                </span>
                            ) : (
                                <Skeleton className="h-3.5 w-24 rounded-md mt-0.5" />
                            )}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleTheme}
                            disabled={!isLoaded}
                            className="shrink-0"
                        >
                            {theme === "dark" ? (
                                <>
                                    <SunIcon data-icon="inline-start" />
                                    <span>Light</span>
                                </>
                            ) : (
                                <>
                                    <MoonIcon data-icon="inline-start" />
                                    <span>Dark</span>
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </section>

            {/* Notifications Settings */}
            <section className="flex flex-col gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                    Notifications & Nudges
                </h2>
                <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
                    <CardContent className="p-0 flex flex-col gap-0">
                        <Link
                            to="/settings/reminders"
                            className="flex items-center justify-between gap-4 p-4 hover:bg-accent/80 transition-colors focus-visible:bg-accent/80 focus-visible:outline-none"
                        >
                            <BellIcon className="text-muted-foreground shrink-0" />
                            <div className="flex flex-col flex-1 min-w-0 text-left">
                                <span className="font-medium text-sm leading-tight truncate">System Reminders</span>
                                <span className="text-xs text-muted-foreground font-normal truncate mt-0.5">
                                    Planning, backlog health & review nudges
                                </span>
                            </div>
                            <ChevronRightIcon className="text-muted-foreground shrink-0" />
                        </Link>

                        <div className="h-px bg-border/50 mx-4" />

                        <Link
                            to="/settings/notifications"
                            className="flex items-center justify-between gap-4 p-4 hover:bg-accent/80 transition-colors focus-visible:bg-accent/80 focus-visible:outline-none"
                        >
                            <ClockIcon className="text-muted-foreground shrink-0" />
                            <div className="flex flex-col flex-1 min-w-0 text-left">
                                <span className="font-medium text-sm leading-tight truncate">Scheduled Alarms</span>
                                <span className="text-xs text-muted-foreground font-normal truncate mt-0.5">
                                    Inspect pending OS alarms & adhans
                                </span>
                            </div>
                            <ChevronRightIcon className="text-muted-foreground shrink-0" />
                        </Link>
                    </CardContent>
                </Card>
            </section>

            {/* Account Settings */}
            <section className="flex flex-col gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Account</h2>
                <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
                    <CardContent className="py-3.5 pl-4 pr-3 flex items-center justify-between gap-4">
                        <div className="flex flex-col flex-1 min-w-0 text-left">
                            <span className="font-medium text-sm leading-tight truncate">Session</span>
                            <span className="text-xs text-muted-foreground font-normal truncate mt-0.5">
                                Log out of your account
                            </span>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={signOut}
                            className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                        >
                            <LogOutIcon data-icon="inline-start" />
                            <span>Sign Out</span>
                        </Button>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
