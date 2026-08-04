import { createFileRoute } from "@tanstack/react-router";
import { ShoppingPage } from "@/features/shopping/ShoppingPage";

export const Route = createFileRoute("/_authenticated/shopping")({
    component: ShoppingPage,
});
