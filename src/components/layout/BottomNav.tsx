import { Link, useRouterState } from "@tanstack/react-router";
import { NAV_ITEMS } from "./nav-items";
import { cn } from "@/lib/utils";

export function BottomNav() {
    const { location } = useRouterState();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
            <div className="flex h-16">
                {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
                    const isActive = location.pathname.startsWith(to);
                    return (
                        <Link key={to} to={to} className="flex-1 flex flex-col items-center justify-center gap-0.5">
                            <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                            <span
                                className={cn(
                                    "text-[10px]",
                                    isActive ? "text-primary font-medium" : "text-muted-foreground",
                                )}
                            >
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
