import { Card, CardContent } from "@/components/ui/card";
import type { ShoppingItem } from "./types";
import { ShoppingItemRow } from "./ShoppingItemRow";

interface ShoppingCategoryGroupProps {
    title: string;
    items: ShoppingItem[];
    onEdit: (item: ShoppingItem) => void;
}

export function ShoppingCategoryGroup({ title, items, onEdit }: ShoppingCategoryGroupProps) {
    if (items.length === 0) return null;

    return (
        <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
                <span className="text-[11px] font-mono text-muted-foreground">{items.length}</span>
            </div>

            <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
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
        </section>
    );
}
