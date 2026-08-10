import type { Json } from "@/types/supabase";

export type ReminderType = "plan_next_day" | "stale_backlog" | "weekly_summary";

export type ReminderConfig = {
    idle_days_threshold?: number;
    [key: string]: Json | undefined;
};

export interface SystemReminder {
    id: string;
    user_id: string;
    reminder_type: ReminderType;
    fire_time: string; // "HH:MM:SS"
    is_enabled: boolean;
    config: ReminderConfig;
}

export const DEFAULT_REMINDERS: Omit<SystemReminder, "id" | "user_id">[] = [
    {
        reminder_type: "plan_next_day",
        fire_time: "21:00:00",
        is_enabled: true,
        config: {},
    },
    {
        reminder_type: "stale_backlog",
        fire_time: "10:00:00",
        is_enabled: true,
        config: { idle_days_threshold: 3 },
    },
    {
        reminder_type: "weekly_summary",
        fire_time: "18:00:00",
        is_enabled: true,
        config: {},
    },
];
