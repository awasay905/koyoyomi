import { Flame } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";

import { useTaskStreaks } from "./hooks";

export function StreaksSection() {
    const { data = [], isLoading } = useTaskStreaks();

    return (
        <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Recurring Streaks
                    </h2>
                    {data.length > 0 && (
                        <Badge variant="secondary" className="rounded-full px-1.5 text-[10px] font-mono h-4">
                            {data.length}
                        </Badge>
                    )}
                </div>
            </div>

            {isLoading ? (
                <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
                    <CardContent className="p-0 flex flex-col gap-0">
                        <div className="p-4 flex flex-col gap-2">
                            <Skeleton className="h-5 w-full rounded-md" />
                            <Skeleton className="h-5 w-full rounded-md" />
                        </div>
                    </CardContent>
                </Card>
            ) : data.length === 0 ? (
                <Empty className="py-8 border border-dashed border-border/80 rounded-xl bg-card/40">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Flame />
                        </EmptyMedia>
                        <EmptyTitle>No active streaks</EmptyTitle>
                        <EmptyDescription className="max-w-[240px]">
                            Complete recurring tasks across consecutive weeks to build momentum.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
                    <CardContent className="p-0 flex flex-col gap-0">
                        {data.map((item, index) => (
                            <div key={item.taskId} className="flex flex-col">
                                <div className="group flex items-center justify-between p-3 px-4 hover:bg-accent/40 transition-colors">
                                    {/* Task Name & Category */}
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-3">
                                        <span className="text-sm font-medium text-foreground truncate leading-tight">
                                            {item.title}
                                        </span>
                                        {item.category && (
                                            <Badge
                                                variant="secondary"
                                                className="text-[10px] font-normal px-1.5 h-4.5 text-muted-foreground shrink-0 rounded-full gap-1"
                                            >
                                                {item.category.color && (
                                                    <span
                                                        className="size-1.5 rounded-full shrink-0"
                                                        style={{ backgroundColor: item.category.color }}
                                                    />
                                                )}
                                                <span className="truncate max-w-[80px]">{item.category.name}</span>
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Streak Badge */}
                                    <Badge
                                        variant="secondary"
                                        className="text-[11px] font-mono font-medium px-2 h-5 rounded-full shrink-0 text-foreground"
                                    >
                                        {item.currentStreak}w
                                    </Badge>
                                </div>

                                {index < data.length - 1 && <div className="h-px bg-border/50 mx-4" />}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </section>
    );
}
