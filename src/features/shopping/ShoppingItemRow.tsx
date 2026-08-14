import * as React from "react";
import { Trash2, MoreHorizontal, Bookmark, BookmarkCheck, Pencil } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import type { ShoppingItem } from "./types";
import { useMarkItemBought, useToggleFrequent, useDeleteShoppingItem } from "./hooks";

interface ShoppingItemRowProps {
    item: ShoppingItem;
    onEdit: (item: ShoppingItem) => void;
    showDivider?: boolean;
}

export function ShoppingItemRow({ item, onEdit, showDivider = true }: ShoppingItemRowProps) {
    const markBought = useMarkItemBought();
    const toggleFrequent = useToggleFrequent();
    const deleteItem = useDeleteShoppingItem();

    const isBought = item.status === "bought";

    return (
        <div className="flex flex-col">
            <div
                className={cn(
                    "group flex items-center justify-between gap-3 p-3.5 px-4 transition-colors hover:bg-accent/40",
                    isBought && "opacity-50",
                )}
            >
                {/* Left: Checkbox + Name + Quantity */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Checkbox
                        checked={isBought}
                        onCheckedChange={(checked) => markBought.mutate({ id: item.id, bought: Boolean(checked) })}
                        aria-label={`Mark ${item.name} as ${isBought ? "pending" : "bought"}`}
                        className="size-4 shrink-0"
                    />

                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span
                            className={cn(
                                "text-sm truncate leading-tight",
                                isBought
                                    ? "line-through text-muted-foreground font-normal"
                                    : "font-medium text-foreground",
                            )}
                        >
                            {item.name}
                        </span>

                        {item.quantity && (
                            <span className="text-xs font-mono text-muted-foreground shrink-0">{item.quantity}</span>
                        )}

                        {item.is_frequent && !isBought && (
                            <span className="size-1.5 rounded-full bg-primary/70 shrink-0" title="Frequent item" />
                        )}
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 shrink-0">
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-muted-foreground hover:text-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                    aria-label={`Options for ${item.name}`}
                                >
                                    <MoreHorizontal />
                                </Button>
                            }
                        />
                        <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuGroup>
                                <DropdownMenuItem onClick={() => onEdit(item)}>
                                    <Pencil data-icon="inline-start" />
                                    <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => toggleFrequent.mutate({ id: item.id, frequent: !item.is_frequent })}
                                >
                                    {item.is_frequent ? (
                                        <>
                                            <BookmarkCheck data-icon="inline-start" />
                                            <span>Unpin frequent</span>
                                        </>
                                    ) : (
                                        <>
                                            <Bookmark data-icon="inline-start" />
                                            <span>Pin as frequent</span>
                                        </>
                                    )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => deleteItem.mutate(item.id)}
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
