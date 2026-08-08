import { createFileRoute } from "@tanstack/react-router";
import { WeeklyPatternPage } from "@/features/weekly_pattern/WeeklyPatternPage";

export const Route = createFileRoute("/_authenticated/settings/weekly_pattern")({
    component: WeeklyPatternPage,
});
