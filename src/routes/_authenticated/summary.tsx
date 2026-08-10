import { createFileRoute } from "@tanstack/react-router";
import { SummaryPage } from "@/features/summary/SummaryPage";

export const Route = createFileRoute("/_authenticated/summary")({
    component: SummaryPage,
});
