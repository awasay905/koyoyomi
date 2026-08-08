import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Task, TaskCompletion, CreateTaskInput, UpdateTaskInput } from "./types";

// ── Categories (scope='task') ──────────────────────────────
export function useTaskCategoriesQuery() {
    return useQuery({
        queryKey: ["categories", "task"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("categories")
                .select("*")
                .eq("scope", "task")
                .order("last_used", { ascending: false, nullsFirst: false });
            if (error) throw error;
            return data ?? [];
        },
    });
}

export function useCreateTaskCategory() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (name: string) => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const { data, error } = await supabase
                .from("categories")
                .insert({ name, scope: "task", user_id: user.id, last_used: new Date().toISOString() })
                .select()
                .single();
            if (error) throw error;
            return data.id as string;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["categories", "task"] }),
    });
}

// ── Tasks (both one_time and recurring) ───────────────────
export function useTasksQuery() {
    return useQuery<Task[]>({
        queryKey: ["tasks"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("tasks")
                .select("*, category:categories(*)")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return (data ?? []) as unknown as Task[];
        },
    });
}

// All completions for the current user — small dataset for a personal app,
// used client-side to compute each recurring task's next-due date.
export function useTaskCompletionsQuery() {
    return useQuery<TaskCompletion[]>({
        queryKey: ["task_completions"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("task_completions")
                .select("*")
                .order("completed_at", { ascending: false });
            if (error) throw error;
            return (data ?? []) as TaskCompletion[];
        },
    });
}

export function useAddTask() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (input: CreateTaskInput) => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const { data, error } = await supabase
                .from("tasks")
                .insert({ ...input, user_id: user.id })
                .select("*, category:categories(*)")
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
    });
}

export function useUpdateTask() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: UpdateTaskInput) => {
            const { error } = await supabase.from("tasks").update(updates).eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
    });
}

// One-time tasks only: flips status/completed_at directly on the task row.
export function useMarkOneTimeDone() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, done }: { id: string; done: boolean }) => {
            const update = done
                ? { status: "done" as const, completed_at: new Date().toISOString() }
                : { status: "active" as const, completed_at: null };
            const { error } = await supabase.from("tasks").update(update).eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
    });
}

// Recurring tasks: logs a completion row instead of changing task status.
// cycle_number = count of prior real (non-skip) completions + 1.
export function useLogTaskCompletion() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ taskId, priorCompletionCount }: { taskId: string; priorCompletionCount: number }) => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const { error } = await supabase.from("task_completions").insert({
                task_id: taskId,
                user_id: user.id,
                cycle_number: priorCompletionCount + 1,
            });
            if (error) throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["task_completions"] }),
    });
}

// Pushes next-due forward one interval without counting as a completion.
export function useSkipRecurringCycle() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (taskId: string) => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const { error } = await supabase.from("task_completions").insert({
                task_id: taskId,
                user_id: user.id,
                cycle_number: null,
                note: "skipped",
            });
            if (error) throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["task_completions"] }),
    });
}

export function useDeleteTask() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("tasks").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
    });
}
