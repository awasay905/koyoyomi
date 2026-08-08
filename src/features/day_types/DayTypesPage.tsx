import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, CalendarDays, MoreHorizontal, Pencil, Archive, ChevronRight, ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";

import type { DayType } from "./types";
import { useDayTypesQuery, useArchiveDayType } from "./hooks";
import { AddDayTypeDialog } from "./AddDayTypeDialog";

export function DayTypesPage() {
    const { data: dayTypes = [], isLoading } = useDayTypesQuery();
    const archiveDayType = useArchiveDayType();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dayTypeToEdit, setDayTypeToEdit] = useState<DayType | null>(null);

    const handleOpenCreate = () => {
        setDayTypeToEdit(null);
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (dt: DayType) => {
        setDayTypeToEdit(dt);
        setIsDialogOpen(true);
    };

    return (
        <div className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-6 pb-28">
            {/* Header Section with Back Navigation & Action Button */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 min-w-0">
                    <Link
                        to="/settings"
                        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0 -ml-1.5 mt-0.5"
                        aria-label="Back to Settings"
                    >
                        <ChevronLeft data-icon="inline-start" />
                    </Link>

                    <div className="flex flex-col gap-1 min-w-0">
                        <h1 className="text-lg font-semibold tracking-tight text-foreground">Day-Type Templates</h1>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Build reusable schedules for work, office, weekend, and custom routines.
                        </p>
                    </div>
                </div>

                <Button
                    size="sm"
                    onClick={handleOpenCreate}
                    className="h-8 px-2.5 text-xs font-medium gap-1.5 shrink-0"
                >
                    <Plus data-icon="inline-start" />
                    <span>New</span>
                </Button>
            </div>

            {isLoading ? (
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                </div>
            ) : dayTypes.length === 0 ? (
                <Empty className="py-10 border border-dashed border-border/80 rounded-xl bg-card/40">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <CalendarDays />
                        </EmptyMedia>
                        <EmptyTitle className="text-xs">No day-types created yet</EmptyTitle>
                        <EmptyDescription className="text-xs max-w-xs">
                            Create your first day-type template to start building your weekly pattern.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button size="sm" variant="outline" onClick={handleOpenCreate} className="h-8 text-xs">
                            <Plus data-icon="inline-start" />
                            <span>Create a day-type</span>
                        </Button>
                    </EmptyContent>
                </Empty>
            ) : (
                <div className="border border-border rounded-xl bg-card overflow-hidden divide-y divide-border/60 shadow-2xs">
                    {dayTypes.map((dt) => (
                        <div
                            key={dt.id}
                            className="group flex items-center justify-between px-3.5 py-3 transition-colors duration-150 hover:bg-muted/30"
                        >
                            {/* Seamless full-row click target */}
                            <Link
                                to="/settings/day_types/$dayTypeId"
                                params={{ dayTypeId: dt.id }}
                                className="flex items-center justify-between gap-3 min-w-0 flex-1 pr-2"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span
                                        className="size-3 rounded-full shrink-0 ring-1 ring-border/50"
                                        style={{ backgroundColor: dt.color ?? undefined }}
                                    />
                                    <span className="text-sm font-medium text-foreground truncate">{dt.name}</span>
                                </div>
                                <ChevronRight className="size-4 text-muted-foreground/60 shrink-0" />
                            </Link>

                            {/* Secondary Row Actions */}
                            <div className="flex items-center shrink-0">
                                <DropdownMenu>
                                    <DropdownMenuTrigger
                                        render={
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-7 text-muted-foreground hover:text-foreground opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                                aria-label="More options"
                                            />
                                        }
                                    >
                                        <MoreHorizontal />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-44">
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem onClick={() => handleOpenEdit(dt)}>
                                                <Pencil data-icon="inline-start" />
                                                <span>Edit template</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => archiveDayType.mutate(dt.id)}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Archive data-icon="inline-start" />
                                                <span>Archive</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AddDayTypeDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} dayTypeToEdit={dayTypeToEdit} />
        </div>
    );
}
