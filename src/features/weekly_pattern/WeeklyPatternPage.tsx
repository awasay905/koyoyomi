import { Link } from "@tanstack/react-router";
import { CalendarRange, Plus } from "lucide-react";

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
        <div className="max-w-xl mx-auto px-4 py-5 flex flex-col gap-4 pb-28">
            <div className="flex flex-col gap-1">
                <h1 className="text-xl font-bold tracking-tight">Weekly Pattern</h1>
                <p className="text-xs text-muted-foreground">
                    Set a default day-type for each weekday. Override any single date from Today or Week.
                </p>
            </div>

            {isLoading ? (
                <div className="flex flex-col gap-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <Skeleton key={i} className="h-11 w-full rounded-xl" />
                    ))}
                </div>
            ) : dayTypes.length === 0 ? (
                <Empty className="py-10 border border-dashed rounded-xl bg-card/50">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <CalendarRange />
                        </EmptyMedia>
                        <EmptyTitle className="text-xs">No day-types yet</EmptyTitle>
                        <EmptyDescription className="text-[11px] max-w-xs">
                            Create at least one day-type before setting your weekly pattern.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Link to="/settings/day_types">
                            <Button size="sm" variant="outline" className="h-7 text-xs">
                                <Plus data-icon="inline-start" />
                                <span>Create a day-type</span>
                            </Button>
                        </Link>
                    </EmptyContent>
                </Empty>
            ) : (
                <div className="border border-border/80 rounded-xl bg-card overflow-hidden divide-y divide-border/50 shadow-2xs">
                    {WEEK_DISPLAY_ORDER.map((dayOfWeek) => {
                        const row = rowFor(dayOfWeek);
                        const isPending = setDay.isPending && setDay.variables?.day_of_week === dayOfWeek;
                        return (
                            <div key={dayOfWeek} className="flex items-center justify-between px-3 py-2.5 gap-3">
                                <span className="text-xs font-medium text-foreground w-24 shrink-0">
                                    {DAY_NAMES_BY_INDEX[dayOfWeek]}
                                </span>
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
