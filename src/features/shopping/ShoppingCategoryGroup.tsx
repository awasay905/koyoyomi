import type { ShoppingItem } from "./types";
import { ShoppingItemRow } from "./ShoppingItemRow";
import { Badge } from "@/components/ui/badge";

interface ShoppingCategoryGroupProps {
    title: string;
    items: ShoppingItem[];
}

export function ShoppingCategoryGroup({ title, items }: ShoppingCategoryGroupProps) {
    if (items.length === 0) return null;

    return (
        <div className="flex flex-col gap-1.5">
            {/* Category Header */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {title}
                    </h3>
                    <Badge variant="secondary" className="text-[10px] font-medium px-1.5 py-0 h-4 rounded-full">
                        {items.length}
                    </Badge>
                </div>
            </div>

            {/* Enclosed Card Container */}
            <div className="border border-border/80 rounded-xl bg-card overflow-hidden divide-y divide-border/50 shadow-2xs">
                {items.map((item) => (
                    <ShoppingItemRow key={item.id} item={item} />
                ))}
            </div>
        </div>
    );
}