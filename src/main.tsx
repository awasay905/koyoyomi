import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";
import "./index.css";

const router = createRouter({
    routeTree,
    defaultPreload: "intent",
    // Preload on mouseenter/touchstart instantly for zero-delay page switches
    defaultPreloadDelay: 50,
    defaultPendingMs: 0,
    defaultPendingMinMs: 0,
});

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // Increased to 5 minutes so switching back and forth doesn't trigger unnecessary refetches
            gcTime: 1000 * 60 * 15, // 15 minutes garbage collection time
            refetchOnWindowFocus: false, // Prevents jarring refetches when clicking back into the tab
            retry: 1,
        },
    },
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
