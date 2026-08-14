import { Link } from "@tanstack/react-router";
import { CalendarRange, ChevronLeft, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
        <div className="mx-auto flex max-w-lg flex-col gap-8 px-4 py-8 pb-28">
            {/* Page Header */}
            <header className="flex items-start min-w-0">
                <div className="flex items-start gap-2 min-w-0 w-full">
                    <Link
                        to="/settings"
                        className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0 -ml-2 -mt-1"
                        aria-label="Back to Settings"
                    >
                        <ChevronLeft />
                    </Link>

                    <div className="flex flex-col w-full min-w-0">
                        <h1 className="text-xl font-bold tracking-tight truncate leading-none">Weekly Pattern</h1>
                        <p className="text-sm text-muted-foreground truncate mt-1.5">
                            Set default day templates for each day of the week.
                        </p>
                    </div>
                </div>
            </header>

            {/* Weekly Schedule Section */}
            <section className="flex flex-col gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                    Weekly Defaults
                </h2>

                {isLoading ? (
                    <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
                        <CardContent className="p-0 flex flex-col gap-0">
                            {Array.from({ length: 7 }).map((_, i) => (
                                <div key={i} className="flex flex-col">
                                    <div className="flex items-center justify-between p-3.5 px-4 h-14">
                                        <Skeleton className="h-4 w-28 rounded-md" />
                                        <Skeleton className="h-8 w-36 rounded-md" />
                                    </div>
                                    {i < 6 && <div className="h-px bg-border/50 mx-4" />}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ) : dayTypes.length === 0 ? (
                    <Empty className="py-12 border border-dashed border-border/80 rounded-xl bg-card/40">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <CalendarRange />
                            </EmptyMedia>
                            <EmptyTitle>No templates found</EmptyTitle>
                            <EmptyDescription className="max-w-[250px]">
                                Create at least one day template before configuring your weekly pattern.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Button size="sm" variant="outline" render={<Link to="/settings/day_types" />}>
                                <Plus data-icon="inline-start" />
                                <span>Create Template</span>
                            </Button>
                        </EmptyContent>
                    </Empty>
                ) : (
                    <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
                        <CardContent className="p-0 flex flex-col gap-0">
                            {WEEK_DISPLAY_ORDER.map((dayOfWeek, index) => {
                                const row = rowFor(dayOfWeek);
                                const isPending = setDay.isPending && setDay.variables?.day_of_week === dayOfWeek;
                                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                                return (
                                    <div key={dayOfWeek} className="flex flex-col">
                                        <div className="flex items-center justify-between p-3.5 px-4 gap-3 hover:bg-accent/40 transition-colors">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <span className="text-sm font-medium text-foreground leading-none">
                                                    {DAY_NAMES_BY_INDEX[dayOfWeek]}
                                                </span>
                                                {isWeekend && (
                                                    <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md uppercase tracking-wider select-none">
                                                        Weekend
                                                    </span>
                                                )}
                                            </div>

                                            <div className="shrink-0">
                                                <DayTypeDropdown
                                                    dayTypes={dayTypes}
                                                    value={row?.day_type_id ?? null}
                                                    onChange={(day_type_id) =>
                                                        setDay.mutate({ day_of_week: dayOfWeek, day_type_id })
                                                    }
                                                    disabled={isPending}
                                                    loading={isPending}
                                                />
                                            </div>
                                        </div>

                                        {index < WEEK_DISPLAY_ORDER.length - 1 && (
                                            <div className="h-px bg-border/50 mx-4" />
                                        )}
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                )}
            </section>
        </div>
    );
}
