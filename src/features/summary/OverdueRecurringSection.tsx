import { Repeat } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { cn } from "@/lib/utils";

import { useOverdueRecurringTasks } from "./hooks";

export function OverdueRecurringSection() {
    const { data = [], isLoading } = useOverdueRecurringTasks();

    return (
        <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Overdue Recurring
                    </h2>
                    {data.length > 0 && (
                        <Badge variant="destructive" className="rounded-full px-1.5 text-[10px] font-mono h-4">
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
                            <Repeat />
                        </EmptyMedia>
                        <EmptyTitle>Nothing overdue</EmptyTitle>
                        <EmptyDescription className="max-w-[240px]">
                            All recurring routines are on track.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
                    <CardContent className="p-0 flex flex-col gap-0">
                        {data.map((task, index) => (
                            <div key={task.id} className="flex flex-col">
                                <div className="group flex items-center justify-between p-3 px-4 hover:bg-accent/40 transition-colors">
                                    {/* Task Name & Category */}
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-3">
                                        <span
                                            className={cn(
                                                "size-2 rounded-full shrink-0",
                                                task.priority === "high" && "bg-destructive",
                                                task.priority === "medium" && "bg-amber-500",
                                                (!task.priority || task.priority === "low") && "bg-muted-foreground/40",
                                            )}
                                        />
                                        <span className="text-sm font-medium text-foreground truncate leading-tight">
                                            {task.title}
                                        </span>
                                        {task.category && (
                                            <Badge
                                                variant="secondary"
                                                className="text-[10px] font-normal px-1.5 h-4.5 text-muted-foreground shrink-0 rounded-full gap-1"
                                            >
                                                {task.category.color && (
                                                    <span
                                                        className="size-1.5 rounded-full shrink-0"
                                                        style={{ backgroundColor: task.category.color }}
                                                    />
                                                )}
                                                <span className="truncate max-w-[80px]">{task.category.name}</span>
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Due Badge */}
                                    <Badge
                                        variant="outline"
                                        className="text-[10px] font-normal px-2 h-5 shrink-0 rounded-full border-destructive/30 text-destructive bg-destructive/10"
                                    >
                                        Due{" "}
                                        {task.nextDue.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
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
