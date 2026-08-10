import { useState } from "react";
import { BarChart2 } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { WeekOverviewCard } from "./WeekOverviewCard";
import { OverdueRecurringSection } from "./OverdueRecurringSection";
import { StreaksSection } from "./StreaksSection";
import { ShoppingStatsCard } from "./ShoppingStatsCard";
import { HistoryList } from "./HistoryList";

type SummaryView = "week" | "history";

export function SummaryPage() {
    const [view, setView] = useState<SummaryView>("week");

    return (
        <div className="max-w-xl mx-auto px-4 py-5 flex flex-col gap-4 pb-28">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BarChart2 className="size-5 text-muted-foreground shrink-0" />
                    <h1 className="text-xl font-bold tracking-tight">Summary</h1>
                </div>
            </div>

            <ToggleGroup
                value={[view]}
                onValueChange={(val) => {
                    if (val && val.length > 0) setView(val[0] as SummaryView);
                }}
                className="grid grid-cols-2 w-full p-1 bg-muted/70 rounded-lg border border-border/60 gap-1"
            >
                <ToggleGroupItem
                    value="week"
                    className="h-7 text-xs text-muted-foreground rounded-md transition-colors aria-pressed:bg-foreground aria-pressed:text-background aria-pressed:font-semibold aria-pressed:shadow-xs data-pressed:bg-foreground data-pressed:text-background data-[state=on]:bg-foreground data-[state=on]:text-background"
                >
                    This Week
                </ToggleGroupItem>
                <ToggleGroupItem
                    value="history"
                    className="h-7 text-xs text-muted-foreground rounded-md transition-colors aria-pressed:bg-foreground aria-pressed:text-background aria-pressed:font-semibold aria-pressed:shadow-xs data-pressed:bg-foreground data-pressed:text-background data-[state=on]:bg-foreground data-[state=on]:text-background"
                >
                    History
                </ToggleGroupItem>
            </ToggleGroup>

            {view === "week" ? (
                <div className="flex flex-col gap-4">
                    <WeekOverviewCard />
                    <OverdueRecurringSection />
                    <StreaksSection />
                    <ShoppingStatsCard />
                </div>
            ) : (
                <HistoryList />
            )}
        </div>
    );
}
