import { CheckCircle2, SkipForward, ListChecks } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useWeekStats } from "./hooks";

export function WeekOverviewCard() {
    const { data, isLoading } = useWeekStats();

    return (
        <Card className="border-border/80 shadow-2xs">
            <CardHeader className="py-3 px-4 border-b border-border/50 bg-card/50">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <ListChecks className="size-3.5 text-muted-foreground" />
                    <span>This Week</span>
                </CardTitle>
            </CardHeader>

            <CardContent className="p-4">
                {isLoading ? (
                    <div className="grid grid-cols-3 gap-3">
                        <Skeleton className="h-16 rounded-xl" />
                        <Skeleton className="h-16 rounded-xl" />
                        <Skeleton className="h-16 rounded-xl" />
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-muted/40 border border-border/50">
                            <span className="text-lg font-bold font-mono text-foreground tabular-nums">
                                {data.completed}
                                <span className="text-xs font-normal text-muted-foreground">/{data.totalAssigned}</span>
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                <CheckCircle2 className="size-3" />
                                <span>Completed</span>
                            </span>
                        </div>

                        <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-muted/40 border border-border/50">
                            <span className="text-lg font-bold font-mono text-foreground tabular-nums">
                                {data.skipped}
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                <SkipForward className="size-3" />
                                <span>Skipped</span>
                            </span>
                        </div>

                        <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-muted/40 border border-border/50">
                            <span className="text-lg font-bold font-mono text-foreground tabular-nums">
                                {data.totalAssigned}
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                <ListChecks className="size-3" />
                                <span>Assigned</span>
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
