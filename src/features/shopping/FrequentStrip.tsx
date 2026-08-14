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
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-0.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0 px-1">
                Frequent:
            </span>
            <div className="flex items-center gap-1.5">
                {uniqueFrequents.map((item) => (
                    <Button
                        key={item.id}
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            addItem.mutate({
                                name: item.name,
                                category_id: item.category_id,
                                quantity: item.quantity,
                            })
                        }
                        className="h-7 text-xs rounded-full px-2.5 shrink-0 font-normal border-border/80 hover:bg-accent gap-1"
                    >
                        <Plus data-icon="inline-start" />
                        <span>{item.name}</span>
                        {item.quantity && (
                            <span className="text-[10px] font-mono text-muted-foreground ml-0.5">{item.quantity}</span>
                        )}
                    </Button>
                ))}
            </div>
        </div>
    );
}
