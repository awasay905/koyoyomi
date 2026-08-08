import { Link } from "@tanstack/react-router";
import { CalendarRange, ChevronLeft, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";

import { useDayTypesQuery } from "@/features/day_types/hooks";
import { useWeeklyPatternQuery, useSetWeeklyPatternDay } from "./hooks";
import { DAY_NAMES_BY_INDEX, WEEK_DISPLAY_ORDER } from "./utils";
import { DayTypeDropdown } from "./DayTypeDropdown";

export function WeeklyPatternPage() {
    const { data: dayTypes = [], isLoading: isDayTypesLoading } = useDayTypesQuery();
    const { data: pattern = [], isLoading: isPatternLoading } = useWeeklyPatternQuery();
    const setDay = useSetWeeklyPatternDay();

    const isLoading = isDayTypesLoading || isPatternLoading;
    const rowFor = (dayOfWeek: number) => pattern.find((p) => p.day_of_week === dayOfWeek) ?? null;

    return (
        <div className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-6 pb-28">
            {/* Header with Back Navigation */}
            <div className="flex items-start gap-2 min-w-0">
                <Link
                    to="/settings"
                    className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0 -ml-1.5 mt-0.5"
                    aria-label="Back to Settings"
                >
                    <ChevronLeft data-icon="inline-start" />
                </Link>

                <div className="flex flex-col gap-1 min-w-0">
                    <h1 className="text-lg font-semibold tracking-tight text-foreground">Weekly Pattern</h1>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Set a default day-type for each day of the week. Specific dates can be overridden anytime.
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col gap-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <Skeleton key={i} className="h-11 w-full rounded-xl" />
                    ))}
                </div>
            ) : dayTypes.length === 0 ? (
                <Empty className="py-10 border border-dashed border-border/80 rounded-xl bg-card/40">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <CalendarRange />
                        </EmptyMedia>
                        <EmptyTitle className="text-xs">No day-types created yet</EmptyTitle>
                        <EmptyDescription className="text-xs max-w-xs">
                            Create at least one day-type before configuring your weekly pattern.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Link to="/settings/day_types">
                            <Button size="sm" variant="outline" className="h-8 text-xs">
                                <Plus data-icon="inline-start" />
                                <span>Create a day-type</span>
                            </Button>
                        </Link>
                    </EmptyContent>
                </Empty>
            ) : (
                <div className="border border-border rounded-xl bg-card overflow-hidden divide-y divide-border/60 shadow-2xs">
                    {WEEK_DISPLAY_ORDER.map((dayOfWeek) => {
                        const row = rowFor(dayOfWeek);
                        const isPending = setDay.isPending && setDay.variables?.day_of_week === dayOfWeek;
                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                        return (
                            <div
                                key={dayOfWeek}
                                className="flex items-center justify-between px-3.5 py-2.5 gap-3 hover:bg-muted/30 transition-colors"
                            >
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-sm font-medium text-foreground">
                                        {DAY_NAMES_BY_INDEX[dayOfWeek]}
                                    </span>
                                    {isWeekend && (
                                        <span className="text-[10px] font-medium text-muted-foreground/70 bg-muted px-1.5 py-0.5 rounded uppercase tracking-wider">
                                            Weekend
                                        </span>
                                    )}
                                </div>

                                <DayTypeDropdown
                                    dayTypes={dayTypes}
                                    value={row?.day_type_id ?? null}
                                    onChange={(day_type_id) => setDay.mutate({ day_of_week: dayOfWeek, day_type_id })}
                                    disabled={isPending}
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
