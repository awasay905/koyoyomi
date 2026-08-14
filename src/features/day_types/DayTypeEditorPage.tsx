import { useMemo, useState } from "react";
import { useParams, Link } from "@tanstack/react-router";
import { ChevronLeft, Plus, CalendarClock, Pencil, Clock } from "lucide-react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";

import type { ScheduleBlock } from "./types";
import { useDayTypeQuery, useScheduleBlocksQuery, useDeleteScheduleBlock, useReorderScheduleBlocks } from "./hooks";
import { BlockRow } from "./BlockRow";
import { BlockFormDialog } from "./BlockFormDialog";
import { ReferenceTimesDialog } from "./ReferenceTimesDialog";
import { AddDayTypeDialog } from "./AddDayTypeDialog";

export function DayTypeEditorPage() {
    const { dayTypeId } = useParams({ from: "/_authenticated/settings/day_types/$dayTypeId" });

    const { data: dayType, isLoading: isDayTypeLoading } = useDayTypeQuery(dayTypeId);
    const { data: blocks = [], isLoading: isBlocksLoading } = useScheduleBlocksQuery(dayTypeId);
    const deleteBlock = useDeleteScheduleBlock(dayTypeId);
    const reorderBlocks = useReorderScheduleBlocks(dayTypeId);

    const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
    const [blockToEdit, setBlockToEdit] = useState<ScheduleBlock | null>(null);
    const [isRenameOpen, setIsRenameOpen] = useState(false);
    const [isReferenceOpen, setIsReferenceOpen] = useState(false);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
    const sortedIds = useMemo(() => blocks.map((b) => b.id), [blocks]);

    // Calculate the last block's end time for smart auto-fill
    const lastEndTime = useMemo(() => {
        if (blocks.length === 0) return "08:00";
        return blocks[blocks.length - 1].end_time.slice(0, 5);
    }, [blocks]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = sortedIds.indexOf(String(active.id));
        const newIndex = sortedIds.indexOf(String(over.id));
        if (oldIndex === -1 || newIndex === -1) return;

        reorderBlocks.mutate(arrayMove(sortedIds, oldIndex, newIndex));
    };

    const handleOpenCreateBlock = () => {
        setBlockToEdit(null);
        setIsBlockDialogOpen(true);
    };

    const handleOpenEditBlock = (block: ScheduleBlock) => {
        setBlockToEdit(block);
        setIsBlockDialogOpen(true);
    };

    if (isDayTypeLoading) {
        return (
            <div className="mx-auto flex max-w-lg flex-col gap-8 px-4 py-8 pb-28">
                <div className="flex items-center gap-3">
                    <Skeleton className="size-9 rounded-md" />
                    <div className="flex flex-col gap-2 flex-1">
                        <Skeleton className="h-5 w-40 rounded-md" />
                        <Skeleton className="h-3.5 w-64 rounded-md" />
                    </div>
                </div>
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        );
    }

    if (!dayType) {
        return (
            <div className="mx-auto flex max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center">
                <p className="text-sm text-muted-foreground">Template schedule not found.</p>
                <Link
                    to="/settings/day_types"
                    className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-border/80 bg-background px-3 py-2 hover:bg-accent transition-colors"
                >
                    Back to Day Templates
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto flex max-w-lg flex-col gap-8 px-4 py-8 pb-28">
            {/* Header */}
            <header className="flex items-start min-w-0">
                <div className="flex items-start gap-2 min-w-0 w-full">
                    <Link
                        to="/settings/day_types"
                        className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0 -ml-2 -mt-1"
                        aria-label="Back to Day Templates"
                    >
                        <ChevronLeft />
                    </Link>

                    <div className="flex flex-col w-full min-w-0">
                        <div className="flex items-center justify-between gap-2 min-w-0 w-full">
                            <div className="flex items-center gap-2 min-w-0">
                                <span
                                    className="size-3 rounded-full shrink-0 ring-1 ring-border/50"
                                    style={{ backgroundColor: dayType.color ?? undefined }}
                                />
                                <h1 className="text-xl font-bold tracking-tight truncate leading-none">
                                    {dayType.name}
                                </h1>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 text-muted-foreground hover:text-foreground shrink-0"
                                    onClick={() => setIsRenameOpen(true)}
                                    aria-label="Rename template"
                                >
                                    <Pencil />
                                </Button>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-8 text-muted-foreground hover:text-foreground shrink-0"
                                    onClick={() => setIsReferenceOpen(true)}
                                    aria-label="View reference prayer times"
                                >
                                    <Clock />
                                </Button>
                                <Button size="sm" onClick={handleOpenCreateBlock} className="shrink-0">
                                    <Plus data-icon="inline-start" />
                                    <span>Add</span>
                                </Button>
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground truncate mt-1.5">
                            {blocks.length} {blocks.length === 1 ? "block" : "blocks"} scheduled
                        </p>
                    </div>
                </div>
            </header>

            {/* Timeline Blocks Section */}
            <section className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Schedule Timeline
                    </h2>
                </div>

                {isBlocksLoading ? (
                    <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
                        <CardContent className="p-0 flex flex-col gap-0">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex flex-col">
                                    <div className="p-3 px-4 flex items-center justify-between">
                                        <Skeleton className="h-4 w-32 rounded-md" />
                                        <Skeleton className="h-4 w-16 rounded-md" />
                                    </div>
                                    {i < 3 && <div className="h-px bg-border/50 mx-4" />}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ) : blocks.length === 0 ? (
                    <Empty className="py-12 border border-dashed border-border/80 rounded-xl bg-card/40">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <CalendarClock />
                            </EmptyMedia>
                            <EmptyTitle>No blocks scheduled</EmptyTitle>
                            <EmptyDescription className="max-w-[260px]">
                                Add routine blocks like &quot;Morning Deep Work&quot; or &quot;Commute&quot; to build
                                this day.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Button size="sm" variant="outline" onClick={handleOpenCreateBlock}>
                                <Plus data-icon="inline-start" />
                                <span>Add First Block</span>
                            </Button>
                        </EmptyContent>
                    </Empty>
                ) : (
                    <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
                        <CardContent className="p-0 flex flex-col gap-0">
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
                                    {blocks.map((block, index) => (
                                        <BlockRow
                                            key={block.id}
                                            block={block}
                                            onEdit={handleOpenEditBlock}
                                            onDelete={(id) => deleteBlock.mutate(id)}
                                            showDivider={index < blocks.length - 1}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        </CardContent>
                    </Card>
                )}
            </section>

            {/* Modals & Dialogs */}
            <BlockFormDialog
                open={isBlockDialogOpen}
                onOpenChange={setIsBlockDialogOpen}
                dayTypeId={dayTypeId}
                blockToEdit={blockToEdit}
                existingCount={blocks.length}
                defaultStartTime={lastEndTime}
            />

            <ReferenceTimesDialog open={isReferenceOpen} onOpenChange={setIsReferenceOpen} />

            <AddDayTypeDialog open={isRenameOpen} onOpenChange={setIsRenameOpen} dayTypeToEdit={dayType} />
        </div>
    );
}
