import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/shopping")({
    component: () => (
        <>
            <div>Hello "/shopping"!</div>
        </>
    ),
});
