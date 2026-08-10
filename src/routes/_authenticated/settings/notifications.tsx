import { createFileRoute } from "@tanstack/react-router";
import { ScheduledNotificationsPage } from "@/features/mobile_notifications/ScheduledNotificationsPage";

export const Route = createFileRoute("/_authenticated/settings/notifications")({
    component: ScheduledNotificationsPage,
});