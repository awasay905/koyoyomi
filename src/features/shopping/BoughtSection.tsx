import { useState } from "react";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ShoppingItem } from "./types";
import { ShoppingItemRow } from "./ShoppingItemRow";
import { useClearBought } from "./hooks";

interface BoughtSectionProps {
    items: ShoppingItem[];
}

export function BoughtSection({ items }: BoughtSectionProps) {
    const [isOpen, setIsOpen] = useState(false);
    const clearBought = useClearBought();

    if (items.length === 0) return null;

    return (
        <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center justify-between px-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(!isOpen)}
                    className="px-1.5 h-7 text-xs font-semibold text-muted-foreground hover:text-foreground gap-1.5"
                >
                    {isOpen ? <ChevronDown data-icon="inline-start" /> : <ChevronRight data-icon="inline-start" />}
                    <span>Bought</span>
                    <Badge variant="secondary" className="text-[10px] font-normal px-1.5 h-4">
                        {items.length}
                    </Badge>
                </Button>

                {isOpen && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearBought.mutate()}
                        disabled={clearBought.isPending}
                        className="h-7 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                        <Trash2 data-icon="inline-start" />
                        Clear All
                    </Button>
                )}
            </div>

            {isOpen && (
                <div className="border border-border/80 rounded-xl bg-card/60 overflow-hidden divide-y divide-border/50 shadow-2xs">
                    {items.map((item) => (
                        <ShoppingItemRow key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
}