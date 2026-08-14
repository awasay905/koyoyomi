import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWeekStats } from "./hooks";

export function WeekOverviewCard() {
    const { data, isLoading } = useWeekStats();

    const completionRate = data && data.totalAssigned > 0 ? Math.round((data.completed / data.totalAssigned) * 100) : 0;

    return (
        <section className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                Weekly Overview
            </h2>

            <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
                <CardContent className="p-0 flex flex-col gap-0">
                    {isLoading ? (
                        <div className="grid grid-cols-4 divide-x divide-border/50 p-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex flex-col items-center gap-1.5 px-2">
                                    <Skeleton className="h-6 w-10 rounded-md" />
                                    <Skeleton className="h-3 w-12 rounded-md" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 divide-x divide-border/50">
                            {/* Metric 1: Completed */}
                            <div className="flex flex-col items-center justify-center p-3.5 text-center">
                                <span className="text-lg font-bold font-mono text-foreground tabular-nums leading-tight">
                                    {data.completed}
                                </span>
                                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mt-1">
                                    Done
                                </span>
                            </div>

                            {/* Metric 2: Skipped */}
                            <div className="flex flex-col items-center justify-center p-3.5 text-center">
                                <span className="text-lg font-bold font-mono text-muted-foreground tabular-nums leading-tight">
                                    {data.skipped}
                                </span>
                                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mt-1">
                                    Skipped
                                </span>
                            </div>

                            {/* Metric 3: Total Assigned */}
                            <div className="flex flex-col items-center justify-center p-3.5 text-center">
                                <span className="text-lg font-bold font-mono text-foreground tabular-nums leading-tight">
                                    {data.totalAssigned}
                                </span>
                                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mt-1">
                                    Total
                                </span>
                            </div>

                            {/* Metric 4: Completion Rate % */}
                            <div className="flex flex-col items-center justify-center p-3.5 text-center bg-accent/20">
                                <span className="text-lg font-bold font-mono text-foreground tabular-nums leading-tight">
                                    {completionRate}%
                                </span>
                                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mt-1">
                                    Rate
                                </span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </section>
    );
}
