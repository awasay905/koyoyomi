import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, StickyNote } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { ScheduleBlock } from "./types";
import { blockDurationMinutes } from "./utils";

interface BlockRowProps {
    block: ScheduleBlock;
    onEdit: (block: ScheduleBlock) => void;
    onDelete: (id: string) => void;
}

export function BlockRow({ block, onEdit, onDelete }: BlockRowProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group flex items-center gap-2 px-2 py-2.5 bg-card transition-colors",
                isDragging && "opacity-60 z-10 shadow-md rounded-lg",
            )}
        >
            <button
                type="button"
                {...attributes}
                {...listeners}
                className="text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing shrink-0 touch-none px-0.5"
                aria-label="Drag to reorder"
            >
                <GripVertical className="size-3.5" />
            </button>

            <div className="flex flex-col items-start w-14 shrink-0">
                <span className="text-[11px] font-mono font-semibold text-foreground tabular-nums">
                    {block.start_time.slice(0, 5)}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
                    {block.end_time.slice(0, 5)}
                </span>
            </div>

            <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                <span
                    className={cn(
                        "size-1.5 rounded-full shrink-0",
                        block.block_type === "fixed" ? "bg-muted-foreground/50" : "bg-primary",
                    )}
                    title={block.block_type === "fixed" ? "Fixed block" : "Free block"}
                />
                <span className="text-xs font-medium text-foreground truncate">{block.title}</span>

                <Badge
                    variant="secondary"
                    className="text-[10px] font-normal px-1.5 h-4.5 text-muted-foreground shrink-0 rounded-full"
                >
                    {block.block_type === "fixed" ? "Fixed" : "Free"}
                </Badge>

                <Badge
                    variant="secondary"
                    className="text-[10px] font-normal px-1.5 h-4.5 text-muted-foreground shrink-0 rounded-full"
                >
                    {blockDurationMinutes(block)}m
                </Badge>

                {block.notes && <StickyNote className="size-3 text-muted-foreground shrink-0" aria-label="Has notes" />}
            </div>

            <div className="flex items-center gap-1 shrink-0 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-foreground"
                    onClick={() => onEdit(block)}
                    aria-label={`Edit ${block.title}`}
                >
                    <Pencil />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(block.id)}
                    aria-label={`Delete ${block.title}`}
                >
                    <Trash2 />
                </Button>
            </div>
        </div>
    );
}
