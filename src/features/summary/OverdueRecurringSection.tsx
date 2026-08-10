import { AlertTriangle, Repeat } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { cn } from "@/lib/utils";

import { useOverdueRecurringTasks } from "./hooks";

export function OverdueRecurringSection() {
    const { data, isLoading } = useOverdueRecurringTasks();

    return (
        <Card className="border-border/80 shadow-2xs py-0">
            <CardHeader className="py-3 px-4 border-b border-border/50 bg-card/50 flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <AlertTriangle className="size-3.5 text-muted-foreground" />
                    <span>Overdue Recurring</span>
                </CardTitle>
                {data.length > 0 && (
                    <Badge variant="destructive" className="text-[10px] h-4.5 rounded-full px-1.5 font-mono">
                        {data.length}
                    </Badge>
                )}
            </CardHeader>

            <CardContent className="p-0">
                {isLoading ? (
                    <div className="p-4 flex flex-col gap-2">
                        <Skeleton className="h-10 w-full rounded-lg" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                ) : data.length === 0 ? (
                    <Empty className="py-8 border-0">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Repeat />
                            </EmptyMedia>
                            <EmptyTitle className="text-xs">Nothing overdue</EmptyTitle>
                            <EmptyDescription className="text-[11px] max-w-xs">
                                All your recurring tasks are on schedule.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <div className="divide-y divide-border/50">
                        {data.map((task) => (
                            <div key={task.id} className="flex items-center justify-between gap-2 px-4 py-2.5">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span
                                        className={cn(
                                            "size-1.5 rounded-full shrink-0",
                                            task.priority === "high" && "bg-destructive",
                                            task.priority === "medium" && "bg-amber-500 dark:bg-amber-400",
                                            task.priority === "low" && "bg-muted-foreground/40",
                                        )}
                                    />
                                    <Repeat className="size-3 text-muted-foreground shrink-0" />
                                    <span className="text-xs font-medium text-foreground truncate">{task.title}</span>
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
                                <Badge
                                    variant="destructive"
                                    className="text-[10px] font-normal px-1.5 h-4.5 shrink-0 rounded-full"
                                >
                                    Due{" "}
                                    {task.nextDue.toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </Badge>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}