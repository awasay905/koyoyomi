import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { type SystemReminder, DEFAULT_REMINDERS } from "./types";
import type { Json } from "@/types/supabase";

export function useRemindersQuery() {
    return useQuery<SystemReminder[]>({
        queryKey: ["reminders"],
        queryFn: async () => {
            const { data, error } = await supabase.from("reminders").select("*");
            if (error) throw error;

            // Auto-provision default system reminders if user has none
            if (!data || data.length === 0) {
                const {
                    data: { user },
                } = await supabase.auth.getUser();
                if (!user) return [];

                const payload = DEFAULT_REMINDERS.map((r) => ({
                    ...r,
                    user_id: user.id,
                    config: r.config as Json,
                }));

                const { data: seeded, error: seedError } = await supabase.from("reminders").insert(payload).select();

                if (seedError) throw seedError;
                return (seeded ?? []) as unknown as SystemReminder[];
            }

            return data as unknown as SystemReminder[];
        },
    });
}

export function useUpdateReminder() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Omit<SystemReminder, "id" | "user_id">> & { id: string }) => {
            const payload = {
                ...updates,
                ...(updates.config ? { config: updates.config as Json } : {}),
            };

            const { data, error } = await supabase.from("reminders").update(payload).eq("id", id).select().single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["reminders"] });
        },
    });
}
