"use client";

import { Sun, Moon, LogOut } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { useTheme } from "@/hooks/useTheme";
import { useSignOut } from "../auth/hooks";

export function SettingsPage() {
    const { theme, toggleTheme, isLoaded } = useTheme();
    const signOut = useSignOut();

    return (
        <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-6 pb-28">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-sm text-muted-foreground">Manage your app preferences and account settings.</p>
            </div>

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
                                    <Sun data-icon="inline-start" />
                                    <span>Light Mode</span>
                                </>
                            ) : (
                                <>
                                    <Moon data-icon="inline-start" />
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
                            <LogOut data-icon="inline-start" />
                            <span>Sign Out</span>
                        </Button>
                    </Field>
                </CardContent>
            </Card>
        </div>
    );
}
