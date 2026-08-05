import { createLink } from "@tanstack/react-router";
import { ClockIcon, SunIcon, MoonIcon, LogOutIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { useTheme } from "@/hooks/useTheme";
import { useSignOut } from "../auth/hooks";

// Create a TanStack Router-enabled Button component
const RouterButton = createLink(Button);

export function SettingsPage() {
    const { theme, toggleTheme, isLoaded } = useTheme();
    const signOut = useSignOut();

    return (
        <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-6 pb-28">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-sm text-muted-foreground">
                    Manage your schedule preferences, notification rules, and app settings.
                </p>
            </div>

            {/* Timetable & Schedule Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Timetable & Schedule</CardTitle>
                    <CardDescription>Configure prayer times, day templates, and weekly defaults.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 p-3 pt-0">
                    {/* Prayer Times Navigation */}
                    <RouterButton
                        to="/settings/prayer_times"
                        variant="ghost"
                        className="w-full justify-between h-auto py-3 px-3 rounded-lg text-foreground hover:bg-accent"
                    >
                        <div className="flex items-center gap-3">
                            <ClockIcon data-icon="inline-start" className="text-muted-foreground" />
                            <div className="flex flex-col text-left gap-0.5">
                                <span className="font-medium text-sm">Prayer Times & Reference</span>
                                <span className="text-xs text-muted-foreground font-normal">
                                    Configure 5 prayers & custom reference times
                                </span>
                            </div>
                        </div>
                        <ChevronRightIcon data-icon="inline-end" className="text-muted-foreground" />
                    </RouterButton>

                    {/* Day-Type Templates Navigation
                    <RouterButton
                        // to="/settings/day_types"
                        variant="ghost"
                        className="w-full justify-between h-auto py-3 px-3 rounded-lg text-foreground hover:bg-accent"
                    >
                        <div className="flex items-center gap-3">
                            <CalendarDaysIcon data-icon="inline-start" className="text-muted-foreground" />
                            <div className="flex flex-col text-left gap-0.5">
                                <span className="font-medium text-sm">Day-Type Templates</span>
                                <span className="text-xs text-muted-foreground font-normal">
                                    Edit work, WFH, weekend & custom block schedules
                                </span>
                            </div>
                        </div>
                        <ChevronRightIcon data-icon="inline-end" className="text-muted-foreground" />
                    </RouterButton>

                    {/* Weekly Pattern Navigation 
                    <RouterButton
                        // to="/settings/weekly_pattern"
                        variant="ghost"
                        className="w-full justify-between h-auto py-3 px-3 rounded-lg text-foreground hover:bg-accent"
                    >
                        <div className="flex items-center gap-3">
                            <CalendarRangeIcon data-icon="inline-start" className="text-muted-foreground" />
                            <div className="flex flex-col text-left gap-0.5">
                                <span className="font-medium text-sm">Weekly Pattern</span>
                                <span className="text-xs text-muted-foreground font-normal">
                                    Set default day-types for Mon–Sun
                                </span>
                            </div>
                        </div>
                        <ChevronRightIcon data-icon="inline-end" className="text-muted-foreground" />
                    </RouterButton> */}
                </CardContent>
            </Card>

            {/* Reminders & Notifications
            <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Manage non-task nudges and automated reminders.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 p-3 pt-0">
                    <RouterButton
                        // to="/settings/reminders"
                        variant="ghost"
                        className="w-full justify-between h-auto py-3 px-3 rounded-lg text-foreground hover:bg-accent"
                    >
                        <div className="flex items-center gap-3">
                            <BellIcon data-icon="inline-start" className="text-muted-foreground" />
                            <div className="flex flex-col text-left gap-0.5">
                                <span className="font-medium text-sm">System Reminders</span>
                                <span className="text-xs text-muted-foreground font-normal">
                                    Plan tomorrow, stale backlog & weekly summary nudges
                                </span>
                            </div>
                        </div>
                        <ChevronRightIcon data-icon="inline-end" className="text-muted-foreground" />
                    </RouterButton>
                </CardContent>
            </Card> */}

            {/* Appearance Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize how the application looks on your device.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Field orientation="horizontal" className="items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <FieldLabel htmlFor="theme-toggle" className="font-medium">
                                Theme Mode
                            </FieldLabel>
                            <FieldDescription className="capitalize">
                                {isLoaded ? `Currently using ${theme} mode` : "Loading theme..."}
                            </FieldDescription>
                        </div>

                        <Button
                            id="theme-toggle"
                            variant="outline"
                            size="sm"
                            onClick={toggleTheme}
                            disabled={!isLoaded}
                            className="shrink-0"
                        >
                            {theme === "dark" ? (
                                <>
                                    <SunIcon data-icon="inline-start" />
                                    <span>Light Mode</span>
                                </>
                            ) : (
                                <>
                                    <MoonIcon data-icon="inline-start" />
                                    <span>Dark Mode</span>
                                </>
                            )}
                        </Button>
                    </Field>
                </CardContent>
            </Card>

            {/* Account / Sign Out */}
            <Card>
                <CardHeader>
                    <CardTitle>Account</CardTitle>
                    <CardDescription>Manage your active session and account authorization.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Field orientation="horizontal" className="items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <FieldLabel className="font-medium">Sign Out</FieldLabel>
                            <FieldDescription>
                                You will be logged out of your account and returned to the login screen.
                            </FieldDescription>
                        </div>

                        <Button variant="destructive" size="sm" onClick={signOut} className="shrink-0">
                            <LogOutIcon data-icon="inline-start" />
                            <span>Sign Out</span>
                        </Button>
                    </Field>
                </CardContent>
            </Card>
        </div>
    );
}
