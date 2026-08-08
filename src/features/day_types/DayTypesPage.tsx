import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, CalendarDays, MoreHorizontal, Pencil, Archive, ChevronRight } from "lucide-react";

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
        <div className="max-w-xl mx-auto px-4 py-5 flex flex-col gap-4 pb-28">
            <div className="flex flex-col gap-1">
                <h1 className="text-xl font-bold tracking-tight">Day-Type Templates</h1>
                <p className="text-xs text-muted-foreground">
                    Build reusable schedules for WFH, office, weekends & more.
                </p>
            </div>

            <Button size="sm" onClick={handleOpenCreate} className="h-8 px-2.5 text-xs font-medium gap-1.5 self-start">
                <Plus data-icon="inline-start" />
                <span>New Day-Type</span>
            </Button>

            {isLoading ? (
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-14 w-full rounded-xl" />
                    <Skeleton className="h-14 w-full rounded-xl" />
                </div>
            ) : dayTypes.length === 0 ? (
                <Empty className="py-10 border border-dashed rounded-xl bg-card/50">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <CalendarDays />
                        </EmptyMedia>
                        <EmptyTitle className="text-xs">No day-types yet</EmptyTitle>
                        <EmptyDescription className="text-[11px] max-w-xs">
                            Create your first day-type template — like WFH or Weekend — to start building your schedule.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button size="sm" variant="outline" onClick={handleOpenCreate} className="h-7 text-xs">
                            <Plus data-icon="inline-start" />
                            <span>New Day-Type</span>
                        </Button>
                    </EmptyContent>
                </Empty>
            ) : (
                <div className="border border-border/80 rounded-xl bg-card overflow-hidden divide-y divide-border/50 shadow-2xs">
                    {dayTypes.map((dt) => (
                        <div
                            key={dt.id}
                            className="group flex items-center justify-between px-3 py-3 transition-colors duration-150 hover:bg-muted/40"
                        >
                            <Link
                                to="/settings/day_types/$dayTypeId"
                                params={{ dayTypeId: dt.id }}
                                className="flex items-center gap-3 min-w-0 flex-1"
                            >
                                <span
                                    className="size-3 rounded-full shrink-0 ring-1 ring-border/50"
                                    style={{ backgroundColor: dt.color ?? undefined }}
                                />
                                <span className="text-xs font-medium text-foreground truncate">{dt.name}</span>
                            </Link>

                            <div className="flex items-center gap-1 shrink-0">
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
                                                Rename / recolour
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => archiveDayType.mutate(dt.id)}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Archive data-icon="inline-start" />
                                                Archive
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <Link to="/settings/day_types/$dayTypeId" params={{ dayTypeId: dt.id }}>
                                    <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AddDayTypeDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} dayTypeToEdit={dayTypeToEdit} />
        </div>
    );
}
