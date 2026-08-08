import { useMemo, useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus, CalendarClock, Pencil } from "lucide-react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";

import type { ScheduleBlock } from "./types";
import { useDayTypeQuery, useScheduleBlocksQuery, useDeleteScheduleBlock, useReorderScheduleBlocks } from "./hooks";
import { BlockRow } from "./BlockRow";
import { BlockFormDialog } from "./BlockFormDialog";
import { ReferencePanel } from "./ReferencePanel";
import { AddDayTypeDialog } from "./AddDayTypeDialog";

export function DayTypeEditorPage() {
    const { dayTypeId } = useParams({ from: "/_authenticated/settings/day_types/$dayTypeId" });
    const navigate = useNavigate();

    const { data: dayType, isLoading: isDayTypeLoading } = useDayTypeQuery(dayTypeId);
    const { data: blocks = [], isLoading: isBlocksLoading } = useScheduleBlocksQuery(dayTypeId);
    const deleteBlock = useDeleteScheduleBlock(dayTypeId);
    const reorderBlocks = useReorderScheduleBlocks(dayTypeId);

    const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
    const [blockToEdit, setBlockToEdit] = useState<ScheduleBlock | null>(null);
    const [isRenameOpen, setIsRenameOpen] = useState(false);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
    const sortedIds = useMemo(() => blocks.map((b) => b.id), [blocks]);

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
            <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-4">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-40 w-full rounded-xl" />
            </div>
        );
    }

    if (!dayType) {
        return (
            <div className="max-w-xl mx-auto px-4 py-10 text-center">
                <p className="text-sm text-muted-foreground">Day-type not found.</p>
                <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => navigate({ to: "/settings/day_types" })}
                >
                    Back to Day-Types
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-5 flex flex-col gap-4 pb-28">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-foreground -ml-1"
                    onClick={() => navigate({ to: "/settings/day_types" })}
                    aria-label="Back to day-types"
                >
                    <ArrowLeft />
                </Button>

                <span
                    className="size-3 rounded-full shrink-0 ring-1 ring-border/50"
                    style={{ backgroundColor: dayType.color ?? undefined }}
                />
                <h1 className="text-lg font-bold tracking-tight truncate flex-1">{dayType.name}</h1>

                <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-foreground"
                    onClick={() => setIsRenameOpen(true)}
                    aria-label="Rename or recolour day-type"
                >
                    <Pencil />
                </Button>
            </div>

            <div className="flex flex-col gap-4 md:grid md:grid-cols-[1fr_300px] md:gap-5 md:items-start">
                {/* Blocks list */}
                <div className="flex flex-col gap-3 order-2 md:order-1">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Blocks</h2>
                        <Button
                            size="sm"
                            onClick={handleOpenCreateBlock}
                            className="h-7 px-2.5 text-xs font-medium gap-1.5"
                        >
                            <Plus data-icon="inline-start" />
                            <span>Add block</span>
                        </Button>
                    </div>

                    {isBlocksLoading ? (
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-12 w-full rounded-xl" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                        </div>
                    ) : blocks.length === 0 ? (
                        <Empty className="py-10 border border-dashed rounded-xl bg-card/50">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <CalendarClock />
                                </EmptyMedia>
                                <EmptyTitle className="text-xs">No blocks yet</EmptyTitle>
                                <EmptyDescription className="text-[11px] max-w-xs">
                                    Add your first block — like &quot;Wake up&quot; or &quot;Work block 1&quot; — to
                                    start building this template.
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleOpenCreateBlock}
                                    className="h-7 text-xs"
                                >
                                    <Plus data-icon="inline-start" />
                                    <span>Add block</span>
                                </Button>
                            </EmptyContent>
                        </Empty>
                    ) : (
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
                                <div className="border border-border/80 rounded-xl bg-card overflow-hidden divide-y divide-border/50 shadow-2xs">
                                    {blocks.map((block) => (
                                        <BlockRow
                                            key={block.id}
                                            block={block}
                                            onEdit={handleOpenEditBlock}
                                            onDelete={(id) => deleteBlock.mutate(id)}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                </div>

                {/* Reference panel */}
                <div className="order-1 md:order-2">
                    <ReferencePanel />
                </div>
            </div>

            <BlockFormDialog
                open={isBlockDialogOpen}
                onOpenChange={setIsBlockDialogOpen}
                dayTypeId={dayTypeId}
                blockToEdit={blockToEdit}
                existingCount={blocks.length}
            />

            <AddDayTypeDialog open={isRenameOpen} onOpenChange={setIsRenameOpen} dayTypeToEdit={dayType} />
        </div>
    );
}
