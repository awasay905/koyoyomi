import { createFileRoute } from "@tanstack/react-router";
import { RemindersSettings } from "@/features/reminders/RemindersSettings";

export const Route = createFileRoute("/_authenticated/settings/reminders")({
    component: RemindersSettings,
});
