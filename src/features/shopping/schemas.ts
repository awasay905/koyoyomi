import { z } from "zod";

export const quickAddSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    quantity: z.string().max(50).optional(),
    category_id: z.string().uuid().nullable().optional(),
});

export type QuickAddValues = z.infer<typeof quickAddSchema>;
