import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type {
    DayType,
    ScheduleBlock,
    CreateDayTypeInput,
    UpdateDayTypeInput,
    CreateScheduleBlockInput,
    UpdateScheduleBlockInput,
} from "./types";

// ── Day Types ───────────────────────────────────────────────
export function useDayTypesQuery() {
    return useQuery<DayType[]>({
        queryKey: ["day_types"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("day_types")
                .select("*")
                .eq("is_archived", false)
                .order("created_at", { ascending: true });
            if (error) throw error;
            return (data ?? []) as DayType[];
        },
    });
}

export function useDayTypeQuery(id: string | undefined) {
    return useQuery<DayType | null>({
        queryKey: ["day_types", id],
        queryFn: async () => {
            if (!id) return null;
            const { data, error } = await supabase.from("day_types").select("*").eq("id", id).single();
            if (error) throw error;
            return data as DayType;
        },
        enabled: Boolean(id),
    });
}

export function useAddDayType() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (input: CreateDayTypeInput) => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const { data, error } = await supabase
                .from("day_types")
                .insert({ ...input, user_id: user.id })
                .select()
                .single();
            if (error) throw error;
            return data as DayType;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["day_types"] }),
    });
}

export function useUpdateDayType() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: UpdateDayTypeInput) => {
            const { error } = await supabase.from("day_types").update(updates).eq("id", id);
            if (error) throw error;
        },
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: ["day_types"] });
            qc.invalidateQueries({ queryKey: ["day_types", variables.id] });
        },
    });
}

// Day-types are archived, never hard-deleted (per design doc §5/Settings).
export function useArchiveDayType() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("day_types").update({ is_archived: true }).eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["day_types"] }),
    });
}

// ── Schedule Blocks ─────────────────────────────────────────
export function useScheduleBlocksQuery(dayTypeId: string | undefined) {
    return useQuery<ScheduleBlock[]>({
        queryKey: ["schedule_blocks", dayTypeId],
        queryFn: async () => {
            if (!dayTypeId) return [];
            const { data, error } = await supabase
                .from("schedule_blocks")
                .select("*")
                .eq("day_type_id", dayTypeId)
                .order("sort_order", { ascending: true });
            if (error) throw error;
            return (data ?? []) as ScheduleBlock[];
        },
        enabled: Boolean(dayTypeId),
    });
}

export function useAddScheduleBlock() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (input: CreateScheduleBlockInput & { existingCount: number }) => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const { existingCount, ...rest } = input;
            const { data, error } = await supabase
                .from("schedule_blocks")
                .insert({ ...rest, user_id: user.id, sort_order: rest.sort_order ?? existingCount })
                .select()
                .single();
            if (error) throw error;
            return data as ScheduleBlock;
        },
        onSuccess: (data) => qc.invalidateQueries({ queryKey: ["schedule_blocks", data.day_type_id] }),
    });
}

export function useUpdateScheduleBlock(dayTypeId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: UpdateScheduleBlockInput) => {
            const { error } = await supabase.from("schedule_blocks").update(updates).eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["schedule_blocks", dayTypeId] }),
    });
}

export function useDeleteScheduleBlock(dayTypeId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("schedule_blocks").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["schedule_blocks", dayTypeId] }),
    });
}

// Persists a full reordering as a batch of sort_order updates, with an
// optimistic cache update so the drag feels instant.
export function useReorderScheduleBlocks(dayTypeId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (orderedIds: string[]) => {
            const results = await Promise.all(
                orderedIds.map((id, index) =>
                    supabase.from("schedule_blocks").update({ sort_order: index }).eq("id", id),
                ),
            );
            const firstError = results.find((r) => r.error)?.error;
            if (firstError) throw firstError;
        },
        onMutate: async (orderedIds) => {
            await qc.cancelQueries({ queryKey: ["schedule_blocks", dayTypeId] });
            const previous = qc.getQueryData<ScheduleBlock[]>(["schedule_blocks", dayTypeId]);
            if (previous) {
                const byId = new Map(previous.map((b) => [b.id, b]));
                const reordered = orderedIds
                    .map((id, index) => {
                        const block = byId.get(id);
                        return block ? { ...block, sort_order: index } : null;
                    })
                    .filter((b): b is ScheduleBlock => Boolean(b));
                qc.setQueryData(["schedule_blocks", dayTypeId], reordered);
            }
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) qc.setQueryData(["schedule_blocks", dayTypeId], context.previous);
        },
        onSettled: () => qc.invalidateQueries({ queryKey: ["schedule_blocks", dayTypeId] }),
    });
}
