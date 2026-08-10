import { z } from "zod";

// History tab filters (task + category). Not bound to react-hook-form —
// the filter UI is plain dropdowns — but kept here for a shared, validated
// shape matching the schemas.ts convention used by other features.
export const historyFilterSchema = z.object({
    taskId: z.string().nullable(),
    categoryId: z.string().nullable(),
});

export type HistoryFilterValues = z.infer<typeof historyFilterSchema>;
