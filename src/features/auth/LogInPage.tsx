import { Link } from "@tanstack/react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field";
import { signInSchema, type SignInValues } from "@/features/auth/schemas";
import { useSignIn } from "@/features/auth/hooks";
import { ThemeToggle } from "@/components/theme/FloatingThemeToggle";

import logoSvg from "@/assets/logo.svg";

export function LogInPage() {
    const { signIn, error, loading } = useSignIn();
    const form = useForm<SignInValues>({
        resolver: zodResolver(signInSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = (values: SignInValues) => signIn(values.email, values.password);

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-background p-4 sm:p-6">
            {/* Top Right Theme Toggle */}
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-xs flex flex-col gap-6">
                {/* Brand Header */}
                <div className="flex items-center justify-center gap-3.5 select-none">
                    <img
                        src={logoSvg}
                        alt="Koyoyomi Logo"
                        className="size-13 object-contain dark:invert transition-all"
                    />

                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold tracking-tight leading-none uppercase">Koyoyomi</h1>
                        <p className="text-sm text-muted-foreground font-medium mt-1">Your life, scheduled.</p>
                    </div>
                </div>

                {/* Minimalist Login Card */}
                <Card className="shadow-2xs border-border/80">
                    <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                            <FieldGroup className="gap-3.5">
                                <Controller
                                    control={form.control}
                                    name="email"
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                                            <Input
                                                {...field}
                                                id={field.name}
                                                type="email"
                                                placeholder="name@example.com"
                                                autoComplete="email"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />

                                <Controller
                                    control={form.control}
                                    name="password"
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                                            <Input
                                                {...field}
                                                id={field.name}
                                                type="password"
                                                placeholder="••••••••"
                                                autoComplete="current-password"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />
                            </FieldGroup>

                            {error && <p className="text-xs font-medium text-destructive px-0.5">{error}</p>}

                            <Button type="submit" className="w-full mt-1" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 data-icon="inline-start" className="animate-spin" />
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    "Sign in"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Registration Link Outside Card */}
                <p className="text-center text-xs text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link
                        to="/auth/register"
                        className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
                    >
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}
