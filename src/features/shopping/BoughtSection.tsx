import * as React from "react";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ShoppingItem } from "./types";
import { ShoppingItemRow } from "./ShoppingItemRow";
import { useClearBought } from "./hooks";

interface BoughtSectionProps {
    items: ShoppingItem[];
    onEdit: (item: ShoppingItem) => void;
}

export function BoughtSection({ items, onEdit }: BoughtSectionProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const clearBought = useClearBought();

    if (items.length === 0) return null;

    return (
        <section className="flex flex-col gap-2 pt-2">
            <div className="flex items-center justify-between px-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(!isOpen)}
                    className="h-7 text-xs px-2 font-semibold text-muted-foreground hover:text-foreground gap-1.5"
                >
                    {isOpen ? <ChevronDown data-icon="inline-start" /> : <ChevronRight data-icon="inline-start" />}
                    <span>Bought Items ({items.length})</span>
                </Button>

                {isOpen && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearBought.mutate()}
                        disabled={clearBought.isPending}
                        className="h-7 text-xs px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                        <Trash2 data-icon="inline-start" />
                        <span>Clear All</span>
                    </Button>
                )}
            </div>

            {isOpen && (
                <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0 opacity-80">
                    <CardContent className="p-0 flex flex-col gap-0">
                        {items.map((item, index) => (
                            <ShoppingItemRow
                                key={item.id}
                                item={item}
                                onEdit={onEdit}
                                showDivider={index < items.length - 1}
                            />
                        ))}
                    </CardContent>
                </Card>
            )}
        </section>
    );
}
