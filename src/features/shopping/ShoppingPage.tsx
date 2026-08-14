import * as React from "react";
import { ShoppingBag } from "lucide-react";

import { useShoppingItemsQuery, useShoppingRealtime, useShoppingCategoriesQuery } from "@/features/shopping/hooks";
import type { ShoppingItem } from "@/features/shopping/types";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";

import { QuickAddBar } from "./QuickAddBar";
import { FrequentStrip } from "./FrequentStrip";
import { CategoryFilterBar } from "./CategoryFilterBar";
import { ShoppingCategoryGroup } from "./ShoppingCategoryGroup";
import { BoughtSection } from "./BoughtSection";
import { EditShoppingItemDialog } from "./EditShoppingItemDialog";

function useShoppingGroups(categoryFilter: string | null) {
    const { data: items = [], isLoading } = useShoppingItemsQuery();

    const computed = React.useMemo(() => {
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

    const [categoryFilter, setCategoryFilter] = React.useState<string | null>(null);
    const [editingItem, setEditingItem] = React.useState<ShoppingItem | null>(null);

    const { data: categories = [] } = useShoppingCategoriesQuery();
    const { groupedPending, pendingCount, bought, frequent, isLoading } = useShoppingGroups(categoryFilter);

    return (
        <div className="mx-auto flex max-w-lg flex-col gap-8 px-4 py-8 pb-28">
            {/* Header */}
            <header className="flex items-start justify-between min-w-0">
                <div className="flex flex-col min-w-0">
                    <h1 className="text-xl font-bold tracking-tight truncate leading-none">Shopping List</h1>
                    <p className="text-sm text-muted-foreground truncate mt-1.5">
                        Manage groceries and recurring household essentials.
                    </p>
                </div>
            </header>

            {/* Quick Add & Frequent Strip */}
            <section className="flex flex-col gap-3">
                <QuickAddBar />
                <FrequentStrip items={frequent} />
            </section>

            {/* Category Filter Bar */}
            {categories.length > 0 && (
                <CategoryFilterBar
                    categories={categories}
                    selectedCategory={categoryFilter}
                    onSelectCategory={setCategoryFilter}
                />
            )}

            {/* Shopping List Groups */}
            <div className="flex flex-col gap-6">
                {isLoading ? (
                    <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
                        <CardContent className="p-0 flex flex-col gap-0">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex flex-col">
                                    <div className="p-4 flex items-center justify-between">
                                        <Skeleton className="h-4 w-32 rounded-md" />
                                        <Skeleton className="h-4 w-12 rounded-md" />
                                    </div>
                                    {i < 2 && <div className="h-px bg-border/50 mx-4" />}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ) : pendingCount === 0 ? (
                    <Empty className="py-10 border border-dashed border-border/80 rounded-xl bg-card/40">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <ShoppingBag />
                            </EmptyMedia>
                            <EmptyTitle>Shopping list is clear</EmptyTitle>
                            <EmptyDescription className="max-w-[260px]">
                                Add items above or tap your frequent items to start building your cart.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    Object.entries(groupedPending).map(([catName, items]) => (
                        <ShoppingCategoryGroup
                            key={catName}
                            title={catName}
                            items={items}
                            onEdit={(item) => setEditingItem(item)}
                        />
                    ))
                )}
            </div>

            {/* Bought Archive Section */}
            <BoughtSection items={bought} onEdit={(item) => setEditingItem(item)} />

            {/* Focused Edit Dialog */}
            <EditShoppingItemDialog
                open={Boolean(editingItem)}
                onOpenChange={(open) => {
                    if (!open) setEditingItem(null);
                }}
                item={editingItem}
            />
        </div>
    );
}
