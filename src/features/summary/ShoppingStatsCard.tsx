import { ShoppingCart, Tag } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useShoppingMonthStats } from "./hooks";

export function ShoppingStatsCard() {
    const { data, isLoading } = useShoppingMonthStats();
    const monthLabel = new Date().toLocaleDateString(undefined, { month: "long" });

    return (
        <Card className="border-border/80 shadow-2xs">
            <CardHeader className="py-3 px-4 border-b border-border/50 bg-card/50">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <ShoppingCart className="size-3.5 text-muted-foreground" />
                    <span>Shopping — {monthLabel}</span>
                </CardTitle>
            </CardHeader>

            <CardContent className="p-4">
                {isLoading ? (
                    <div className="grid grid-cols-2 gap-3">
                        <Skeleton className="h-14 rounded-xl" />
                        <Skeleton className="h-14 rounded-xl" />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1 p-3 rounded-xl bg-muted/40 border border-border/50">
                            <span className="text-lg font-bold font-mono text-foreground tabular-nums">
                                {data.boughtCount}
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Items bought
                            </span>
                        </div>

                        <div className="flex flex-col gap-1 p-3 rounded-xl bg-muted/40 border border-border/50">
                            <span className="text-sm font-bold text-foreground truncate flex items-center gap-1">
                                <Tag className="size-3 text-muted-foreground shrink-0" />
                                <span className="truncate">{data.topCategory?.name ?? "—"}</span>
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Top category
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
