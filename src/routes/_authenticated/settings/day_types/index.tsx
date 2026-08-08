import { createFileRoute } from "@tanstack/react-router";
import { DayTypesPage } from "@/features/day_types/DayTypesPage";

export const Route = createFileRoute("/_authenticated/settings/day_types/")({
    component: DayTypesPage,
});
