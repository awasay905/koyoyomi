import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/backlog")({
    component: () => <div>Hello "/backlog"!</div>,
});
