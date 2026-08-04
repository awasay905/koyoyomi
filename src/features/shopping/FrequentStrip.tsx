import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ShoppingItem } from "./types";
import { useAddShoppingItem } from "./hooks";

interface FrequentStripProps {
    items: ShoppingItem[];
}

export function FrequentStrip({ items }: FrequentStripProps) {
    const addItem = useAddShoppingItem();

    const uniqueFrequents = items.reduce<ShoppingItem[]>((acc, current) => {
        if (!acc.some((item) => item.name.toLowerCase() === current.name.toLowerCase())) {
            acc.push(current);
        }
        return acc;
    }, []);

    if (uniqueFrequents.length === 0) return null;

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0 px-0.5">
                QUICK ADD:
            </span>
            <div className="flex items-center gap-1.5">
                {uniqueFrequents.map((item) => (
                    <Button
                        key={item.id}
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                            addItem.mutate({
                                name: item.name,
                                category_id: item.category_id,
                                quantity: item.quantity,
                            })
                        }
                        className="h-6.5 rounded-full text-xs shrink-0 font-normal border border-border/40 hover:border-border transition-colors px-2.5"
                    >
                        <Plus data-icon="inline-start" />
                        <span>{item.name}</span>
                        {item.quantity && (
                            <span className="text-[10px] text-muted-foreground ml-1">{item.quantity}</span>
                        )}
                    </Button>
                ))}
            </div>
        </div>
    );
}
