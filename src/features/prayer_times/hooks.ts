import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { type PrayerTime, type CreateCustomPrayerInput, DEFAULT_SYSTEM_PRAYERS } from "./types";

export function usePrayerTimes() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["prayer_times"],
        queryFn: async (): Promise<PrayerTime[]> => {
            const { data, error } = await supabase
                .from("prayer_times")
                .select("*")
                .order("sort_order", { ascending: true });

            if (error) throw error;

            // Gracefully provision default system prayers if user has no rows yet
            if (!data || data.length === 0) {
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (!user) return [];

                const payload = DEFAULT_SYSTEM_PRAYERS.map((prayer) => ({
                    ...prayer,
                    user_id: user.id,
                }));

                const { data: seededData, error: seedError } = await supabase
                    .from("prayer_times")
                    .insert(payload)
                    .select()
                    .order("sort_order", { ascending: true });

                if (seedError) throw seedError;
                return seededData as PrayerTime[];
            }

            return data as PrayerTime[];
        },
    });

    const updatePrayer = useMutation({
        mutationFn: async ({ id, ...updates }: Partial<PrayerTime> & { id: string }) => {
            const { data, error } = await supabase.from("prayer_times").update(updates).eq("id", id).select().single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["prayer_times"] });
            // TODO: Trigger local notification rescheduling (@capacitor/local-notifications)
        },
    });

    const addCustomPrayer = useMutation({
        mutationFn: async (newPrayer: CreateCustomPrayerInput) => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) throw new Error("User not authenticated");

            // Calculate next sort_order
            const existing = query.data ?? [];
            const nextSortOrder = existing.length > 0 ? Math.max(...existing.map((p) => p.sort_order)) + 1 : 6;

            const { data, error } = await supabase
                .from("prayer_times")
                .insert({
                    user_id: user.id,
                    name: newPrayer.name,
                    time: newPrayer.time,
                    notify_enabled: newPrayer.notify_enabled,
                    notify_lead_minutes: newPrayer.notify_lead_minutes,
                    is_system: false,
                    sort_order: nextSortOrder,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["prayer_times"] });
        },
    });

    const deleteCustomPrayer = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("prayer_times").delete().eq("id", id).eq("is_system", false); // Safeguard against deleting system prayers

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["prayer_times"] });
        },
    });

    return {
        ...query,
        updatePrayer,
        addCustomPrayer,
        deleteCustomPrayer,
    };
}
