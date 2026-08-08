import { Link, useRouterState } from "@tanstack/react-router";
import { NAV_ITEMS } from "./nav-items";
import { cn } from "@/lib/utils";
import { useSignOut } from "@/features/auth/hooks";
import logoSvg from "@/assets/logo.svg";

export function Sidebar() {
    const { location } = useRouterState();

    return (
        <aside className="w-56 border-r border-border bg-card flex flex-col shrink-0 h-screen">
            {/* Logo */}
            <div className="px-6 py-5 border-b border-border flex items-center gap-1">
                <img src={logoSvg} alt="Koyomi Logo" className="size-6 shrink-0" />
                <span className="font-semibold text-lg tracking-tight">Koyoyomi</span>
            </div>

            {/* Nav links */}
            <nav className="flex-1 p-3 flex flex-col gap-1">
                {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
                    const isActive = location.pathname.startsWith(to);
                    return (
                        <Link
                            key={to}
                            to={to}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground font-medium"
                                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                            )}
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* User/sign out at bottom */}
            <div className="p-3 border-t border-border">
                <button
                    className="text-sm text-muted-foreground hover:text-foreground px-3 py-2"
                    onClick={useSignOut()}
                >
                    Sign out
                </button>
            </div>
        </aside>
    );
}
