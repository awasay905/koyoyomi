import { z } from "zod";

// Helper to validate 5-minute step increments (e.g. 05:45, 12:30:00)
const isFiveMinuteStep = (timeStr: string) => {
  const parts = timeStr.split(":");
  if (parts.length < 2) return false;
  const minutes = parseInt(parts[1], 10);
  return !isNaN(minutes) && minutes % 5 === 0;
};

export const prayerTimeSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  name: z.string().min(1, "Name is required"),
  time: z
    .string()
    .refine(isFiveMinuteStep, { message: "Time must be in 5-minute increments" }),
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
  time: z
    .string()
    .refine(isFiveMinuteStep, { message: "Time must be in 5-minute increments" }),
  notify_enabled: z.boolean().default(false),
  notify_lead_minutes: z.number().min(0).default(0),
});