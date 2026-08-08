import { useState, useMemo } from "react";
import { Plus, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";
import { useNow } from "@/hooks/useNow";

import type { Task } from "./types";
import { useTasksQuery, useTaskCategoriesQuery, useTaskCompletionsQuery } from "./hooks";
import { computeRecurringState } from "./recurrence";
import { TaskRow } from "./TaskRow";
import { AddTaskDialog } from "./AddTaskDialog";

type QuickFilter = "all" | "overdue" | "due_soon";

export function BacklogPage() {
    const { data: tasks = [], isLoading } = useTasksQuery();
    const { data: completions = [] } = useTaskCompletionsQuery();
    const { data: categories = [] } = useTaskCategoriesQuery();
    const now = useNow();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const { rows, activeCount, overdueCount } = useMemo(() => {
        const next48h = now + 48 * 60 * 60 * 1000;

        const withDueInfo = tasks
            .filter((t) => (t.type === "one_time" ? t.status === "active" : true))
            .map((t) => {
                if (t.type === "recurring") {
                    const state = computeRecurringState(t, completions, now);
                    return { task: t, dueAt: state.nextDue, recurringState: state, isFinished: state.isFinished };
                }
                return {
                    task: t,
                    dueAt: t.deadline ? new Date(t.deadline) : null,
                    recurringState: undefined,
                    isFinished: false,
                };
            })
            .filter((r) => !r.isFinished);

        let ovCount = 0;
        withDueInfo.forEach((r) => {
            if (r.dueAt && r.dueAt.getTime() < now) ovCount++;
        });

        const filtered = withDueInfo.filter((r) => {
            if (selectedCategory) return r.task.category_id === selectedCategory;

            if (quickFilter === "overdue") return Boolean(r.dueAt && r.dueAt.getTime() < now);
            if (quickFilter === "due_soon") {
                if (!r.dueAt) return false;
                const t = r.dueAt.getTime();
                return t >= now && t <= next48h;
            }
            return true;
        });

        const sorted = filtered.sort((a, b) => {
            if (!a.dueAt && !b.dueAt) return 0;
            if (!a.dueAt) return 1;
            if (!b.dueAt) return -1;
            return a.dueAt.getTime() - b.dueAt.getTime();
        });

        return { rows: sorted, activeCount: withDueInfo.length, overdueCount: ovCount };
    }, [tasks, completions, quickFilter, selectedCategory, now]);

    const handleOpenCreate = () => {
        setTaskToEdit(null);
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (task: Task) => {
        setTaskToEdit(task);
        setIsDialogOpen(true);
    };

    return (
        <div className="max-w-xl mx-auto px-4 py-5 flex flex-col gap-4 pb-28">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold tracking-tight">Backlog</h1>
                    <Badge variant="secondary" className="rounded-full px-2 text-xs font-medium">
                        {activeCount}
                    </Badge>
                </div>

                <Button size="sm" onClick={handleOpenCreate} className="h-8 px-2.5 text-xs font-medium gap-1.5">
                    <Plus data-icon="inline-start" />
                    <span>Add Task</span>
                </Button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <Button
                    variant={quickFilter === "all" && selectedCategory === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                        setQuickFilter("all");
                        setSelectedCategory(null);
                    }}
                    className="h-6.5 text-xs rounded-full px-3 shrink-0 font-normal"
                >
                    All
                </Button>

                <Button
                    variant={quickFilter === "overdue" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                        setQuickFilter("overdue");
                        setSelectedCategory(null);
                    }}
                    className="h-6.5 text-xs rounded-full px-3 shrink-0 gap-1.5 font-normal"
                >
                    <span>Overdue</span>
                    {overdueCount > 0 && (
                        <Badge variant="destructive" className="px-1 text-[10px] h-3.5 rounded-full font-normal">
                            {overdueCount}
                        </Badge>
                    )}
                </Button>

                <Button
                    variant={quickFilter === "due_soon" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                        setQuickFilter("due_soon");
                        setSelectedCategory(null);
                    }}
                    className="h-6.5 text-xs rounded-full px-3 shrink-0 font-normal"
                >
                    Due soon
                </Button>

                {categories.length > 0 && <div className="h-3.5 w-[1px] bg-border shrink-0 mx-0.5" />}

                {categories.map((cat) => (
                    <Button
                        key={cat.id}
                        variant={selectedCategory === cat.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                            setSelectedCategory(selectedCategory === cat.id ? null : cat.id);
                            setQuickFilter("all");
                        }}
                        className="h-6.5 text-xs rounded-full px-3 shrink-0 gap-1.5 font-normal"
                    >
                        {cat.color && (
                            <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        )}
                        <span>{cat.name}</span>
                    </Button>
                ))}
            </div>

            <div className="flex flex-col gap-4 pt-1">
                {isLoading ? (
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-16 w-full rounded-xl" />
                        <Skeleton className="h-16 w-full rounded-xl" />
                    </div>
                ) : rows.length === 0 ? (
                    <Empty className="py-10 border border-dashed rounded-xl bg-card/50">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <CheckCircle2 />
                            </EmptyMedia>
                            <EmptyTitle className="text-xs">Nothing on your plate</EmptyTitle>
                            <EmptyDescription className="text-[11px] max-w-xs">
                                You&apos;re all caught up! Add a new task to get started.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Button size="sm" variant="outline" onClick={handleOpenCreate} className="h-7 text-xs">
                                <Plus data-icon="inline-start" />
                                <span>Add a task</span>
                            </Button>
                        </EmptyContent>
                    </Empty>
                ) : (
                    <div className="border border-border/80 rounded-xl bg-card overflow-hidden divide-y divide-border/50 shadow-2xs">
                        {rows.map((r) => (
                            <TaskRow
                                key={r.task.id}
                                task={r.task}
                                recurringState={r.recurringState}
                                onEdit={handleOpenEdit}
                            />
                        ))}
                    </div>
                )}
            </div>

            <AddTaskDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} taskToEdit={taskToEdit} />
        </div>
    );
}
