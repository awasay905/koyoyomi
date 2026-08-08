import { createFileRoute } from "@tanstack/react-router";
import { BacklogPage } from "@/features/tasks/BacklogPage";

export const Route = createFileRoute("/_authenticated/backlog")({
    component: BacklogPage,
});
