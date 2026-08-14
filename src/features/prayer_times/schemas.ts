import { z } from "zod";

const isFiveMinuteStep = (timeStr: string) => {
    if (!timeStr) return false;
    const parts = timeStr.split(":");
    if (parts.length < 2) return false;
    const minutes = parseInt(parts[1], 10);
    return !isNaN(minutes) && minutes % 5 === 0;
};

export const prayerTimeSchema = z.object({
    id: z.uuid(),
    user_id: z.uuid(),
    name: z.string().min(1, "Name is required"),
    time: z.string().refine(isFiveMinuteStep, { message: "Time must be in 5-minute increments" }),
    is_system: z.boolean(),
    sort_order: z.number().int(),
    notify_enabled: z.boolean(),
    notify_lead_minutes: z.number().min(0, "Lead time cannot be negative"),
});

export const updatePrayerSchema = prayerTimeSchema.pick({
    time: true,
    notify_enabled: true,
    notify_lead_minutes: true,
});

export const createCustomPrayerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    time: z.string().refine(isFiveMinuteStep, { message: "Time must be in 5-minute increments" }),
    notify_enabled: z.boolean(),
    notify_lead_minutes: z.number().min(0, "Lead time cannot be negative"),
});

export type CreateCustomPrayerValues = z.infer<typeof createCustomPrayerSchema>;
export type UpdatePrayerValues = z.infer<typeof updatePrayerSchema>;
