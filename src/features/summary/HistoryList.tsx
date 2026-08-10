import { useMemo, useState } from "react";
import { CheckCircle2, SkipForward, History as HistoryIcon, ChevronsUpDown, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { useTasksQuery, useTaskCategoriesQuery } from "@/features/tasks/hooks";
import { useCompletionHistory } from "./hooks";

function formatHistoryDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function HistoryList() {
    const { data: entries, isLoading } = useCompletionHistory();
    const { data: tasks = [] } = useTasksQuery();
    const { data: categories = [] } = useTaskCategoriesQuery();

    const [taskFilter, setTaskFilter] = useState<string | null>(null);
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

    const filtered = useMemo(() => {
        return entries.filter((e) => {
            if (taskFilter && e.taskId !== taskFilter) return false;
            if (categoryFilter && e.category?.id !== categoryFilter) return false;
            return true;
        });
    }, [entries, taskFilter, categoryFilter]);

    const selectedTask = tasks.find((t) => t.id === taskFilter) ?? null;
    const selectedCategory = categories.find((c) => c.id === categoryFilter) ?? null;

    return (
        <div className="flex flex-col gap-3">
            {/* Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-6.5 text-xs rounded-full px-3 shrink-0 font-normal gap-1.5 bg-background"
                            />
                        }
                    >
                        <span className="truncate max-w-28">{selectedTask?.title ?? "All tasks"}</span>
                        <ChevronsUpDown data-icon="inline-end" className="text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 max-h-64 overflow-y-auto">
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => setTaskFilter(null)} className="justify-between">
                                <span>All tasks</span>
                                {!taskFilter && <Check data-icon="inline-end" className="text-primary" />}
                            </DropdownMenuItem>
                            {tasks.map((t) => (
                                <DropdownMenuItem
                                    key={t.id}
                                    onClick={() => setTaskFilter(t.id)}
                                    className="justify-between"
                                >
                                    <span className="truncate">{t.title}</span>
                                    {taskFilter === t.id && <Check data-icon="inline-end" className="text-primary" />}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-6.5 text-xs rounded-full px-3 shrink-0 font-normal gap-1.5 bg-background"
                            />
                        }
                    >
                        <span className="flex items-center gap-1.5 truncate max-w-28">
                            {selectedCategory?.color && (
                                <span
                                    className="size-2 rounded-full shrink-0"
                                    style={{ backgroundColor: selectedCategory.color }}
                                />
                            )}
                            <span className="truncate">{selectedCategory?.name ?? "All categories"}</span>
                        </span>
                        <ChevronsUpDown data-icon="inline-end" className="text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 max-h-64 overflow-y-auto">
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => setCategoryFilter(null)} className="justify-between">
                                <span>All categories</span>
                                {!categoryFilter && <Check data-icon="inline-end" className="text-primary" />}
                            </DropdownMenuItem>
                            {categories.map((c) => (
                                <DropdownMenuItem
                                    key={c.id}
                                    onClick={() => setCategoryFilter(c.id)}
                                    className="justify-between"
                                >
                                    <span className="flex items-center gap-2 min-w-0">
                                        {c.color && (
                                            <span
                                                className="size-2 rounded-full shrink-0"
                                                style={{ backgroundColor: c.color }}
                                            />
                                        )}
                                        <span className="truncate">{c.name}</span>
                                    </span>
                                    {categoryFilter === c.id && (
                                        <Check data-icon="inline-end" className="text-primary" />
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                {(taskFilter || categoryFilter) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setTaskFilter(null);
                            setCategoryFilter(null);
                        }}
                        className="h-6.5 text-xs rounded-full px-2.5 shrink-0 font-normal text-muted-foreground hover:text-foreground"
                    >
                        Clear
                    </Button>
                )}
            </div>

            {/* List */}
            {isLoading ? (
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                </div>
            ) : filtered.length === 0 ? (
                <Empty className="py-10 border border-dashed rounded-xl bg-card/50">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <HistoryIcon />
                        </EmptyMedia>
                        <EmptyTitle className="text-xs">No history yet</EmptyTitle>
                        <EmptyDescription className="text-[11px] max-w-xs">
                            Completed and skipped tasks will show up here.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <div className="border border-border/80 rounded-xl bg-card overflow-hidden divide-y divide-border/50 shadow-2xs">
                    {filtered.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between gap-2 px-3.5 py-2.5">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <span
                                    className={cn(
                                        "size-6 rounded-full flex items-center justify-center shrink-0",
                                        entry.isSkip ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary",
                                    )}
                                >
                                    {entry.isSkip ? (
                                        <SkipForward className="size-3.5" />
                                    ) : (
                                        <CheckCircle2 className="size-3.5" />
                                    )}
                                </span>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-medium text-foreground truncate">
                                        {entry.taskTitle}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground">
                                        {formatHistoryDate(entry.completedAt)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                                {entry.category && (
                                    <Badge
                                        variant="secondary"
                                        className="text-[10px] font-normal px-1.5 h-4.5 text-muted-foreground rounded-full gap-1"
                                    >
                                        {entry.category.color && (
                                            <span
                                                className="size-1.5 rounded-full shrink-0"
                                                style={{ backgroundColor: entry.category.color }}
                                            />
                                        )}
                                        <span className="truncate max-w-[70px]">{entry.category.name}</span>
                                    </Badge>
                                )}
                                {!entry.isSkip && entry.cycleNumber != null && (
                                    <Badge
                                        variant="secondary"
                                        className="text-[10px] font-normal px-1.5 h-4.5 text-muted-foreground rounded-full font-mono"
                                    >
                                        #{entry.cycleNumber}
                                    </Badge>
                                )}
                                {entry.isSkip && (
                                    <Badge
                                        variant="outline"
                                        className="text-[10px] font-normal px-1.5 h-4.5 text-muted-foreground rounded-full border-dashed"
                                    >
                                        Skipped
                                    </Badge>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
