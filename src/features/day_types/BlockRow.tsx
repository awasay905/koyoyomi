import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, StickyNote, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import type { ScheduleBlock } from "./types";
import { blockDurationMinutes } from "./utils";

interface BlockRowProps {
    block: ScheduleBlock;
    onEdit: (block: ScheduleBlock) => void;
    onDelete: (id: string) => void;
    showDivider?: boolean;
}

export function BlockRow({ block, onEdit, onDelete, showDivider }: BlockRowProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const isFixed = block.block_type === "fixed";
    const duration = blockDurationMinutes(block);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn("flex flex-col", isDragging && "z-20 opacity-60 bg-muted/40")}
        >
            <div className="group flex items-center justify-between px-3 py-2.5 hover:bg-accent/40 transition-colors">
                {/* Drag Handle */}
                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    className="text-muted-foreground/40 hover:text-foreground cursor-grab active:cursor-grabbing shrink-0 touch-none p-1 -ml-1 rounded-md transition-colors"
                    aria-label="Drag to reorder"
                >
                    <GripVertical className="size-4" />
                </button>

                {/* Left: Time Stamp */}
                <div className="flex flex-col items-start w-13 shrink-0 ml-1 font-mono tabular-nums">
                    <span className="text-xs font-semibold text-foreground leading-tight">
                        {block.start_time.slice(0, 5)}
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-tight">
                        {block.end_time.slice(0, 5)}
                    </span>
                </div>

                {/* Middle: Title & Badges */}
                <div className="flex items-center gap-2 min-w-0 flex-1 px-2">
                    <span
                        className={cn(
                            "size-2 rounded-full shrink-0",
                            isFixed ? "bg-muted-foreground/60" : "bg-primary",
                        )}
                        title={isFixed ? "Fixed block" : "Free block"}
                    />

                    <span className="text-sm font-medium text-foreground truncate leading-tight">{block.title}</span>

                    <span className="text-[11px] font-mono text-muted-foreground/80 shrink-0">{duration}m</span>

                    {block.notes && (
                        <StickyNote className="size-3 text-muted-foreground shrink-0" aria-label="Has notes" />
                    )}
                </div>

                {/* Right: Actions Menu */}
                <div className="flex items-center shrink-0">
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-muted-foreground hover:text-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                    aria-label={`Options for ${block.title}`}
                                />
                            }
                        >
                            <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuGroup>
                                <DropdownMenuItem onClick={() => onEdit(block)}>
                                    <Pencil data-icon="inline-start" />
                                    <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => onDelete(block.id)}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <Trash2 data-icon="inline-start" />
                                    <span>Delete</span>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {showDivider && <div className="h-px bg-border/50 mx-4" />}
        </div>
    );
}
