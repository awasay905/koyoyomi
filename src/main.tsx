import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";
import { App as CapacitorApp } from "@capacitor/app";
import { rescheduleAllLocalNotifications } from "@/lib/notifications";
import "./index.css";

// Reschedule when user returns to the app from the background / home screen
CapacitorApp.addListener("appStateChange", ({ isActive }) => {
    if (isActive) {
        rescheduleAllLocalNotifications();
    }
});

const router = createRouter({
    routeTree,
    defaultPreload: "intent",
    defaultPreloadDelay: 50,
    defaultPendingMs: 0,
    defaultPendingMinMs: 0,
});

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 15, // 15 minutes
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

// GLOBAL NOTIFICATION RESCHEDULER LISTENER
const NOTIFICATION_QUERY_KEYS = [
    "tasks",
    "task_assignments",
    "prayer_times",
    "weekly_pattern",
    "day_overrides",
    "schedule_blocks",
];

// Debounce helper to avoid multiple rapid reschedules
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

queryClient.getQueryCache().subscribe((event) => {
    if (event.type === "updated" && event.action?.type === "invalidate") {
        const queryKey = event.query.queryKey;
        const matchesKey = queryKey.some((k: string) => typeof k === "string" && NOTIFICATION_QUERY_KEYS.includes(k));

        if (matchesKey) {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                rescheduleAllLocalNotifications();
            }, 300); // 300ms debounce
        }
    }
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        </StrictMode>,
    );
}
