import { createRootRoute, Outlet } from "@tanstack/react-router";
import { ThemeProvider } from "@/hooks/useTheme";

export const Route = createRootRoute({
    component: () => (
        <ThemeProvider>
            <Outlet />
        </ThemeProvider>
    ),
});
