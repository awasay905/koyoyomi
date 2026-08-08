import { z } from "zod";

// Matches the DB check constraint: extract(minute from time) % 5 = 0
const isFiveMinuteStep = (timeStr: string) => {
    const parts = timeStr.split(":");
    if (parts.length < 2) return false;
    const minutes = parseInt(parts[1], 10);
    return !isNaN(minutes) && minutes % 5 === 0;
};

export const dayTypeSchema = z.object({
    name: z.string().min(1, "Name is required").max(50),
    color: z.string().optional().nullable(),
});

export type DayTypeValues = z.infer<typeof dayTypeSchema>;

export const scheduleBlockSchema = z
    .object({
        title: z.string().min(1, "Title is required").max(100),
        block_type: z.enum(["fixed", "free"]),
        start_time: z.string().refine(isFiveMinuteStep, { message: "Must be a 5-minute increment" }),
        end_time: z.string().refine(isFiveMinuteStep, { message: "Must be a 5-minute increment" }),
        notes: z.string().max(500).optional(),
    })
    .refine((data) => data.end_time > data.start_time, {
        message: "End time must be after start time",
        path: ["end_time"],
    });

export type ScheduleBlockValues = z.infer<typeof scheduleBlockSchema>;
