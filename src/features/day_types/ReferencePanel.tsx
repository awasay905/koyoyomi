import { useState } from "react";
import { Clock, ChevronDown, ChevronUp, Bell } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { usePrayerTimes } from "@/features/prayer_times/hooks";
import { formatTimeLabel12h } from "./utils";

// Read-only reference rows shown alongside the block editor (§5).
// Sidebar on desktop (always expanded); collapsible section on mobile.
export function ReferencePanel() {
    const { data: prayerTimes, isLoading } = usePrayerTimes();
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="border border-border/80 rounded-xl bg-card/60 overflow-hidden shadow-2xs">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="w-full px-3 py-2.5 border-b border-border/60 flex items-center justify-between gap-2 md:cursor-default"
            >
                <div className="flex items-center gap-2">
                    <Clock className="size-3.5 text-muted-foreground" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Reference — Prayer Times
                    </span>
                </div>
                <span className="md:hidden text-muted-foreground">
                    {isOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                </span>
            </button>

            <div className={cn(isOpen ? "block" : "hidden", "md:block")}>
                {isLoading ? (
                    <div className="p-3 flex flex-col gap-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                ) : (
                    <div className="divide-y divide-border/40">
                        {(prayerTimes ?? []).map((p) => (
                            <div key={p.id} className="flex items-center justify-between px-3 py-2">
                                <span className="text-xs text-foreground font-medium">{p.name}</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-mono text-muted-foreground tabular-nums">
                                        {formatTimeLabel12h(p.time)}
                                    </span>
                                    {p.notify_enabled && (
                                        <Bell className="size-3 text-primary/70" aria-label="Notification enabled" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <p className="px-3 py-2 text-[10px] leading-relaxed text-muted-foreground border-t border-border/40 bg-muted/20">
                    Read-only reference. Block times don&apos;t update automatically — adjust them manually if a prayer
                    time changes.
                </p>
            </div>
        </div>
    );
}
