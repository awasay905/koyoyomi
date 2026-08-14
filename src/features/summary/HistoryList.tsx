import { useMemo, useState } from "react";
import { CheckCircle2, SkipForward, History as HistoryIcon, ChevronsUpDown, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTasksQuery, useTaskCategoriesQuery } from "@/features/tasks/hooks";
import { useCompletionHistory } from "./hooks";
import type { HistoryEntry } from "./types";

interface HistoryGroup {
    key: string;
    title: string;
    items: HistoryEntry[];
}

function formatGroupDate(iso: string): { key: string; title: string } {
    const date = new Date(iso);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

    if (isToday) return { key, title: "Today" };
    if (isYesterday) return { key, title: "Yesterday" };

    return {
        key,
        title: date.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
        }),
    };
}

export function HistoryList() {
    const { data: entries = [], isLoading } = useCompletionHistory();
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

    // Grouping by Date
    const groupedHistory = useMemo(() => {
        const groupsMap = new Map<string, HistoryGroup>();

        for (const entry of filtered) {
            const { key, title } = formatGroupDate(entry.completedAt);
            if (!groupsMap.has(key)) {
                groupsMap.set(key, { key, title, items: [] });
            }
            groupsMap.get(key)!.items.push(entry);
        }

        return Array.from(groupsMap.values());
    }, [filtered]);

    return (
        <div className="flex flex-col gap-6">
            {/* Filter Bar */}
            <div className="flex items-center gap-2 flex-wrap">
                {/* Task Filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button variant="outline" size="sm" className="h-8 text-xs font-normal gap-1.5 shrink-0" />
                        }
                    >
                        <span className="truncate max-w-[120px]">{selectedTask?.title ?? "All Tasks"}</span>
                        <ChevronsUpDown data-icon="inline-end" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 max-h-64 overflow-y-auto">
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => setTaskFilter(null)} className="justify-between">
                                <span>All Tasks</span>
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

                {/* Category Filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button variant="outline" size="sm" className="h-8 text-xs font-normal gap-1.5 shrink-0" />
                        }
                    >
                        <span className="flex items-center gap-1.5 truncate max-w-[120px]">
                            {selectedCategory?.color && (
                                <span
                                    className="size-2 rounded-full shrink-0"
                                    style={{ backgroundColor: selectedCategory.color }}
                                />
                            )}
                            <span className="truncate">{selectedCategory?.name ?? "All Categories"}</span>
                        </span>
                        <ChevronsUpDown data-icon="inline-end" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 max-h-64 overflow-y-auto">
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => setCategoryFilter(null)} className="justify-between">
                                <span>All Categories</span>
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

                {/* Clear Active Filters */}
                {(taskFilter || categoryFilter) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setTaskFilter(null);
                            setCategoryFilter(null);
                        }}
                        className="h-8 text-xs px-2 text-muted-foreground hover:text-foreground"
                    >
                        <X data-icon="inline-start" />
                        <span>Reset</span>
                    </Button>
                )}
            </div>

            {/* List Content */}
            {isLoading ? (
                <section className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-20 rounded-md ml-1" />
                    <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
                        <CardContent className="p-0 flex flex-col gap-0">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="p-3.5 px-4 flex items-center justify-between">
                                    <Skeleton className="h-4 w-32 rounded-md" />
                                    <Skeleton className="h-4 w-12 rounded-md" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </section>
            ) : filtered.length === 0 ? (
                <Empty className="py-12 border border-dashed border-border/80 rounded-xl bg-card/40">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <HistoryIcon />
                        </EmptyMedia>
                        <EmptyTitle>No history records</EmptyTitle>
                        <EmptyDescription className="max-w-[240px]">
                            Completed or skipped tasks will appear chronologically here.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                groupedHistory.map((group) => (
                    <section key={group.key} className="flex flex-col gap-2">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                            {group.title}
                        </h2>

                        <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
                            <CardContent className="p-0 flex flex-col gap-0">
                                {group.items.map((entry, index) => (
                                    <div key={entry.id} className="flex flex-col">
                                        <div className="group flex items-center justify-between p-3 px-4 hover:bg-accent/40 transition-colors">
                                            {/* Status Icon & Title */}
                                            <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                                                {entry.isSkip ? (
                                                    <SkipForward className="size-4 text-muted-foreground shrink-0" />
                                                ) : (
                                                    <CheckCircle2 className="size-4 text-primary shrink-0" />
                                                )}

                                                <span className="text-sm font-medium text-foreground truncate leading-tight">
                                                    {entry.taskTitle}
                                                </span>

                                                {entry.category && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-[10px] font-normal px-1.5 h-4.5 text-muted-foreground shrink-0 rounded-full gap-1"
                                                    >
                                                        {entry.category.color && (
                                                            <span
                                                                className="size-1.5 rounded-full shrink-0"
                                                                style={{ backgroundColor: entry.category.color }}
                                                            />
                                                        )}
                                                        <span className="truncate max-w-[80px]">
                                                            {entry.category.name}
                                                        </span>
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Cycle or Status Pill */}
                                            <div className="flex items-center shrink-0">
                                                {!entry.isSkip && entry.cycleNumber != null ? (
                                                    <span className="font-mono text-xs text-muted-foreground tabular-nums">
                                                        #{entry.cycleNumber}
                                                    </span>
                                                ) : entry.isSkip ? (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-[10px] font-normal px-1.5 h-4 text-muted-foreground rounded-full"
                                                    >
                                                        Skipped
                                                    </Badge>
                                                ) : null}
                                            </div>
                                        </div>

                                        {index < group.items.length - 1 && <div className="h-px bg-border/50 mx-4" />}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </section>
                ))
            )}
        </div>
    );
}
