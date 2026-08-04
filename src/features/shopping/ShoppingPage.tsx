import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";

import { useShoppingItemsQuery, useShoppingRealtime } from "@/features/shopping/hooks";
import { useShoppingCategoriesQuery } from "@/features/shopping/hooks";
import type { ShoppingItem } from "@/features/shopping/types";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { QuickAddBar } from "./QuickAddBar";
import { FrequentStrip } from "./FrequentStrip";
import { CategoryFilterBar } from "./CategoryFilterBar";
import { ShoppingCategoryGroup } from "./ShoppingCategoryGroup";
import { BoughtSection } from "./BoughtSection";

function useShoppingGroups(categoryFilter: string | null) {
    const { data: items = [], isLoading } = useShoppingItemsQuery();

    const computed = useMemo(() => {
        const filtered = categoryFilter ? items.filter((i) => i.category_id === categoryFilter) : items;
        const pending = filtered.filter((i) => i.status === "pending");
        const bought = items.filter((i) => i.status === "bought");
        const frequent = items.filter((i) => i.is_frequent);

        const groupedPending = pending.reduce<Record<string, ShoppingItem[]>>((acc, item) => {
            const key = item.category?.name ?? "Uncategorized";
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {});

        return { groupedPending, pendingCount: pending.length, bought, frequent };
    }, [items, categoryFilter]);

    return { ...computed, isLoading };
}

export function ShoppingPage() {
    useShoppingRealtime();

    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const { data: categories = [] } = useShoppingCategoriesQuery();
    const { groupedPending, pendingCount, bought, frequent, isLoading } = useShoppingGroups(categoryFilter);

    return (
        <div className="max-w-xl mx-auto px-4 py-5 flex flex-col gap-4 pb-28">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold tracking-tight">Shopping List</h1>
                    <Badge variant="secondary" className="rounded-full px-2 text-xs font-medium">
                        {pendingCount}
                    </Badge>
                </div>
            </div>

            {/* Compact Quick Add Bar */}
            <QuickAddBar />

            {/* Filter & Restock Strip */}
            <div className="flex flex-col gap-2 pt-0.5">
                <CategoryFilterBar
                    categories={categories}
                    selectedCategory={categoryFilter}
                    onSelectCategory={setCategoryFilter}
                />
                <FrequentStrip items={frequent} />
            </div>

            {/* List */}
            <div className="flex flex-col gap-4 pt-1">
                {isLoading ? (
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-14 w-full rounded-xl" />
                        <Skeleton className="h-14 w-full rounded-xl" />
                    </div>
                ) : pendingCount === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-10 px-4 border border-dashed rounded-xl bg-card/50 gap-2">
                        <div className="p-2.5 rounded-full bg-muted text-muted-foreground">
                            <Sparkles className="size-4" />
                        </div>
                        <h3 className="font-medium text-xs">All clear!</h3>
                        <p className="text-[11px] text-muted-foreground max-w-xs">
                            Add items above or tap your quick restock pills.
                        </p>
                    </div>
                ) : (
                    Object.entries(groupedPending).map(([catName, items]) => (
                        <ShoppingCategoryGroup key={catName} title={catName} items={items} />
                    ))
                )}
            </div>

            {/* Completed Section */}
            <BoughtSection items={bought} />
        </div>
    );
}