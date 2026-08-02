import { useState, useEffect } from "react";
import type { AuthUser } from "./types";
import { supabase } from "@/lib/supabase";
import { useNavigate, useRouter } from "@tanstack/react-router";

export function useAuthUser() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                setUser({
                    id: user.id,
                    email: user.email || "",
                    name: user.user_metadata?.display_name || user.user_metadata?.name || "",
                });
            } else {
                setUser(null);
            }

            setLoading(false);
        };

        fetchUser();

        // 2. Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    name: session.user.user_metadata?.display_name || session.user.user_metadata?.name || "",
                });
            } else {
                setUser(null);
            }

            router.invalidate();
        });

        return () => subscription.unsubscribe();
    }, []);

    return { user, loading };
}

export function useSignIn() {
    const navigate = useNavigate();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const signIn = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) {
            setError(authError.message);
        } else {
            await router.invalidate();
            navigate({ to: "/today" });
        }
        setLoading(false);
    };

    return { signIn, error, loading };
}

export function useSignUp() {
    const navigate = useNavigate();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const signUp = async (email: string, password: string, name: string) => {
        setLoading(true);
        setError(null);
        const { error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: name,
                },
            },
        });
        if (authError) {
            setError(authError.message);
        } else {
            await router.invalidate();
            navigate({ to: "/today" });
        }
        setLoading(false);
    };

    return { signUp, error, loading };
}

export function useSignOut() {
    const navigate = useNavigate();
    const router = useRouter();

    return async () => {
        await supabase.auth.signOut();
        await router.invalidate();
        navigate({ to: "/auth/login" });
    };
}
