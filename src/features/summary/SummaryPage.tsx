import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { WeekOverviewCard } from "./WeekOverviewCard";
import { OverdueRecurringSection } from "./OverdueRecurringSection";
import { StreaksSection } from "./StreaksSection";
import { HistoryList } from "./HistoryList";

type SummaryView = "week" | "history";

export function SummaryPage() {
    const [view, setView] = useState<SummaryView>("week");

    return (
        <div className="mx-auto flex max-w-lg flex-col gap-8 px-4 py-8 pb-28">
            {/* Header & Segmented Switcher */}
            <header className="flex flex-col gap-4">
                <div className="flex flex-col min-w-0">
                    <h1 className="text-xl font-bold tracking-tight truncate leading-none">Summary</h1>
                    <p className="text-sm text-muted-foreground truncate mt-1.5">
                        Performance analytics and execution history.
                    </p>
                </div>

                <ToggleGroup
                    value={[view]}
                    onValueChange={(val) => {
                        if (val && val.length > 0) setView(val[0] as SummaryView);
                    }}
                    className="grid grid-cols-2 w-full p-0.5 bg-muted/60 rounded-lg border border-border/60"
                >
                    <ToggleGroupItem
                        value="week"
                        className="h-8 text-xs rounded-md data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:font-medium data-[state=on]:shadow-2xs"
                    >
                        This Week
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="history"
                        className="h-8 text-xs rounded-md data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:font-medium data-[state=on]:shadow-2xs"
                    >
                        History
                    </ToggleGroupItem>
                </ToggleGroup>
            </header>

            {/* View Switching */}
            {view === "week" ? (
                <div className="flex flex-col gap-8">
                    <WeekOverviewCard />
                    <OverdueRecurringSection />
                    <StreaksSection />
                </div>
            ) : (
                <HistoryList />
            )}
        </div>
    );
}
