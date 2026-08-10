import { createLink, useRouter } from "@tanstack/react-router";
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
import { useTheme } from "@/hooks/useTheme";
import { useSignOut } from "../auth/hooks";

// Create a TanStack Router-enabled Button component
const RouterButton = createLink(Button);

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
        <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8 pb-28">
            {/* Page Header with Back Navigation (-1) */}
            <div className="flex items-start gap-2 min-w-0">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBack}
                    className="size-8 text-muted-foreground hover:text-foreground hover:bg-accent shrink-0 mt-0.5 -ml-1.5"
                    aria-label="Go back"
                >
                    <ChevronLeftIcon data-icon="inline-start" />
                </Button>

                <div className="flex flex-col gap-1 min-w-0">
                    <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your schedule preferences, appearance, and account.
                    </p>
                </div>
            </div>
            {/* Timetable & Schedule Settings */}
            <div className="flex flex-col gap-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                    Schedule & Timetable
                </h2>
                <Card className="shadow-2xs border-border/80 overflow-hidden py-0">
                    <CardContent className="p-1">
                        <div className="flex flex-col">
                            {/* Prayer Times Navigation */}
                            <RouterButton
                                to="/settings/prayer_times"
                                variant="ghost"
                                className="w-full justify-between h-auto py-3 px-3.5 rounded-md hover:bg-accent/80 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <ClockIcon data-icon="inline-start" className="text-muted-foreground shrink-0" />
                                    <div className="flex flex-col text-left">
                                        <span className="font-medium text-sm leading-tight">Prayer Times</span>
                                        <span className="text-xs text-muted-foreground font-normal">
                                            Calculations & reference timings
                                        </span>
                                    </div>
                                </div>
                                <ChevronRightIcon data-icon="inline-end" className="text-muted-foreground shrink-0" />
                            </RouterButton>

                            <div className="h-px bg-border/50 mx-3" />

                            {/* Day Templates Navigation */}
                            <RouterButton
                                to="/settings/day_types"
                                variant="ghost"
                                className="w-full justify-between h-auto py-3 px-3.5 rounded-md hover:bg-accent/80 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <CalendarDaysIcon
                                        data-icon="inline-start"
                                        className="text-muted-foreground shrink-0"
                                    />
                                    <div className="flex flex-col text-left">
                                        <span className="font-medium text-sm leading-tight">Day Templates</span>
                                        <span className="text-xs text-muted-foreground font-normal">
                                            Routine blocks & schedule types
                                        </span>
                                    </div>
                                </div>
                                <ChevronRightIcon data-icon="inline-end" className="text-muted-foreground shrink-0" />
                            </RouterButton>

                            <div className="h-px bg-border/50 mx-3" />

                            {/* Weekly Pattern Navigation */}
                            <RouterButton
                                to="/settings/weekly_pattern"
                                variant="ghost"
                                className="w-full justify-between h-auto py-3 px-3.5 rounded-md hover:bg-accent/80 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <CalendarRangeIcon
                                        data-icon="inline-start"
                                        className="text-muted-foreground shrink-0"
                                    />
                                    <div className="flex flex-col text-left">
                                        <span className="font-medium text-sm leading-tight">Weekly Pattern</span>
                                        <span className="text-xs text-muted-foreground font-normal">
                                            Default Monday–Sunday routines
                                        </span>
                                    </div>
                                </div>
                                <ChevronRightIcon data-icon="inline-end" className="text-muted-foreground shrink-0" />
                            </RouterButton>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Appearance Settings */}
            <div className="flex flex-col gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                    Preferences
                </h2>
                <Card className="shadow-2xs border-border/80 py-0">
                    <CardContent className="p-3.5 flex items-center justify-between gap-4">
                        <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-sm">Theme</span>
                            <span className="text-xs text-muted-foreground capitalize">
                                {isLoaded ? `${theme} mode active` : "Loading theme..."}
                            </span>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleTheme}
                            disabled={!isLoaded}
                            className="shrink-0 h-9"
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
            </div>

            {/* Notifications Settings */}
            <div className="flex flex-col gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                    Notifications & Nudges
                </h2>
                <Card className="shadow-2xs border-border/80 py-0">
                    <CardContent className="p-1">
                        <div className="flex flex-col">
                            {/* System Reminders Navigation */}
                            <RouterButton
                                to="/settings/reminders"
                                variant="ghost"
                                className="w-full justify-between h-auto py-3 px-3.5 rounded-md hover:bg-accent/80 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <BellIcon className="text-muted-foreground shrink-0 size-4" />
                                    <div className="flex flex-col text-left">
                                        <span className="font-medium text-sm leading-tight">System Reminders</span>
                                        <span className="text-xs text-muted-foreground font-normal">
                                            Planning, backlog health & review nudges
                                        </span>
                                    </div>
                                </div>
                                <ChevronRightIcon className="text-muted-foreground shrink-0 size-4" />
                            </RouterButton>

                            <div className="h-px bg-border/50 mx-3" />

                            {/* Scheduled Notifications Navigation */}
                            <RouterButton
                                to="/settings/notifications"
                                variant="ghost"
                                className="w-full justify-between h-auto py-3 px-3.5 rounded-md hover:bg-accent/80 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <ClockIcon className="text-muted-foreground shrink-0 size-4" />
                                    <div className="flex flex-col text-left">
                                        <span className="font-medium text-sm leading-tight">Scheduled Alarms</span>
                                        <span className="text-xs text-muted-foreground font-normal">
                                            Inspect pending OS alarms & adhans
                                        </span>
                                    </div>
                                </div>
                                <ChevronRightIcon className="text-muted-foreground shrink-0 size-4" />
                            </RouterButton>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Account Settings */}
            <div className="flex flex-col gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Account</h2>
                <Card className="shadow-2xs border-border/80 py-0">
                    <CardContent className="p-3.5 flex items-center justify-between gap-4">
                        <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-sm">Session</span>
                            <span className="text-xs text-muted-foreground">Log out of your account</span>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={signOut}
                            className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 h-9"
                        >
                            <LogOutIcon data-icon="inline-start" />
                            <span>Sign Out</span>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
