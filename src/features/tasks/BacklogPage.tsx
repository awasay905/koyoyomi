import { useState, useMemo } from "react";
import { Plus, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";
import { useNow } from "@/hooks/useNow";

import type { Task } from "./types";
import { useTasksQuery, useTaskCategoriesQuery, useTaskCompletionsQuery } from "./hooks";
import { computeRecurringState } from "./recurrence";
import { TaskRow } from "./TaskRow";
import { AddTaskDialog } from "./AddTaskDialog";

import { usePendingAssignmentsQuery } from "@/features/task_assignments/hooks";
import { AssignToDayDialog } from "@/features/task_assignments/AssignToDayDialog";

type QuickFilter = "all" | "unassigned" | "overdue" | "due_soon";

export function BacklogPage() {
    const { data: tasks = [], isLoading: isTasksLoading } = useTasksQuery();
    const { data: completions = [] } = useTaskCompletionsQuery();
    const { data: categories = [] } = useTaskCategoriesQuery();
    const { data: pendingAssignments = [], isLoading: isAssignmentsLoading } = usePendingAssignmentsQuery();
    const now = useNow();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [taskToAssign, setTaskToAssign] = useState<Task | null>(null);

    const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [hiddenTaskIds, setHiddenTaskIds] = useState<Set<string>>(new Set());

    const isLoading = isTasksLoading || isAssignmentsLoading;

    const handleTaskCompleted = (taskId: string) => {
        setTimeout(() => {
            setHiddenTaskIds((prev) => new Set(prev).add(taskId));
        }, 3500);
    };

    const { rows, activeCount, overdueCount, unassignedCount } = useMemo(() => {
        const next48h = now + 48 * 60 * 60 * 1000;
        const assignedTaskIds = new Set(pendingAssignments.map((a) => a.task_id));

        const withDueInfo = tasks
            .filter((t) => !hiddenTaskIds.has(t.id))
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
        let unassignedC = 0;

        withDueInfo.forEach((r) => {
            if (r.dueAt && r.dueAt.getTime() < now) ovCount++;
            if (!assignedTaskIds.has(r.task.id)) unassignedC++;
        });

        const filtered = withDueInfo.filter((r) => {
            if (selectedCategory) return r.task.category_id === selectedCategory;

            if (quickFilter === "overdue") return Boolean(r.dueAt && r.dueAt.getTime() < now);
            if (quickFilter === "due_soon") {
                if (!r.dueAt) return false;
                const t = r.dueAt.getTime();
                return t >= now && t <= next48h;
            }
            if (quickFilter === "unassigned") {
                return !assignedTaskIds.has(r.task.id);
            }
            return true;
        });

        const sorted = filtered.sort((a, b) => {
            if (!a.dueAt && !b.dueAt) return 0;
            if (!a.dueAt) return 1;
            if (!b.dueAt) return -1;
            return a.dueAt.getTime() - b.dueAt.getTime();
        });

        return { rows: sorted, activeCount: withDueInfo.length, overdueCount: ovCount, unassignedCount: unassignedC };
    }, [tasks, completions, pendingAssignments, quickFilter, selectedCategory, now, hiddenTaskIds]);

    const handleOpenCreate = () => {
        setTaskToEdit(null);
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (task: Task) => {
        setTaskToEdit(task);
        setIsDialogOpen(true);
    };

    const handleOpenAssign = (task: Task) => {
        setTaskToAssign(task);
    };

    return (
        <div className="mx-auto flex max-w-lg flex-col gap-8 px-4 py-8 pb-28">
            {/* Page Header */}
            <header className="flex items-start justify-between gap-4 min-w-0">
                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold tracking-tight truncate leading-none">Backlog</h1>
                        {activeCount > 0 && (
                            <Badge variant="secondary" className="rounded-md px-1.5 py-0 text-[11px] font-mono h-5">
                                {activeCount}
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1.5">
                        Prioritize, schedule, and organize pending items.
                    </p>
                </div>

                <Button size="sm" onClick={handleOpenCreate} className="shrink-0">
                    <Plus data-icon="inline-start" />
                    <span>New Task</span>
                </Button>
            </header>

            {/* Filter Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mt-2 scrollbar-none">
                <Button
                    variant={quickFilter === "all" && selectedCategory === null ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => {
                        setQuickFilter("all");
                        setSelectedCategory(null);
                    }}
                    className="h-7 text-xs px-2.5 shrink-0"
                >
                    All
                </Button>

                <Button
                    variant={quickFilter === "unassigned" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => {
                        setQuickFilter("unassigned");
                        setSelectedCategory(null);
                    }}
                    className="h-7 text-xs px-2.5 shrink-0 gap-1.5"
                >
                    <span>Unassigned</span>
                    {unassignedCount > 0 && (
                        <span className="text-[10px] font-mono text-muted-foreground">{unassignedCount}</span>
                    )}
                </Button>

                <Button
                    variant={quickFilter === "overdue" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => {
                        setQuickFilter("overdue");
                        setSelectedCategory(null);
                    }}
                    className="h-7 text-xs px-2.5 shrink-0 gap-1.5"
                >
                    <span>Overdue</span>
                    {overdueCount > 0 && <span className="text-[10px] font-mono text-destructive">{overdueCount}</span>}
                </Button>

                <Button
                    variant={quickFilter === "due_soon" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => {
                        setQuickFilter("due_soon");
                        setSelectedCategory(null);
                    }}
                    className="h-7 text-xs px-2.5 shrink-0"
                >
                    Due soon
                </Button>

                {categories.length > 0 && <div className="h-4 w-px bg-border/60 shrink-0 mx-1" />}

                {categories.map((cat) => (
                    <Button
                        key={cat.id}
                        variant={selectedCategory === cat.id ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => {
                            setSelectedCategory(selectedCategory === cat.id ? null : cat.id);
                            setQuickFilter("all");
                        }}
                        className="h-7 text-xs px-2.5 shrink-0 gap-1.5"
                    >
                        {cat.color && (
                            <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        )}
                        <span>{cat.name}</span>
                    </Button>
                ))}
            </div>

            {/* Content Section */}
            <section className="flex flex-col gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                    Pending Tasks
                </h2>

                {isLoading ? (
                    <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
                        <CardContent className="p-0 flex flex-col gap-0">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex flex-col">
                                    <div className="flex items-center justify-between p-3.5 px-4 h-14">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="size-4 rounded-md" />
                                            <div className="flex flex-col gap-1.5">
                                                <Skeleton className="h-3.5 w-32 rounded-md" />
                                                <Skeleton className="h-2.5 w-20 rounded-md" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-4 w-12 rounded-md" />
                                    </div>
                                    {i < 3 && <div className="h-px bg-border/50 mx-4" />}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ) : rows.length === 0 ? (
                    <Empty className="py-12 border border-dashed border-border/80 rounded-xl bg-card/40">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <CheckCircle2 />
                            </EmptyMedia>
                            <EmptyTitle>No pending tasks</EmptyTitle>
                            <EmptyDescription className="max-w-[260px]">
                                Your backlog is clear. Create a new task to organize future actions.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Button size="sm" variant="outline" onClick={handleOpenCreate}>
                                <Plus data-icon="inline-start" />
                                <span>Create Task</span>
                            </Button>
                        </EmptyContent>
                    </Empty>
                ) : (
                    <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
                        <CardContent className="p-0 flex flex-col gap-0">
                            {rows.map((r, index) => (
                                <TaskRow
                                    key={r.task.id}
                                    task={r.task}
                                    recurringState={r.recurringState}
                                    onEdit={handleOpenEdit}
                                    onAssign={handleOpenAssign}
                                    onCompleted={handleTaskCompleted}
                                    showDivider={index < rows.length - 1}
                                />
                            ))}
                        </CardContent>
                    </Card>
                )}
            </section>

            <AddTaskDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} taskToEdit={taskToEdit} />

            {taskToAssign && (
                <AssignToDayDialog
                    open={Boolean(taskToAssign)}
                    onOpenChange={(open) => {
                        if (!open) setTaskToAssign(null);
                    }}
                    task={taskToAssign}
                />
            )}
        </div>
    );
}
