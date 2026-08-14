import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { TaskAssignment, CreateAssignmentInput } from "./types";

const ASSIGNMENT_SELECT = "*, task:tasks(*, category:categories(*)), schedule_block:schedule_blocks(*)";

// ── Reads ───────────────────────────────────────────────────

// All assignments (slotted + unslotted) for one calendar date. Powers
// Today's timeline/unslotted section and Week's day panel.
export function useDayAssignmentsQuery(date: string | undefined) {
    return useQuery<TaskAssignment[]>({
        queryKey: ["task_assignments", "day", date],
        queryFn: async () => {
            if (!date) return [];
            const { data, error } = await supabase
                .from("task_assignments")
                .select(ASSIGNMENT_SELECT)
                .eq("assigned_date", date)
                .order("created_at", { ascending: true });
            if (error) throw error;
            return (data ?? []) as unknown as TaskAssignment[];
        },
        enabled: Boolean(date),
    });
}

// One range query for the Week strip's per-day assignment dot-counts,
// instead of 7 separate date queries.
export function useAssignmentsRangeQuery(startDate: string | undefined, endDate: string | undefined) {
    return useQuery<TaskAssignment[]>({
        queryKey: ["task_assignments", "range", startDate, endDate],
        queryFn: async () => {
            if (!startDate || !endDate) return [];
            const { data, error } = await supabase
                .from("task_assignments")
                .select(ASSIGNMENT_SELECT)
                .gte("assigned_date", startDate)
                .lte("assigned_date", endDate);
            if (error) throw error;
            return (data ?? []) as unknown as TaskAssignment[];
        },
        enabled: Boolean(startDate && endDate),
    });
}

// All pending assignments, used to compute "unassigned" in the Backlog
// filter chip and the task picker (§11: "backlog picker filtered to
// unassigned tasks").
export function usePendingAssignmentsQuery() {
    return useQuery<TaskAssignment[]>({
        queryKey: ["task_assignments", "pending"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("task_assignments")
                .select("id, task_id, assigned_date, schedule_block_id, status")
                .eq("status", "pending");
            if (error) throw error;
            return (data ?? []) as unknown as TaskAssignment[];
        },
    });
}

function invalidateAssignmentQueries(qc: ReturnType<typeof useQueryClient>) {
    qc.invalidateQueries({ queryKey: ["task_assignments"] });
}

// ── Step 1: assign to a day ─────────────────────────────────
export function useAssignTaskToDay() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (input: CreateAssignmentInput) => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            // Prevent duplicate pending assignment for the same task on the same date
            const { data: existing } = await supabase
                .from("task_assignments")
                .select(ASSIGNMENT_SELECT)
                .eq("task_id", input.task_id)
                .eq("assigned_date", input.assigned_date)
                .eq("status", "pending")
                .maybeSingle();

            if (existing) {
                return existing as unknown as TaskAssignment;
            }

            const { data, error } = await supabase
                .from("task_assignments")
                .insert({ ...input, user_id: user.id })
                .select(ASSIGNMENT_SELECT)
                .single();
            if (error) throw error;
            return data as unknown as TaskAssignment;
        },
        onSuccess: () => invalidateAssignmentQueries(qc),
    });
}

// ── Step 2: assign / move to a slot ─────────────────────────
export function useAssignToSlot() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, schedule_block_id }: { id: string; schedule_block_id: string }) => {
            const { error } = await supabase.from("task_assignments").update({ schedule_block_id }).eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => invalidateAssignmentQueries(qc),
    });
}

// Back to day-level only (keeps the assignment, clears the slot).
export function useUnassignFromSlot() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("task_assignments").update({ schedule_block_id: null }).eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => invalidateAssignmentQueries(qc),
    });
}

// Removes the assignment entirely — task returns to the backlog.
export function useUnassignFromDay() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("task_assignments").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => invalidateAssignmentQueries(qc),
    });
}

// Marking done from Today (§7): one-time tasks flip status on the task row;
// recurring tasks log a completion. Either way the assignment itself closes.
export function useMarkAssignmentDone() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({
            assignmentId,
            taskId,
            taskType,
            priorCompletionCount,
        }: {
            assignmentId: string;
            taskId: string;
            taskType: "one_time" | "recurring";
            priorCompletionCount: number;
        }) => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const nowIso = new Date().toISOString();

            if (taskType === "one_time") {
                const { error: taskError } = await supabase
                    .from("tasks")
                    .update({ status: "done", completed_at: nowIso })
                    .eq("id", taskId);
                if (taskError) throw taskError;
            } else {
                const { error: completionError } = await supabase.from("task_completions").insert({
                    task_id: taskId,
                    user_id: user.id,
                    cycle_number: priorCompletionCount + 1,
                });
                if (completionError) throw completionError;
            }

            const { error: assignmentError } = await supabase
                .from("task_assignments")
                .update({ status: "done", completed_at: nowIso })
                .eq("id", assignmentId);
            if (assignmentError) throw assignmentError;
        },
        onSuccess: () => {
            invalidateAssignmentQueries(qc);
            qc.invalidateQueries({ queryKey: ["tasks"] });
            qc.invalidateQueries({ queryKey: ["task_completions"] });
        },
    });
}

// Creates (or reuses) today's pending assignment and drops it straight into a
// slot in one call — used by Today's "needs attention" quick-assign action.
export function useQuickAssignToSlot() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({
            task_id,
            assigned_date,
            schedule_block_id,
        }: {
            task_id: string;
            assigned_date: string;
            schedule_block_id: string;
        }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const { data: existing } = await supabase
                .from("task_assignments")
                .select(ASSIGNMENT_SELECT)
                .eq("task_id", task_id)
                .eq("assigned_date", assigned_date)
                .eq("status", "pending")
                .maybeSingle();

            if (existing) {
                const { error } = await supabase
                    .from("task_assignments")
                    .update({ schedule_block_id })
                    .eq("id", existing.id);
                if (error) throw error;
                return;
            }

            const { error } = await supabase
                .from("task_assignments")
                .insert({ task_id, assigned_date, schedule_block_id, user_id: user.id });
            if (error) throw error;
        },
        onSuccess: () => invalidateAssignmentQueries(qc),
    });
}