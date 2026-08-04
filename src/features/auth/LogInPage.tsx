import { Link } from "@tanstack/react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { signInSchema, type SignInValues } from "@/features/auth/schemas";
import { useSignIn } from "@/features/auth/hooks";
import { ThemeToggle } from "@/components/theme/FloatingThemeToggle";

export function LogInPage() {
    const { signIn, error, loading } = useSignIn();
    const form = useForm<SignInValues>({
        resolver: zodResolver(signInSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = (values: SignInValues) => signIn(values.email, values.password);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-sm">
                <ThemeToggle />
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight"> Koyoyomi</h1>
                    <p className="text-muted-foreground mt-1">Your life, scheduled.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Sign in</CardTitle>
                        <CardDescription>Welcome back</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                            aria-invalid={fieldState.invalid}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            {error && <p className="text-sm text-destructive">{error}</p>}

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Signing in…" : "Sign in"}
                            </Button>
                        </form>

                        <p className="text-center text-sm text-muted-foreground mt-4">
                            No account?{" "}
                            <Link to="/auth/register" className="text-primary hover:underline">
                                Register
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
