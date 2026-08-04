import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { ShoppingItem, CreateShoppingItemInput } from "./types";
import { useEffect } from "react";

export interface Category {
    id: string;
    name: string;
    color: string | null;
    scope: string;
    last_used: string | null;
}

export function useUpdateShoppingItem() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            name,
            quantity,
        }: {
            id: string;
            name: string;
            quantity: string | null;
        }) => {
            const { error } = await supabase
                .from("shopping_items")
                .update({ name, quantity })
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["shopping"] }),
    });
}


export function useShoppingCategoriesQuery() {
    return useQuery<Category[]>({
        queryKey: ["categories", "shopping"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("categories")
                .select("*")
                .eq("scope", "shopping")
                .order("last_used", { ascending: false, nullsFirst: false });
            if (error) throw error;
            return data ?? [];
        },
    });
}

export function useCreateShoppingCategory() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (name: string) => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) throw new Error("User not authenticated");

            const { data, error } = await supabase
                .from("categories")
                .insert({
                    name,
                    scope: "shopping",
                    user_id: user.id,
                    last_used: new Date().toISOString(),
                })
                .select()
                .single();

            if (error) throw error;
            return data.id;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["categories", "shopping"] });
        },
    });
}

// ── Items ─────────────────────────────────────────────────
export function useShoppingItemsQuery() {
    return useQuery<ShoppingItem[]>({
        queryKey: ["shopping"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("shopping_items")
                .select("*, category:categories(*)")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return (data ?? []) as unknown as ShoppingItem[];
        },
    });
}

export function useAddShoppingItem() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (input: CreateShoppingItemInput) => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) throw new Error("User not authenticated");

            const { data, error } = await supabase
                .from("shopping_items")
                .insert({ ...input, user_id: user.id })
                .select("*, category:categories(*)")
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["shopping"] }),
    });
}

export function useMarkItemBought() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, bought }: { id: string; bought: boolean }) => {
            const update = bought
                ? { status: "bought" as const, bought_at: new Date().toISOString() }
                : { status: "pending" as const, bought_at: null };
            const { error } = await supabase.from("shopping_items").update(update).eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["shopping"] }),
    });
}

export function useToggleFrequent() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, frequent }: { id: string; frequent: boolean }) => {
            const { error } = await supabase.from("shopping_items").update({ is_frequent: frequent }).eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["shopping"] }),
    });
}

export function useClearBought() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const { error } = await supabase.from("shopping_items").delete().eq("status", "bought");
            if (error) throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["shopping"] }),
    });
}

export function useDeleteShoppingItem() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("shopping_items").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["shopping"] }),
    });
}

export function useReAddFrequent() {
    const addItem = useAddShoppingItem();
    return (item: ShoppingItem) =>
        addItem.mutate({
            name: item.name,
            category_id: item.category_id,
            quantity: item.quantity ?? undefined,
        });
}

// ── Realtime sync (call once in ShoppingPage) ─────────────
export function useShoppingRealtime() {
    const qc = useQueryClient();

    useEffect(() => {
        // 1. Create channel and attach listener BEFORE subscribing
        const channel = supabase
            .channel("shopping-changes")
            .on("postgres_changes", { event: "*", schema: "public", table: "shopping_items" }, () => {
                qc.invalidateQueries({ queryKey: ["shopping"] });
            })
            .subscribe();

        // 2. Clean up subscription when the user leaves the page
        return () => {
            supabase.removeChannel(channel);
        };
    }, [qc]);
}
