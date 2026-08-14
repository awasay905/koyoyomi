import { useIsMobile } from "@/hooks/useIsMobile";
import { Outlet } from "@tanstack/react-router";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { useAutoAssignRecurringTasks } from "@/features/task_assignments/autoAssign";

// This is your actual UI Shell
export function AppShell() {
    const isMobile = useIsMobile();
    useAutoAssignRecurringTasks();

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Desktop sidebar */}
            {!isMobile && <Sidebar />}

            {/* Main content area */}
            <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
                <Outlet />
            </main>

            {/* Mobile bottom nav */}
            {isMobile && <BottomNav />}
        </div>
    );
}
