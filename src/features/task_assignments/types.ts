import type { Task } from "@/features/tasks/types";
import type { ScheduleBlock } from "@/features/day_types/types";

export type AssignmentStatus = "pending" | "done" | "skipped";

export interface TaskAssignment {
    id: string;
    user_id: string;
    task_id: string;
    assigned_date: string; // YYYY-MM-DD
    schedule_block_id: string | null; // null = day-level only (unslotted)
    status: AssignmentStatus;
    completed_at: string | null;
    created_at: string;
    // joined
    task?: Task | null;
    schedule_block?: ScheduleBlock | null;
}

export interface CreateAssignmentInput {
    task_id: string;
    assigned_date: string;
}
