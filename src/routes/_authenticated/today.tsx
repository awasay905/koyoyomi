import { createFileRoute } from "@tanstack/react-router";
import { TodayPage } from "@/features/tasks/TodayPage";

export const Route = createFileRoute("/_authenticated/today")({
    component: TodayPage,
});
