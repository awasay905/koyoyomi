export type TaskType = "one_time" | "recurring";
export type Priority = "low" | "medium" | "high";
export type TaskStatus = "active" | "done" | "archived";
export type RecurrenceUnit = "day" | "week" | "month";
export type RecurrenceEndType = "never" | "after_n" | "on_date";

export interface Category {
    id: string;
    user_id: string;
    scope: "task" | "shopping";
    name: string;
    color: string | null;
    last_used: string | null;
    created_at: string;
}

export interface Task {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    category_id: string | null;
    type: TaskType;
    priority: Priority;
    status: TaskStatus;
    estimated_minutes: number | null;
    notify_enabled: boolean;
    notify_lead_minutes: number;

    // one_time
    deadline: string | null;
    completed_at: string | null;

    // recurring
    recurrence_unit: RecurrenceUnit | null;
    recurrence_interval: number | null;
    start_date: string | null;
    recurrence_end_type: RecurrenceEndType | null;
    recurrence_end_count: number | null;
    recurrence_end_date: string | null;

    created_at: string;
    category?: Category | null;
}

export interface TaskCompletion {
    id: string;
    task_id: string;
    completed_at: string;
    cycle_number: number | null;
    note: string | null;
}

export interface CreateTaskInput {
    title: string;
    description?: string | null;
    category_id?: string | null;
    type: TaskType;
    priority?: Priority;
    estimated_minutes?: number | null;
    notify_enabled?: boolean;
    notify_lead_minutes?: number;

    deadline?: string | null;

    recurrence_unit?: RecurrenceUnit | null;
    recurrence_interval?: number | null;
    start_date?: string | null;
    recurrence_end_type?: RecurrenceEndType | null;
    recurrence_end_count?: number | null;
    recurrence_end_date?: string | null;
}

export type UpdateTaskInput = Partial<CreateTaskInput> & { id: string };

export interface RecurringTaskState {
    nextDue: Date | null;
    isFinished: boolean;
    completionCount: number;
}
