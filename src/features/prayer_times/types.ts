import { z } from "zod";
import { prayerTimeSchema, updatePrayerSchema, createCustomPrayerSchema } from "./schemas";

export type PrayerTime = z.infer<typeof prayerTimeSchema>;
export type UpdatePrayerTimeInput = z.infer<typeof updatePrayerSchema>;
export type CreateCustomPrayerInput = z.infer<typeof createCustomPrayerSchema>;

// Default system prayers auto-seeded for new users
export const DEFAULT_SYSTEM_PRAYERS: Omit<PrayerTime, "id" | "user_id">[] = [
    {
        name: "Fajr",
        time: "05:30:00",
        is_system: true,
        sort_order: 1,
        notify_enabled: true,
        notify_lead_minutes: 10,
    },
    {
        name: "Dhuhr",
        time: "12:30:00",
        is_system: true,
        sort_order: 2,
        notify_enabled: true,
        notify_lead_minutes: 5,
    },
    {
        name: "Asr",
        time: "15:45:00",
        is_system: true,
        sort_order: 3,
        notify_enabled: true,
        notify_lead_minutes: 5,
    },
    {
        name: "Maghrib",
        time: "18:15:00",
        is_system: true,
        sort_order: 4,
        notify_enabled: true,
        notify_lead_minutes: 5,
    },
    {
        name: "Isha",
        time: "20:00:00",
        is_system: true,
        sort_order: 5,
        notify_enabled: true,
        notify_lead_minutes: 10,
    },
];
