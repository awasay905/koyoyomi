import { z } from "zod";

// Plain strings for every numeric field — no z.coerce, no .default().
// This keeps z.input<schema> identical to z.output<schema>, which is
// required for zodResolver(schema) to satisfy Resolver<AddTaskValues>.
// Numbers are parsed manually in AddTaskDialog's onSubmit instead.
const numericString = (message = "Must be a whole number") =>
    z
        .string()
        .optional()
        .refine((v) => !v || /^\d+$/.test(v), { message });

export const addTaskSchema = z
    .object({
        title: z.string().min(1, "Title is required").max(150),
        description: z.string().max(1000).optional(),
        category_id: z.uuid().nullable().optional(),
        type: z.enum(["one_time", "recurring"]),
        priority: z.enum(["low", "medium", "high"]),
        estimated_minutes: numericString(),
        notify_enabled: z.boolean(),
        notify_lead_minutes: z.string().refine((v) => /^\d+$/.test(v), { message: "Required" }),

        // one_time only
        deadline: z.string().optional(),

        // recurring only
        recurrence_unit: z.enum(["day", "week", "month"]).optional(),
        recurrence_interval: numericString(),
        start_date: z.string().optional(),
        recurrence_end_type: z.enum(["never", "after_n", "on_date"]).optional(),
        recurrence_end_count: numericString(),
        recurrence_end_date: z.string().optional(),
    })
    .superRefine((values, ctx) => {
        if (values.type !== "recurring") return;

        if (!values.recurrence_unit) {
            ctx.addIssue({ code: "custom", path: ["recurrence_unit"], message: "Required" });
        }
        if (!values.recurrence_interval) {
            ctx.addIssue({ code: "custom", path: ["recurrence_interval"], message: "Required" });
        }
        if (!values.start_date) {
            ctx.addIssue({ code: "custom", path: ["start_date"], message: "Required" });
        }
        if (values.recurrence_end_type === "after_n" && !values.recurrence_end_count) {
            ctx.addIssue({ code: "custom", path: ["recurrence_end_count"], message: "Required" });
        }
        if (values.recurrence_end_type === "on_date" && !values.recurrence_end_date) {
            ctx.addIssue({ code: "custom", path: ["recurrence_end_date"], message: "Required" });
        }
    });

export type AddTaskValues = z.infer<typeof addTaskSchema>;
