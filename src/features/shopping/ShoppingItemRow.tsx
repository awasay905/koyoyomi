import { useState } from "react";
import { Trash2, MoreHorizontal, Bookmark, Pencil, Check, X, Plus, Minus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ShoppingItem } from "./types";
import { useMarkItemBought, useToggleFrequent, useDeleteShoppingItem, useUpdateShoppingItem } from "./hooks";

interface ShoppingItemRowProps {
    item: ShoppingItem;
}

export function ShoppingItemRow({ item }: ShoppingItemRowProps) {
    const markBought = useMarkItemBought();
    const toggleFrequent = useToggleFrequent();
    const deleteItem = useDeleteShoppingItem();
    const updateItem = useUpdateShoppingItem();

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(item.name);
    const [quantity, setQuantity] = useState(item.quantity ?? "");

    const isBought = item.status === "bought";

    const handleStartEdit = () => {
        setName(item.name);
        setQuantity(item.quantity ?? "");
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    const handleSave = (e?: React.FormEvent) => {
        e?.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName) return;

        const trimmedQuantity = quantity.trim();

        updateItem.mutate(
            {
                id: item.id,
                name: trimmedName,
                quantity: trimmedQuantity ? trimmedQuantity : null,
            },
            {
                onSuccess: () => setIsEditing(false),
            },
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            handleCancelEdit();
        }
    };

    const handleIncrement = () => {
        const parsed = parseInt(quantity || "0", 10);
        setQuantity(String(isNaN(parsed) ? 1 : parsed + 1));
    };

    const handleDecrement = () => {
        const parsed = parseInt(quantity || "1", 10);
        if (!isNaN(parsed) && parsed > 1) {
            setQuantity(String(parsed - 1));
        } else {
            setQuantity("");
        }
    };

    // Edit Mode View
    if (isEditing) {
        return (
            <form onSubmit={handleSave} className="flex items-center gap-2 px-3 py-2 bg-muted/30 transition-colors">
                {/* Item Name Input */}
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Item name"
                    className="h-8 text-xs flex-1 min-w-0"
                    autoFocus
                    maxLength={100}
                />

                {/* Stepper / Quantity Control */}
                <div className="flex items-center h-8 rounded-md border border-input bg-transparent shrink-0 focus-within:ring-1 focus-within:ring-ring">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-none text-muted-foreground hover:text-foreground"
                        onClick={handleDecrement}
                        aria-label="Decrease quantity"
                    >
                        <Minus />
                    </Button>
                    <Input
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="1"
                        maxLength={3}
                        className="h-full w-9 border-0 p-0 text-center text-xs bg-transparent shadow-none rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-none text-muted-foreground hover:text-foreground"
                        onClick={handleIncrement}
                        aria-label="Increase quantity"
                    >
                        <Plus />
                    </Button>
                </div>
                {/* Save & Cancel Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                    <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        className="size-7 text-primary hover:text-primary hover:bg-primary/10"
                        disabled={!name.trim() || updateItem.isPending}
                        aria-label="Save changes"
                    >
                        <Check />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-foreground"
                        onClick={handleCancelEdit}
                        aria-label="Cancel editing"
                    >
                        <X />
                    </Button>
                </div>
            </form>
        );
    }

    // Default View
    return (
        <div
            className={cn(
                "group flex items-center justify-between px-3 py-2.5 transition-colors duration-150 hover:bg-muted/40 select-none",
                isBought && "opacity-50 hover:bg-transparent",
            )}
        >
            {/* Left: Checkbox & Name */}
            <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                <Checkbox
                    checked={isBought}
                    onCheckedChange={(checked) => markBought.mutate({ id: item.id, bought: Boolean(checked) })}
                    aria-label={`Mark ${item.name} as ${isBought ? "pending" : "bought"}`}
                    className="size-4.5 rounded transition-transform active:scale-95 shrink-0"
                />

                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span
                        className={cn(
                            "text-xs font-medium transition-colors truncate",
                            isBought ? "line-through text-muted-foreground font-normal" : "text-foreground",
                        )}
                    >
                        {item.name}
                    </span>

                    {item.quantity && (
                        <Badge
                            variant="secondary"
                            className="text-[10px] font-normal px-1.5 h-4.5 text-muted-foreground shrink-0 rounded-full"
                        >
                            {item.quantity}
                        </Badge>
                    )}

                    {item.is_frequent && !isBought && (
                        <span className="size-1.5 rounded-full bg-primary/60 shrink-0" title="Regular item" />
                    )}
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 shrink-0 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 text-muted-foreground hover:text-foreground"
                                aria-label="More options"
                            />
                        }
                    >
                        <MoreHorizontal />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={handleStartEdit}>
                                <Pencil data-icon="inline-start" />
                                Edit item
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => toggleFrequent.mutate({ id: item.id, frequent: !item.is_frequent })}
                            >
                                <Bookmark data-icon="inline-start" />
                                {item.is_frequent ? "Unpin regular" : "Pin as regular"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => deleteItem.mutate(item.id)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 data-icon="inline-start" />
                                Delete item
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${item.name}`}
                    onClick={() => deleteItem.mutate(item.id)}
                    className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hidden sm:inline-flex"
                >
                    <Trash2 />
                </Button>
            </div>
        </div>
    );
}
