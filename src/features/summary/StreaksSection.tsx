import { useState } from "react";
import { ChevronDown, ChevronRight, Flame } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";

import { useTaskStreaks } from "./hooks";

export function StreaksSection() {
    const [isOpen, setIsOpen] = useState(true);
    const { data, isLoading } = useTaskStreaks();

    return (
        <div className="flex flex-col gap-2">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen((prev) => !prev)}
                className="px-1.5 h-7 text-xs font-semibold text-muted-foreground hover:text-foreground gap-1.5 w-fit"
            >
                {isOpen ? <ChevronDown data-icon="inline-start" /> : <ChevronRight data-icon="inline-start" />}
                <Flame className="size-3.5 text-primary" />
                <span>Recurring Streaks</span>
                {data.length > 0 && (
                    <Badge variant="secondary" className="text-[10px] font-normal px-1.5 h-4">
                        {data.length}
                    </Badge>
                )}
            </Button>

            {isOpen && (
                <div className="border border-border/80 rounded-xl bg-card overflow-hidden shadow-2xs">
                    {isLoading ? (
                        <div className="p-4 flex flex-col gap-2">
                            <Skeleton className="h-9 w-full rounded-lg" />
                            <Skeleton className="h-9 w-full rounded-lg" />
                        </div>
                    ) : data.length === 0 ? (
                        <Empty className="py-8 border-0">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <Flame />
                                </EmptyMedia>
                                <EmptyTitle className="text-xs">No active streaks yet</EmptyTitle>
                                <EmptyDescription className="text-[11px] max-w-xs">
                                    Complete a recurring task in consecutive weeks to build a streak.
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {data.map((s) => (
                                <div key={s.taskId} className="flex items-center justify-between gap-2 px-3.5 py-2.5">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-xs font-medium text-foreground truncate">{s.title}</span>
                                        {s.category && (
                                            <Badge
                                                variant="secondary"
                                                className="text-[10px] font-normal px-1.5 h-4.5 text-muted-foreground shrink-0 rounded-full gap-1"
                                            >
                                                {s.category.color && (
                                                    <span
                                                        className="size-1.5 rounded-full shrink-0"
                                                        style={{ backgroundColor: s.category.color }}
                                                    />
                                                )}
                                                <span className="truncate max-w-[80px]">{s.category.name}</span>
                                            </Badge>
                                        )}
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className="text-[10px] font-medium px-1.5 h-4.5 rounded-full gap-1 shrink-0 text-primary bg-primary/10"
                                    >
                                        <Flame className="size-3" />
                                        <span>{s.currentStreak}w</span>
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
